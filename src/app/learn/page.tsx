import { BookOpen, Search, Filter, PlayCircle, Clock } from 'lucide-react';
import Link from 'next/link';

export const ARTICLES_DATA = [
  {
    id: "cara-benar-menyimpan-sayuran",
    title: "Cara Benar Menyimpan Sayuran Hijau Agar Tahan 2 Minggu",
    category: "Tips Simpan",
    readTime: "3 min read",
    image: "https://images.unsplash.com/photo-1556801712-76c8eb07bbc9?auto=format&fit=crop&q=80",
    featured: true,
    content: "Sayuran hijau sangat mudah layu jika tidak disimpan dengan benar. Ikuti panduan langkah demi langkah ini untuk menjaga kesegaran bayam, kangkung, dan selada hingga berminggu-minggu di dalam kulkas.\n\nPertama, pastikan sayuran dalam keadaan kering sebelum dimasukkan ke kulkas. Jangan mencucinya jika tidak akan langsung dimasak. Bungkus sayuran dengan tisu dapur untuk menyerap embun air, lalu masukkan ke dalam wadah kedap udara atau plastik ziplock.\n\nKedua, pisahkan sayuran hijau dari buah-buahan penghasil gas etilen seperti apel dan pisang, karena gas tersebut dapat mempercepat proses pembusukan sayuran."
  },
  {
    id: "membuat-kaldu-gurih",
    title: "Membuat Kaldu Gurih dari Sisa Potongan Sayur",
    category: "Resep Zero Waste",
    readTime: "5 min read",
    image: "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&q=80",
    content: "Daripada membuang kulit wortel, batang seledri, atau bonggol bawang, kumpulkan semuanya di dalam wadah penyimpanan di freezer. Saat sudah penuh, rebus bahan-bahan tersebut bersama air dan sedikit garam untuk menghasilkan kaldu nabati alami yang gurih dan bebas pengawet."
  },
  {
    id: "mengenal-ugly-produce",
    title: "Mengenal 'Ugly Produce' dan Kenapa Kamu Harus Membelinya",
    category: "Info Pasar",
    readTime: "4 min read",
    image: "https://images.unsplash.com/photo-1615486511484-92e172fc34ea?auto=format&fit=crop&q=80",
    content: "Banyak buah dan sayuran yang dibuang oleh supermarket hanya karena bentuknya kurang sempurna atau sedikit bengkok. Padahal, nutrisinya 100% sama dengan yang bentuknya sempurna. Yuk, mulai biasakan menyelamatkan 'ugly produce' dari tumpukan sampah!"
  },
  {
    id: "pisang-mulai-menghitam",
    title: "Pisang Mulai Menghitam? Jangan Dibuang! Jadikan Ini",
    category: "Resep Zero Waste",
    readTime: "2 min read",
    image: "https://images.unsplash.com/photo-1528825871115-3581a5387919?auto=format&fit=crop&q=80",
    content: "Pisang yang kulitnya mulai menghitam dan berbintik justru memiliki rasa paling manis karena patinya telah berubah menjadi gula alami. Ini adalah bahan terbaik untuk membuat banana bread, smoothies, atau pancake pisang tanpa perlu tambahan gula buatan."
  },
  {
    id: "panduan-label-kedaluwarsa",
    title: "Panduan Membaca Label Kedaluwarsa (Exp vs Best Before)",
    category: "Gaya Hidup",
    readTime: "6 min read",
    image: "https://images.unsplash.com/photo-1606914501449-5a96b6ce24ca?auto=format&fit=crop&q=80",
    content: "Tahukah Anda perbedaan 'Expired Date' dan 'Best Before'? Banyak orang membuang makanan hanya karena melewati tanggal 'Best Before', padahal makanan tersebut masih aman dikonsumsi, hanya saja kualitas rasa dan teksturnya mungkin sedikit menurun."
  },
  {
    id: "cara-menata-kulkas",
    title: "Cara Menata Kulkas Agar Makanan Tidak Mudah Basi",
    category: "Tips Simpan",
    readTime: "4 min read",
    image: "https://images.unsplash.com/photo-1588854337236-6889d631faa8?auto=format&fit=crop&q=80",
    content: "Suhu kulkas tidak merata di semua bagian. Rak paling atas adalah tempat paling hangat, rak paling bawah adalah yang terdingin, sementara pintu adalah area dengan fluktuasi suhu tertinggi. Simpan telur dan susu di dalam rak utama, bukan di pintu kulkas!"
  }
];

