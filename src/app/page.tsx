'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.push('/dashboard');
      }
    };
    checkSession();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push('/dashboard');
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: name } }
        });
        if (error) throw error;
        router.push('/dashboard');
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message || 'An error occurred during authentication.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      
      {/* Visual / Branding Side */}
      <div className="md:w-[55%] relative flex flex-col justify-center px-8 lg:px-16 py-12 bg-brand-bg">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-bg/90 via-brand-bg/60 to-transparent z-10"></div>
          {/* Using a fresh vegetable background image */}
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1498837167922-41ccf6fbbc8c?auto=format&fit=crop&q=80')] bg-cover bg-center mix-blend-multiply opacity-40"></div>
        </div>

        <div className="relative z-20 max-w-xl">
           <Link href="/" className="inline-flex items-center gap-1.5 mb-10 bg-white/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/50">
             <span className="font-heading text-xl font-bold tracking-tight text-brand-dark">
               Waste<span className="text-brand">Less</span>
             </span>
           </Link>

           <h1 className="text-5xl lg:text-6xl font-extrabold font-heading tracking-tight text-brand-dark mb-6 leading-[1.1]">
             Welcome to<br/>WasteLess 🌱
           </h1>
           <p className="text-lg text-stone-700 mb-10 max-w-md font-medium">
             Kelola makananmu dengan pintar, hidup lebih sehat, dan lebih hemat untuk bumi yang lebih baik.
           </p>

           <div className="flex gap-4 hidden md:flex">
              <div className="w-16 h-1 bg-brand rounded-full"></div>
              <div className="w-4 h-1 bg-brand/30 rounded-full"></div>
              <div className="w-4 h-1 bg-brand/30 rounded-full"></div>
           </div>
        </div>
      </div>

      {/* Form Side */}
      <div className="md:w-[45%] bg-white flex flex-col justify-center px-8 lg:px-16 py-12 relative shadow-[-20px_0_40px_rgba(0,0,0,0.05)] rounded-t-[40px] md:rounded-t-none md:rounded-l-[40px] -mt-8 md:-mt-0 md:-ml-8 z-30">
        
        <div className="w-full max-w-md mx-auto">
          <div className="flex gap-8 border-b border-stone-200 mb-8">
            <button 
              onClick={() => { setIsLogin(true); setError(null); }}
              className={`pb-4 text-xl font-bold font-heading transition-colors relative ${isLogin ? 'text-brand-dark' : 'text-stone-400 hover:text-stone-600'}`}
            >
              Log In
              {isLogin && <span className="absolute bottom-0 left-0 w-full h-1 bg-brand rounded-t-full"></span>}
            </button>
            <button 
              onClick={() => { setIsLogin(false); setError(null); }}
              className={`pb-4 text-xl font-bold font-heading transition-colors relative ${!isLogin ? 'text-brand-dark' : 'text-stone-400 hover:text-stone-600'}`}
            >
              Sign Up
              {!isLogin && <span className="absolute bottom-0 left-0 w-full h-1 bg-brand rounded-t-full"></span>}
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-stone-700">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 border border-stone-200 rounded-2xl bg-stone-50 text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand focus:bg-white transition-all"
                  placeholder="Enter your name"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-stone-700">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-stone-200 rounded-2xl bg-stone-50 text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand focus:bg-white transition-all"
                placeholder="name@email.com"
              />
            </div>

            <div className="space-y-1.5">
               <div className="flex justify-between items-center">
                 <label className="text-sm font-semibold text-stone-700">Password</label>
                 {isLogin && <a href="#" className="text-xs font-semibold text-stone-400 hover:text-brand">Lupa Password?</a>}
               </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-stone-200 rounded-2xl bg-stone-50 text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand focus:bg-white transition-all"
                placeholder="••••••••"
              />
            </div>

            {!isLogin && (
              <p className="text-[11px] text-stone-500 mt-2">
                Dengan mendaftar, kamu setuju dengan <a href="#" className="font-bold text-brand hover:underline">Ketentuan Layanan</a> & <a href="#" className="font-bold text-brand hover:underline">Kebijakan Privasi</a>.
              </p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-brand-dark text-white font-bold py-3.5 px-4 rounded-2xl hover:bg-brand focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed mt-6 shadow-lg shadow-brand/20"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                isLogin ? 'Masuk' : 'Daftar'
              )}
            </button>
          </form>

          {isLogin && (
            <div className="mt-8">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-stone-200"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-2 bg-white text-stone-400 font-medium">Atau sambungkan dengan</span>
                </div>
              </div>
              
              <div className="mt-6 grid grid-cols-2 gap-4">
                <button className="flex items-center justify-center gap-2 w-full px-4 py-2.5 border border-stone-200 rounded-2xl hover:bg-stone-50 transition-colors text-sm font-semibold text-stone-700">
                  <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="#EA4335" d="M5.266 9.765A7.077 7.077 0 0112 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.27 0 3.198 2.698 1.24 6.65l4.026 3.115z"/><path fill="#34A853" d="M16.04 18.013c-1.09.703-2.474 1.078-4.04 1.078a7.077 7.077 0 01-6.723-4.823l-4.04 3.067A11.965 11.965 0 0012 24c2.933 0 5.735-1.043 7.834-3l-3.793-2.987z"/><path fill="#4A90E2" d="M19.834 21c2.195-2.048 3.62-5.096 3.62-9 0-.71-.109-1.473-.272-2.182H12v4.637h6.436c-.317 1.559-1.17 2.766-2.395 3.558L19.834 21z"/><path fill="#FBBC05" d="M5.277 14.268A7.12 7.12 0 014.909 12c0-.782.125-1.533.357-2.235L1.24 6.65A11.934 11.934 0 000 12c0 1.92.445 3.73 1.237 5.335l4.04-3.067z"/></svg>
                  Google
                </button>
                <button className="flex items-center justify-center gap-2 w-full px-4 py-2.5 border border-stone-200 rounded-2xl hover:bg-stone-50 transition-colors text-sm font-semibold text-stone-700">
                  <svg className="w-4 h-4 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                  Facebook
                </button>
              </div>
            </div>
          )}

        </div>
      </div>

    </div>
  );
}
