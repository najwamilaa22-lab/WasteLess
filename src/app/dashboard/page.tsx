'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Camera, ArrowRight, ShieldCheck, Wallet, Flame, AlertCircle, Plus, ChevronRight, BookOpen, Sparkles } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function Home() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data } = await supabase
          .from('pantry_assets')
          .select('*')
          .eq('user_id', session.user.id);
        if (data) setItems(data);
      }
      setLoading(false);
    };
    init();
  }, []);

  const totalValue = items.reduce((acc, curr) => acc + Number(curr.purchase_price), 0);
  const criticalItems = items.filter(i => i.status === 'Kritis');
  const criticalValue = criticalItems.reduce((acc, curr) => acc + Number(curr.purchase_price), 0);

  return (
    <div className="min-h-screen bg-brand-bg">
      
      {/* Hero Section */}
      <section className="relative mx-auto max-w-[1400px] px-6 lg:px-8 pt-12 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="max-w-2xl z-10">
            <h1 className="font-heading text-5xl font-extrabold tracking-tight text-brand-dark sm:text-6xl md:text-7xl leading-[1.1]">
              Small choices,<br/>
              <span className="text-brand">big impact.</span>
            </h1>
            
            <p className="mt-6 text-lg text-stone-600 font-medium max-w-md">
              Kelola makananmu dengan lebih cerdas.
              Sehat untuk kamu, baik untuk bumi, hemat untuk dompet.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href="/inventory"
                className="flex items-center gap-2 rounded-full bg-brand-dark px-6 py-3.5 text-sm font-semibold text-white hover:bg-brand transition-colors"
              >
                Mulai Jelajah
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/inventory?scan=true"
                className="flex items-center gap-2 rounded-full border border-stone-200 bg-white px-6 py-3.5 text-sm font-semibold text-stone-700 hover:bg-stone-50 transition-colors"
              >
                <Camera className="h-4 w-4 text-stone-500" />
                Scan Struk Belanja
              </Link>
            </div>
          </div>

          <div className="relative hidden lg:block h-[400px]">
            {/* Using a placeholder for the hero image, with glassmorphism card floating over it */}
            <div className="absolute inset-0 bg-brand-light/20 rounded-3xl overflow-hidden">
               <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-80 mix-blend-multiply"></div>
            </div>
            
            {/* Floating Stats Card */}
            <div className="absolute -left-12 top-12 glass-panel p-4 rounded-2xl shadow-xl flex flex-col gap-1 max-w-[200px] animate-fade-in">
              <p className="text-xs text-stone-600">Total Nilai Kulkas</p>
              <p className="text-xl font-bold text-brand-dark">Rp {totalValue.toLocaleString('id-ID')}</p>
              <p className="text-xs text-brand font-medium">tersimpan aman 💚</p>
            </div>
          </div>
        </div>
      </section>

      {/* Ringkasan Hari Ini */}
      <section className="mx-auto max-w-[1400px] px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-stone-900 font-heading">Ringkasan Hari Ini</h2>
          <Link href="/dashboard" className="text-sm font-medium text-stone-500 hover:text-brand flex items-center gap-1">
            Lihat Detail <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          
          {/* Budget */}
          <div className="rounded-3xl border border-brand-light/30 bg-brand-cream/30 p-6 flex flex-col justify-between">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-dark text-white">
                <Wallet className="h-5 w-5" />
              </div>
              <p className="text-sm font-semibold text-stone-700">Sisa Budget Bulan Ini</p>
            </div>
            <div>
              <h3 className="text-3xl font-bold text-stone-900 mb-2">Rp 0</h3>
              <p className="text-xs text-brand font-medium flex items-center gap-1">
                ↑ Belum ada data
              </p>
            </div>
          </div>

          {/* Nutrisi */}
          <div className="rounded-3xl border border-[#FDE6D5]/50 bg-[#FFF5EE] p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                 <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E6B981] text-white">
                   <Flame className="h-5 w-5" />
                 </div>
                 <p className="text-sm font-semibold text-stone-700">Nutrisi Tercapai<br/><span className="text-xs font-normal text-stone-500">Hari ini</span></p>
              </div>
              <Link href="/nutrition" className="text-xs bg-white px-3 py-1 rounded-full border border-stone-200">Detail</Link>
            </div>
            <div className="space-y-3">
               <div className="flex justify-between items-center text-sm"><span className="text-stone-600">Protein</span><span className="font-medium">0%</span></div>
               <div className="w-full bg-stone-200 rounded-full h-1.5"><div className="bg-brand h-1.5 rounded-full" style={{width: '0%'}}></div></div>
               
               <div className="flex justify-between items-center text-sm"><span className="text-stone-600">Karbo</span><span className="font-medium">0%</span></div>
               <div className="w-full bg-stone-200 rounded-full h-1.5"><div className="bg-[#E6B981] h-1.5 rounded-full" style={{width: '0%'}}></div></div>
            </div>
          </div>

          {/* Waste Alert */}
          <div className="rounded-3xl border border-red-100 bg-[#FFF0F0] p-6 flex flex-col justify-between">
             <div className="flex items-center gap-3 mb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500 text-white">
                <AlertCircle className="h-5 w-5" />
              </div>
              <p className="text-sm font-semibold text-red-900">Waste Alert<br/><span className="text-xs font-normal text-red-700">{criticalItems.length} barang hampir basi</span></p>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-red-950 mb-2">Rp {criticalValue.toLocaleString('id-ID')}</h3>
              <p className="text-xs text-red-700 mb-4">terancam terbuang</p>
              <Link href="/inventory" className="text-sm font-semibold text-red-700 hover:text-red-800 flex items-center gap-1">
                Cek Sekarang <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* Main Content Sections */}
      <section className="mx-auto max-w-[1400px] px-6 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Stok di Kulkasmu */}
        <div className="lg:col-span-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-stone-900 font-heading">Stok di Kulkasmu</h2>
            <Link href="/inventory" className="text-xs font-medium text-stone-500 hover:text-brand">Kelola Semua →</Link>
          </div>
          <div className="bg-white rounded-3xl border border-stone-200 p-4 min-h-[300px] flex flex-col items-center justify-center text-center">
             {loading ? (
               <p className="text-stone-500 font-medium">Memuat data kulkas...</p>
             ) : items.length === 0 ? (
               <>
                 <div className="w-16 h-16 bg-brand-bg rounded-full flex items-center justify-center text-stone-300 mb-3">
                   <Plus className="w-8 h-8"/>
                 </div>
                 <p className="text-stone-500 font-medium mb-1">Kulkas kamu masih kosong</p>
                 <p className="text-stone-400 text-sm mb-4">Tambahkan bahan makanan agar kami bisa mulai membantu.</p>
                 <Link href="/inventory?add=true" className="flex items-center gap-2 text-brand font-semibold text-sm border border-brand/20 px-4 py-2 rounded-full hover:bg-brand-50">
                   <Plus className="w-4 h-4"/> Tambah Stok Baru
                 </Link>
               </>
             ) : (
               <>
                 <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mb-3">
                   <ShoppingBag className="w-8 h-8"/>
                 </div>
                 <p className="text-stone-800 font-bold text-2xl mb-1">{items.length} Barang</p>
                 <p className="text-stone-500 text-sm mb-4">Tersimpan di kulkas digitalmu.</p>
                 <Link href="/inventory" className="flex items-center gap-2 text-brand font-semibold text-sm border border-brand/20 px-4 py-2 rounded-full hover:bg-brand-50">
                   Lihat Isi Kulkas
                 </Link>
               </>
             )}
          </div>
        </div>

        {/* Smart Recipe */}
        <div className="lg:col-span-8">
           <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-stone-900 font-heading flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-[#E6B981]"/> Smart Recipe For You
            </h2>
          </div>
          <div className="bg-white rounded-3xl border border-stone-200 p-6 flex items-center justify-center min-h-[300px] text-center">
             <div>
               <BookOpen className="w-12 h-12 text-stone-300 mx-auto mb-3"/>
               <p className="text-stone-500 font-medium">Belum ada rekomendasi resep</p>
               <p className="text-stone-400 text-sm">Tambahkan stok di kulkasmu untuk mendapatkan resep pintar.</p>
             </div>
          </div>
        </div>

      </section>

      {/* Jelajahi Hari Ini */}
      <section className="mx-auto max-w-[1400px] px-6 lg:px-8 py-8 mb-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-stone-900 font-heading">Jelajahi Hari Ini</h2>
            <p className="text-sm text-stone-500">Info, tips, dan inspirasi untuk hidup lebih bijak</p>
          </div>
          <Link href="/learn" className="text-sm font-medium text-stone-500 hover:text-brand flex items-center gap-1">
            Lihat Semua <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
           {/* Static Articles matching mockup */}
           {[
             { title: 'Harga Cabai Naik 20%!', desc: 'Ganti dengan stok bubuk cabai di kulkasmu. Lebih hemat!', tag: 'Info Pasar', img: 'https://images.unsplash.com/photo-1596644265747-495bc27b7b13?auto=format&fit=crop&q=80&w=400' },
             { title: 'Manfaat Brokoli untuk Jantung', desc: 'Kebetulan kamu punya 2 stok brokoli. Yuk, masak hari ini!', tag: 'Healthy', img: 'https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?auto=format&fit=crop&q=80&w=400' },
             { title: 'Cara Simpan Tempe Agar Awet 5 Hari', desc: 'Tips sederhana biar tempe tetap segar dan tidak cepat berlendir.', tag: 'Food Tips', img: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&q=80&w=400' },
             { title: 'Langkah Kecil, Dampak Besar untuk Bumi 🌱', desc: 'Yuk mulai dari dapur!', tag: 'Lifestyle', img: 'https://images.unsplash.com/photo-1610419958718-285627230489?auto=format&fit=crop&q=80&w=400' },
           ].map((article, i) => (
             <Link key={i} href="/learn" className="group rounded-2xl bg-white border border-stone-200 overflow-hidden hover:shadow-md transition-shadow">
               <div className="h-32 bg-stone-100 relative">
                  <div className="absolute inset-0 bg-cover bg-center" style={{backgroundImage: `url(${article.img})`}}></div>
                  <div className="absolute top-2 left-2 bg-white/90 backdrop-blur text-xs font-semibold px-2 py-1 rounded-full text-stone-700">
                    {article.tag}
                  </div>
               </div>
               <div className="p-4">
                 <h3 className="font-bold text-stone-900 mb-1 leading-tight group-hover:text-brand">{article.title}</h3>
                 <p className="text-xs text-stone-500 mb-3 line-clamp-2">{article.desc}</p>
                 <span className="text-xs font-semibold text-stone-400 group-hover:text-brand flex items-center gap-1">Baca Selengkapnya <ChevronRight className="w-3 h-3"/></span>
               </div>
             </Link>
           ))}
        </div>
      </section>

      {/* Eco-Contribution Message (Dalil preserved as requested) */}
      <section className="mx-auto max-w-[1400px] px-6 lg:px-8 py-8 mb-16 text-center">
        <div className="rounded-3xl bg-brand-dark text-white p-8 lg:p-12 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-brand/30 blur-3xl -mr-20 -mt-20"></div>
          <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-[#E6B981]/20 blur-3xl -ml-20 -mb-20"></div>
          
          <div className="relative z-10 flex flex-col items-center">
            <ShieldCheck className="h-12 w-12 text-brand-light mb-6" />
            <h3 className="text-2xl font-bold font-heading sm:text-3xl mb-4">Mendukung Gaya Hidup Thayyiban</h3>
            <p className="text-brand-cream/80 text-base max-w-3xl leading-relaxed italic mb-4">
              &quot;Makan dan minumlah, tetapi jangan berlebih-lebihan. Sesungguhnya Allah tidak menyukai orang-orang yang berlebih-lebihan.&quot;
            </p>
            <p className="text-sm font-semibold text-brand-light">(QS. Al-A&apos;raf: 31)</p>
            <p className="mt-6 text-white/90 text-sm max-w-2xl leading-relaxed">
              WasteLess membantu menjaga keberkahan makanan dan keuangan Anda secara berkelanjutan.
            </p>
          </div>
        </div>
      </section>

    </div>
  );
}