export default function LearnPage() {
  const categories = ["Semua", "Tips Simpan", "Resep Zero Waste", "Info Pasar", "Gaya Hidup"];
  
  return (
    <div className="min-h-screen bg-stone-50 pb-20">
      {/* Header */}
      <div className="bg-brand-dark text-white pt-16 pb-24 px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <BookOpen className="w-64 h-64 transform rotate-12" />
        </div>
        <div className="max-w-[1400px] mx-auto relative z-10">
          <h1 className="text-4xl lg:text-5xl font-extrabold font-heading mb-4">Pusat Edukasi & Inspirasi</h1>
          <p className="text-brand-light text-lg max-w-2xl mb-8">
            Pelajari cara menyimpan makanan dengan benar, resep anti-sisa, dan wawasan gaya hidup keberlanjutan.
          </p>
          
          <div className="relative max-w-xl">
             <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
               <Search className="h-5 w-5 text-stone-400" />
             </div>
             <input
               type="text"
               placeholder="Cari tips, bahan, atau artikel..."
               className="w-full pl-12 pr-4 py-4 rounded-2xl text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-brand shadow-xl"
             />
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 lg:px-8 -mt-8 relative z-20">
        
        {/* Categories */}
        <div className="flex items-center gap-3 overflow-x-auto pb-4 scrollbar-hide mb-8">
           <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full text-stone-600 font-bold text-sm shrink-0 shadow-sm border border-stone-200">
             <Filter className="w-4 h-4"/> Filter:
           </div>
           {categories.map((cat, idx) => (
             <button key={idx} className={`px-5 py-2 rounded-full font-bold text-sm shrink-0 transition-colors shadow-sm ${idx === 0 ? 'bg-brand text-white border-transparent' : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'}`}>
               {cat}
             </button>
           ))}
        </div>

        {/* Featured Article */}
        <div className="mb-12">
          {ARTICLES_DATA.filter(a => a.featured).map((article, idx) => (
            <Link href={`/learn/${article.id}`} key={idx} className="block group rounded-[32px] overflow-hidden bg-white shadow-sm border border-stone-200 flex flex-col md:flex-row hover:shadow-md transition-shadow">
               <div className="md:w-1/2 h-64 md:h-auto relative overflow-hidden">
                 <div className={`absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105`} style={{backgroundImage: `url(${article.image})`}}></div>
               </div>
               <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
                 <span className="inline-block px-3 py-1 bg-brand/10 text-brand-dark font-bold text-xs rounded-full mb-4 w-fit uppercase tracking-wider">{article.category}</span>
                 <h2 className="text-3xl font-extrabold font-heading text-stone-900 mb-4 leading-tight group-hover:text-brand transition-colors">{article.title}</h2>
                 <p className="text-stone-600 mb-6 line-clamp-3">
                   {article.content}
                 </p>
                 <div className="flex items-center gap-4 text-sm font-bold text-stone-400 mt-auto">
                   <span className="flex items-center gap-1.5"><Clock className="w-4 h-4"/> {article.readTime}</span>
                   <span className="flex items-center gap-1.5 text-brand"><PlayCircle className="w-4 h-4"/> Baca Artikel</span>
                 </div>
               </div>
            </Link>
          ))}
        </div>

        {/* Article Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {ARTICLES_DATA.filter(a => !a.featured).map((article, idx) => (
             <Link href={`/learn/${article.id}`} key={idx} className="block group bg-white rounded-3xl overflow-hidden shadow-sm border border-stone-200 hover:shadow-md transition-all hover:-translate-y-1">
               <div className="h-48 relative overflow-hidden">
                 <div className={`absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105`} style={{backgroundImage: `url(${article.image})`}}></div>
                 <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-stone-900 font-bold text-xs rounded-full uppercase tracking-wider">{article.category}</span>
                 </div>
               </div>
               <div className="p-6">
                 <h3 className="text-xl font-bold font-heading text-stone-900 mb-3 leading-snug group-hover:text-brand transition-colors line-clamp-2">{article.title}</h3>
                 <div className="flex items-center gap-4 text-xs font-bold text-stone-400 mt-4">
                   <span className="flex items-center gap-1.5"><Clock className="w-3 h-3"/> {article.readTime}</span>
                 </div>
               </div>
             </Link>
          ))}
        </div>

      </div>
    </div>
  );
}
