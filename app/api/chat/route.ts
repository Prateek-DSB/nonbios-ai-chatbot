import {NextResponse} from 'next/server';
import OpenAI from 'openai';
const openai=new OpenAI({apiKey:process.env.OPENAI_API_KEY});
const FAQ=`Q: Create account? A: Visit homepage, Sign Up, verify email. Q: Forgot password? A: Click Forgot Password, reset via email. Q: Social login? A: Yes, Google/LinkedIn. Q: Portfolio content? A: AI projects, case studies. Q: AI demos? A: Yes, interactive demos. Q: Request demo? A: Use Request Demo form. Q: Subscription? A: Basic free, premium on request. Q: Payment? A: Cards, UPI, invoicing. Q: Invoice? A: Auto-emailed. Q: Site issues? A: Clear cache, contact support@nonbios.ai. Q: No email? A: Check spam. Q: Support? A: support@nonbios.ai. Q: Security? A: SSL, GDPR. Q: Data sharing? A: No. Q: Delete account? A: Contact support, 7 days.`;
export async function POST(req:Request){
try{const {query}=await req.json();
const completion=await openai.chat.completions.create({model:'gpt-4o-mini',messages:[{role:'system',content:"Answer from FAQ. If not in FAQ, say: I don't know based on the provided knowledge."},{role:'user',content:`FAQ:\n${FAQ}\n\nQ: ${query}`}],temperature:0.2,max_tokens:200});
return NextResponse.json({answer:completion.choices[0].message.content});
}catch(e){return NextResponse.json({error:'Failed'},{status:500});}
}
