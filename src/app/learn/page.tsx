import { BookOpen, Search, Filter, PlayCircle, Clock } from 'lucide-react';
import Link from 'next/link';
import { ARTICLES_DATA } from '@/lib/data';

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
