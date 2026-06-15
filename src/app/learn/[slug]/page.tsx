'use client';

import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Clock, Calendar, Share2, BookmarkPlus } from 'lucide-react';
import Link from 'next/link';
import { ARTICLES_DATA } from '../page';

export default function ArticleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const article = ARTICLES_DATA.find(a => a.id === slug);

  const formatDate = () => {
    return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date());
  };

  if (!article) {
    return (
      <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-4xl font-heading font-extrabold text-stone-900 mb-4">Artikel Tidak Ditemukan</h1>
        <p className="text-stone-500 mb-8 max-w-md">Maaf, artikel yang Anda cari mungkin sudah dihapus atau tautannya salah.</p>
        <Link href="/learn" className="bg-brand text-white px-6 py-3 rounded-full font-bold hover:bg-brand-dark transition-colors">
          Kembali ke Pusat Edukasi
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 pb-20">
      
      {/* Article Hero */}
      <div className="w-full h-[40vh] md:h-[60vh] relative">
        <div className="absolute inset-0 bg-stone-900/40 z-10"></div>
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${article.image})` }}></div>
        
        <div className="absolute inset-0 z-20 max-w-[800px] mx-auto px-6 lg:px-8 flex flex-col justify-between pt-8 pb-12">
          <button onClick={() => router.back()} className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/30 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="mt-auto">
            <span className="inline-block px-3 py-1 bg-brand text-white font-bold text-xs rounded-full mb-4 uppercase tracking-wider shadow-md">
              {article.category}
            </span>
            <h1 className="text-3xl md:text-5xl font-extrabold font-heading text-white mb-6 leading-tight drop-shadow-lg">
              {article.title}
            </h1>
            <div className="flex flex-wrap items-center gap-6 text-sm font-semibold text-white/90">
              <span className="flex items-center gap-2"><Calendar className="w-4 h-4" /> {formatDate()}</span>
              <span className="flex items-center gap-2"><Clock className="w-4 h-4" /> {article.readTime}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Article Content */}
      <div className="max-w-[800px] mx-auto px-6 lg:px-8 -mt-8 relative z-30">
        
        <div className="bg-white rounded-[32px] p-8 md:p-12 shadow-xl border border-stone-100 mb-12">
           
           <div className="flex justify-end gap-3 mb-10 pb-6 border-b border-stone-100">
             <button className="flex items-center gap-2 text-stone-500 hover:text-brand font-bold text-sm transition-colors">
               <Share2 className="w-4 h-4"/> Bagikan
             </button>
             <button className="flex items-center gap-2 text-stone-500 hover:text-brand font-bold text-sm transition-colors">
               <BookmarkPlus className="w-4 h-4"/> Simpan
             </button>
           </div>

           <div className="prose prose-lg prose-stone max-w-none">
              {article.content.split('\n').map((paragraph, idx) => (
                paragraph.trim() ? (
                  <p key={idx} className="mb-6 text-stone-700 leading-relaxed">
                    {paragraph}
                  </p>
                ) : <br key={idx} />
              ))}
           </div>
        </div>

      </div>

    </div>
  );
}
