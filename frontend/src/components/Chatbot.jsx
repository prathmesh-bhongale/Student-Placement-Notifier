import { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, X } from 'lucide-react';
import api from '../utils/api.js';

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([{ from: 'bot', text: 'Hi! 👋 Ask me about eligibility, applying or your profile.' }]);
  const endRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, open]);

  const send = async (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;
    setMessages((m) => [...m, { from: 'user', text }]);
    setInput('');
    setLoading(true);
    try {
      const { data } = await api.post('/chatbot', { message: text });
      setMessages((m) => [...m, { from: 'bot', text: data.data.reply }]);
    } catch {
      setMessages((m) => [...m, { from: 'bot', text: 'Sorry, I could not reach the server.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-40">
      {open && (
        <div className="mb-3 flex h-96 w-80 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
          <div className="flex items-center justify-between bg-indigo-600 px-4 py-3 text-white">
            <span className="font-medium">Placement Assistant</span>
            <button onClick={() => setOpen(false)} aria-label="Close chat"><X className="h-4 w-4" /></button>
          </div>
          <div className="flex-1 space-y-2 overflow-y-auto p-3 text-sm">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                <span className={`max-w-[85%] rounded-lg px-3 py-2 ${m.from === 'user' ? 'bg-indigo-600 text-white' : 'bg-slate-100'}`}>{m.text}</span>
              </div>
            ))}
            <div ref={endRef} />
          </div>
          <form onSubmit={send} className="flex gap-2 border-t border-slate-200 p-2">
            <input className="input" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type a message…" maxLength={500} />
            <button className="btn-primary !px-3" disabled={loading} aria-label="Send"><Send className="h-4 w-4" /></button>
          </form>
        </div>
      )}
      <button onClick={() => setOpen((o) => !o)} className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-600 text-white shadow-lg hover:bg-indigo-700" aria-label="Open chat">
        <MessageCircle className="h-6 w-6" />
      </button>
    </div>
  );
}
