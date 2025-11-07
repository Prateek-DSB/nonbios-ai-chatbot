'use client';
import {useState,FormEvent} from 'react';
import {useRouter} from 'next/navigation';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Sparkles} from 'lucide-react';
export default function Login(){
const r=useRouter();const [u,sU]=useState('');const [p,sP]=useState('');const [e,sE]=useState('');const [l,sL]=useState(false);
const submit=(v:FormEvent)=>{v.preventDefault();sE('');sL(true);if({'abc1':'xyz1','abc2':'xyz2','abc3':'xyz3','abc4':'xyz4','abc5':'xyz5'}[u]===p){localStorage.setItem('nonbios_user',u);setTimeout(()=>r.push('/portal'),100);}else{sE('Invalid');sL(false);}};
return <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4"><div className="w-full max-w-md"><div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8"><div className="text-center mb-8"><div className="inline-flex w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl mb-4 items-center justify-center"><Sparkles className="h-8 w-8 text-white"/></div><h1 className="text-3xl font-bold text-white mb-2">Welcome</h1></div><form onSubmit={submit} className="space-y-4"><Input value={u} onChange={e=>sU(e.target.value)} placeholder="Username" required className="bg-white/5 border-white/10 text-white h-12"/><Input type="password" value={p} onChange={e=>sP(e.target.value)} placeholder="Password" required className="bg-white/5 border-white/10 text-white h-12"/>{e&&<div className="bg-red-500/10 border border-red-500/50 rounded p-2 text-red-400 text-sm">{e}</div>}<Button type="submit" className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white h-12" disabled={l}>{l?'...':'Sign In'}</Button><p className="text-center text-xs text-slate-500">abc1/xyz1</p></form></div></div></div>;
}
