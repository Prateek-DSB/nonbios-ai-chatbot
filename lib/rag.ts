import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface Chunk {
  index: number;
  text: string;
  embedding?: number[];
}

interface RAGResponse {
  answer: string;
  citations: number[];
  context: Array<{ index: number; text: string }>;
}

// Cache for embeddings to avoid recomputing
let faqChunks: Chunk[] | null = null; // Reset cache to force reload of updated FAQ

function chunkText(text: string, maxTokens: number = 900, overlap: number = 120): string[] {
  // Simple chunking by sentences/paragraphs
  const paragraphs = text.split('\n\n').filter(p => p.trim().length > 0);
  const chunks: string[] = [];
  let currentChunk = '';
  
  for (const paragraph of paragraphs) {
    // Rough token estimation (1 token ≈ 4 characters)
    const estimatedTokens = (currentChunk + paragraph).length / 4;
    
    if (estimatedTokens > maxTokens && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
      
      // Add overlap from the end of current chunk
      const words = currentChunk.split(' ');
      const overlapWords = words.slice(-Math.floor(overlap / 4));
      currentChunk = overlapWords.join(' ') + ' ' + paragraph;
    } else {
      currentChunk += (currentChunk ? '\n\n' : '') + paragraph;
    }
  }
  
  if (currentChunk.trim().length > 0) {
    chunks.push(currentChunk.trim());
  }
  
  return chunks;
}

async function loadAndEmbedFAQ(): Promise<Chunk[]> {
  if (faqChunks) {
    return faqChunks;
  }
  
  try {
    const faqPath = path.join(process.cwd(), 'data', 'faq.txt');
    const faqContent = fs.readFileSync(faqPath, 'utf-8');
    
    const textChunks = chunkText(faqContent);
    
    // Generate embeddings for all chunks
    const embeddingPromises = textChunks.map(async (chunk, index) => {
      const response = await openai.embeddings.create({
        model: process.env.EMBEDDING_MODEL || 'text-embedding-3-small',
        input: chunk,
      });
      
      return {
        index,
        text: chunk,
        embedding: response.data[0].embedding,
      };
    });
    
    faqChunks = await Promise.all(embeddingPromises);
    return faqChunks;
  } catch (error) {
    console.error('Error loading FAQ:', error);
    throw new Error('Failed to load FAQ data');
  }
}

function cosineSimilarity(a: number[], b: number[]): number {
  const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  return dotProduct / (magnitudeA * magnitudeB);
}

async function retrieveRelevantChunks(query: string, topK: number = 5): Promise<Chunk[]> {
  const chunks = await loadAndEmbedFAQ();
  
  // Generate embedding for the query
  const queryResponse = await openai.embeddings.create({
    model: process.env.EMBEDDING_MODEL || 'text-embedding-3-small',
    input: query,
  });
  
  const queryEmbedding = queryResponse.data[0].embedding;
  
  // Calculate similarities and sort
  const similarities = chunks.map(chunk => ({
    ...chunk,
    similarity: cosineSimilarity(queryEmbedding, chunk.embedding!),
  }));
  
  similarities.sort((a, b) => b.similarity - a.similarity);
  
  return similarities.slice(0, topK);
}

export async function generateRAGResponse(query: string): Promise<RAGResponse> {
  try {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured');
    }
    
    // Retrieve relevant chunks
    const relevantChunks = await retrieveRelevantChunks(query);
    
    // Build context from top chunks
    const context = relevantChunks.map((chunk, i) => 
      `[${i + 1}] ${chunk.text}`
    ).join('\n\n');
    
    // Generate response using GPT
    const systemPrompt = `You are a helpful assistant that answers questions strictly based on the provided context. 
If the answer cannot be found in the context, respond with: "I don't know based on the provided knowledge."
When you use information from the context, include citation numbers like [1], [2], etc. that correspond to the context chunks.`;
    
    const userPrompt = `Context:
${context}

Question: ${query}

Please provide a helpful answer based only on the context above.`;
    
    const completion = await openai.chat.completions.create({
      model: process.env.CHAT_MODEL || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.2,
      max_tokens: 500,
    });
    
    const answer = completion.choices[0].message.content || 'No response generated';
    
    // Extract citation numbers from the answer
    const citationMatches = answer.match(/\[(\d+)\]/g) || [];
    const citations = citationMatches
      .map(match => parseInt(match.replace(/[\[\]]/g, '')))
      .filter((num, index, arr) => arr.indexOf(num) === index) // Remove duplicates
      .sort((a, b) => a - b);
    
    return {
      answer,
      citations,
      context: relevantChunks.map(chunk => ({
        index: chunk.index,
        text: chunk.text,
      })),
    };
  } catch (error) {
    console.error('RAG Error:', error);
    throw error;
  }
}
