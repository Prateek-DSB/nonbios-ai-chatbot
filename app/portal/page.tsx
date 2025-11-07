'use client';
import {useEffect,useState} from 'react';
import {useRouter} from 'next/navigation';
export default function Portal(){
const router=useRouter();const [user,setU]=useState('');const [msgs,setM]=useState([]);const [input,setI]=useState('');const [load,setL]=useState(false);
useEffect(()=>{const u=localStorage.getItem('nonbios_user');if(!u)router.push('/login');else setU(u);},[]);
const send=async()=>{if(!input||load)return;setM(p=>[...p,{r:'user',c:input}]);const q=input;setI('');setL(true);try{const res=await fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({query:q})});const d=await res.json();setM(p=>[...p,{r:'ai',c:d.answer||'Error'}]);}catch{setM(p=>[...p,{r:'ai',c:'Error'}]);}setL(false);};
if(!user)return <p>Loading...</p>;
return <div className="h-screen flex flex-col"><div className="border-b p-4 flex justify-between"><h1>Portal</h1><button onClick={()=>{localStorage.clear();router.push('/login');}}>Logout</button></div><div className="flex-1 flex flex-col p-4"><div className="flex-1 overflow-auto space-y-2">{msgs.map((m,i)=><div key={i} className={m.r==='user'?'text-right':'text-left'}><span className={`inline-block p-2 rounded ${m.r==='user'?'bg-blue-500 text-white':'bg-gray-100'}`}>{m.c}</span></div>)}</div><div className="flex gap-2 mt-4"><input value={input} onChange={e=>setI(e.target.value)} onKeyDown={e=>e.key==='Enter'&&send()} className="flex-1 p-2 border rounded" placeholder="Ask..."/><button onClick={send} className="px-4 bg-black text-white rounded">Send</button></div></div></div>;
}
