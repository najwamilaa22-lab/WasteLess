'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, Sparkles, Utensils, BookOpen, BarChart2, Calendar, ChevronRight, Leaf, Info, Droplets } from 'lucide-react';
import Link from 'next/link';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function AIAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hai! 👋 Aku WasteLess AI, teman pintarmu untuk hidup lebih hemat, sehat, dan minim food waste. Ada yang bisa aku bantu hari ini?' }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userMsg = inputMessage.trim();
    setInputMessage('');
    const newMessages = [...messages, { role: 'user', content: userMsg } as Message];
    setMessages(newMessages);
    setChatLoading(true);

    try {
      const res = await fetch('/api/chat-core', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages })
      });
      const data = await res.json();
      if (data.success && data.choices && data.choices.length > 0) {
        setMessages([...newMessages, data.choices[0].message]);
      } else {
        setMessages([...newMessages, { role: 'assistant', content: 'Maaf, aku sedang tidak bisa merespon saat ini. Coba lagi nanti ya!' }]);
      }
    } catch (e) {
      setMessages([...newMessages, { role: 'assistant', content: 'Maaf, koneksiku sedang terganggu. Coba lagi nanti ya!' }]);
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div className="flex bg-brand-bg min-h-[calc(100vh-80px)]">
      
      {/* Left Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col justify-between border-r border-stone-200 bg-[#F4F6F0] p-6 sticky top-[80px] h-[calc(100vh-80px)]">
        <div>
           <div className="mb-8">
             <h2 className="text-sm font-bold text-stone-500 font-heading">WasteLess</h2>
             <h1 className="text-xl font-bold text-brand-dark flex items-center gap-1 font-heading">
               AI Assistant <Sparkles className="w-4 h-4 text-amber-400" />
             </h1>
             <p className="text-xs text-stone-500 mt-2">Teman pintar kamu untuk hidup lebih hemat & minim food waste</p>
           </div>
           
           <div className="flex justify-center mb-8">
             {/* Character illustration placeholder */}
             <div className="w-32 h-32 bg-brand-light/30 rounded-full flex items-center justify-center border-4 border-white shadow-sm">
               <div className="w-20 h-20 bg-brand text-white rounded-full flex items-center justify-center relative shadow-inner">
                 <span className="text-2xl">👀</span>
                 <div className="absolute top-0 -mt-2 w-4 h-6 bg-brand rounded-full rotate-45"></div>
               </div>
             </div>
           </div>

           <nav className="space-y-1">
             <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-brand/10 text-brand-dark font-bold text-sm">
               <MessageSquare className="w-4 h-4" /> Chat dengan AI
             </button>
             <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-stone-600 hover:bg-stone-200/50 font-medium text-sm transition-colors">
               <Utensils className="w-4 h-4" /> Resep dari Stok
             </button>
             <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-stone-600 hover:bg-stone-200/50 font-medium text-sm transition-colors">
               <BookOpen className="w-4 h-4" /> Tips & Edukasi
             </button>
             <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-stone-600 hover:bg-stone-200/50 font-medium text-sm transition-colors">
               <BarChart2 className="w-4 h-4" /> Analisis Pemborosan
             </button>
             <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-stone-600 hover:bg-stone-200/50 font-medium text-sm transition-colors">
               <Calendar className="w-4 h-4" /> Rencana Mingguan
             </button>
           </nav>
        </div>

        <div className="mt-8 bg-brand/5 p-4 rounded-xl border border-brand/10">
          <p className="text-xs font-bold text-brand-dark flex items-center gap-1"><Leaf className="w-3 h-3"/> Bersama AI,</p>
          <p className="text-xs text-stone-600 mt-1">kita bisa lebih bijak mengelola makanan setiap hari.</p>
          <p className="text-[10px] font-bold text-brand mt-2">#SaveFood #BetterFuture</p>
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col h-[calc(100vh-80px)] bg-white max-w-4xl border-r border-stone-200 shadow-[0_0_40px_rgba(0,0,0,0.03)] z-10">
        
        {messages.length === 1 && (
          <div className="p-8 pb-4 animate-fade-in border-b border-stone-100">
            <h2 className="text-2xl font-bold font-heading text-brand-dark mb-2">Hai! 👋</h2>
            <h1 className="text-4xl font-extrabold font-heading text-brand-dark mb-4 leading-tight">
              Ada yang bisa <br/>dibantu hari ini?
            </h1>
            <p className="text-stone-500 mb-6 max-w-md">Tanya apa saja tentang stok, resep, cara simpan, atau tips hemat makanan. Aku siap bantu! 💚</p>
            
            <div className="flex flex-wrap gap-2">
              <span className="text-xs font-bold text-stone-900 mb-2 w-full">Coba tanya ini:</span>
              <button onClick={() => setInputMessage("Buatkan resep mudah dari stok yang ada")} className="px-4 py-2 bg-[#F6F8EC] text-brand-dark font-medium text-sm rounded-full border border-brand/10 hover:bg-brand/10 transition-colors flex items-center gap-2">
                🍜 Resep dari stok
              </button>
              <button onClick={() => setInputMessage("Cara simpan sayur agar tahan 2 minggu")} className="px-4 py-2 bg-[#F6F8EC] text-brand-dark font-medium text-sm rounded-full border border-brand/10 hover:bg-brand/10 transition-colors flex items-center gap-2">
                🥬 Cara simpan sayuran
              </button>
              <button onClick={() => setInputMessage("Bahan apa yang hampir basi di kulkas?")} className="px-4 py-2 bg-[#FFF0F0] text-red-900 font-medium text-sm rounded-full border border-red-100 hover:bg-red-50 transition-colors flex items-center gap-2">
                ⚠️ Bahan hampir basi?
              </button>
            </div>
          </div>
        )}

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-[#E8F0EA] flex items-center justify-center text-brand mr-3 flex-shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
              )}
              <div className={`max-w-[80%] rounded-2xl p-4 text-sm leading-relaxed ${
                msg.role === 'user' 
                  ? 'bg-[#E8F0EA] text-brand-dark font-medium rounded-tr-sm' 
                  : 'bg-white border border-stone-100 shadow-sm text-stone-700 font-medium rounded-tl-sm'
              }`}>
                {msg.role === 'assistant' && <p className="text-[10px] font-bold text-brand mb-1">WasteLess AI</p>}
                {msg.content}
              </div>
            </div>
          ))}
          {chatLoading && (
            <div className="flex justify-start">
               <div className="w-8 h-8 rounded-full bg-[#E8F0EA] flex items-center justify-center text-brand mr-3 flex-shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
              <div className="bg-white border border-stone-100 shadow-sm rounded-2xl rounded-tl-sm p-4 text-sm">
                <div className="flex space-x-1.5 h-4 items-center">
                  <div className="w-1.5 h-1.5 bg-stone-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-1.5 h-1.5 bg-stone-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-1.5 h-1.5 bg-stone-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input */}
        <div className="p-4 bg-white border-t border-stone-100">
          <form onSubmit={handleSendMessage} className="relative flex items-center">
            <input
              type="text"
              value={inputMessage}
              onChange={e => setInputMessage(e.target.value)}
              placeholder="Ketik pertanyaanmu di sini..."
              className="w-full rounded-full border border-stone-200 bg-stone-50 pl-6 pr-14 py-4 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand focus:bg-white transition-all"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || chatLoading}
              className="absolute right-2 flex h-10 w-10 items-center justify-center rounded-full bg-brand hover:bg-brand-dark text-white shadow-sm transition-colors disabled:opacity-50 disabled:bg-stone-300"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
          <div className="flex gap-4 mt-3 px-4 justify-center">
             <button className="flex items-center gap-1.5 text-[11px] font-bold text-stone-400 hover:text-stone-700 transition-colors">
               <Utensils className="w-3 h-3"/> Resep dari stok
             </button>
             <button className="flex items-center gap-1.5 text-[11px] font-bold text-stone-400 hover:text-stone-700 transition-colors">
               <Info className="w-3 h-3"/> Tips penyimpanan
             </button>
             <button className="flex items-center gap-1.5 text-[11px] font-bold text-stone-400 hover:text-stone-700 transition-colors">
               <Droplets className="w-3 h-3"/> Cara hemat
             </button>
          </div>
        </div>
      </main>

      {/* Right Sidebar */}
      <aside className="hidden xl:block w-80 flex-shrink-0 bg-brand-bg p-6 space-y-6 overflow-y-auto h-[calc(100vh-80px)]">
        
        {/* Ringkasan Stok */}
        <div className="bg-white rounded-2xl p-5 border border-stone-100 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-stone-900">Ringkasan Stok Kamu</h3>
            <Link href="/inventory" className="text-[10px] font-bold text-brand hover:underline">Lihat Semua</Link>
          </div>
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <p className="text-sm font-medium text-stone-500 mb-1">Belum ada stok</p>
            <p className="text-xs text-stone-400">Tambahkan bahan di My Kitchen.</p>
          </div>
        </div>

        {/* Insight AI */}
        <div className="bg-white rounded-2xl p-5 border border-stone-100 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-center mb-4 relative z-10">
            <h3 className="font-bold text-stone-900">Insight dari AI</h3>
            <span className="text-[10px] font-bold text-stone-500 bg-stone-100 px-2 py-1 rounded-md">Minggu Ini</span>
          </div>
          <p className="text-sm text-stone-600 relative z-10 leading-relaxed">
            Belum ada data cukup untuk menganalisis potensi penghematanmu. Mulai catat stokmu!
          </p>
        </div>

        {/* Tips Hari Ini */}
        <div className="bg-white rounded-2xl p-5 border border-stone-100 shadow-sm">
           <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold text-stone-900">Tips Hari Ini</h3>
            <span className="text-[10px] font-bold text-red-500 bg-red-50 border border-red-100 px-2 py-1 rounded-md">Baru</span>
          </div>
          <p className="text-sm text-stone-600 leading-relaxed mb-3">
            Simpan daun hijau dengan dibungkus tisu dan dimasukkan ke wadah kedap udara agar lebih tahan segar.
          </p>
          <Link href="/learn" className="text-[11px] font-bold text-brand flex items-center gap-1">
            Lihat Tips Lainnya <ChevronRight className="w-3 h-3"/>
          </Link>
        </div>

        {/* Aksi Berdampak */}
        <div className="bg-white rounded-2xl p-5 border border-stone-100 shadow-sm">
           <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-stone-900">Aksi Berdampak</h3>
            <span className="text-[10px] font-bold text-stone-500 bg-stone-100 px-2 py-1 rounded-md">Bulan Ini</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-500 flex-shrink-0">
              🌍
            </div>
            <div>
              <p className="text-[11px] text-stone-500 mb-1">Kamu sudah menyelamatkan</p>
              <p className="font-bold text-stone-800 text-sm">0 kg makanan</p>
              <p className="text-[11px] text-stone-500">dari terbuang. Teruskan! 🌱</p>
            </div>
          </div>
        </div>

      </aside>

    </div>
  );
}
