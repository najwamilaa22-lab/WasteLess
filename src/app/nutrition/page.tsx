import { Flame, Droplets, Target, Activity, ArrowRight, Apple, Beef, Wheat } from 'lucide-react';
import Link from 'next/link';

export default function NutritionPage() {
  // Dummy data for visual representation
  const macroGoals = {
    calories: { current: 1850, target: 2000 },
    protein: { current: 75, target: 100 },
    carbo: { current: 180, target: 250 },
    fat: { current: 55, target: 65 },
  };

  const dummyMeals = [
    { name: 'Beef Teriyaki', cals: 450, time: 'Makan Siang' },
    { name: 'Susu Kurma Smoothie', cals: 250, time: 'Sarapan' },
    { name: 'Omelet Bayam Keju', cals: 320, time: 'Makan Malam' },
  ];

  return (
    <div className="min-h-screen bg-brand-bg pb-20">
      {/* Header */}
      <div className="bg-white border-b border-stone-200 py-8 px-6 lg:px-8">
        <div className="max-w-[1400px] mx-auto">
          <h1 className="text-3xl font-extrabold font-heading text-brand-dark mb-2">Laporan Nutrisi Harian</h1>
          <p className="text-stone-500">Pantau asupan gizi harianmu berdasarkan bahan makanan di kulkas.</p>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Main Stats */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Calorie Ring summary */}
          <div className="bg-white rounded-3xl border border-stone-200 p-8 shadow-sm flex flex-col md:flex-row items-center gap-8">
            <div className="relative w-40 h-40 flex items-center justify-center shrink-0">
               <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="#f5f5f4" strokeWidth="10" />
                  <circle cx="50" cy="50" r="45" fill="none" stroke="#386641" strokeWidth="10" strokeDasharray="283" strokeDashoffset={283 - (283 * (macroGoals.calories.current / macroGoals.calories.target))} className="transition-all duration-1000 ease-out" />
               </svg>
               <div className="absolute flex flex-col items-center">
                 <Flame className="w-6 h-6 text-brand mb-1"/>
                 <span className="text-2xl font-bold text-brand-dark">{macroGoals.calories.current}</span>
                 <span className="text-[10px] uppercase font-bold text-stone-400">/ {macroGoals.calories.target} kcal</span>
               </div>
            </div>
            
            <div className="w-full space-y-6">
              <h3 className="font-bold text-stone-900 text-lg">Target Makronutrien</h3>
              <div className="space-y-4">
                {/* Protein */}
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="flex items-center gap-1.5 font-semibold text-stone-600"><Beef className="w-4 h-4 text-red-400"/> Protein</span>
                    <span className="text-stone-500 font-medium">{macroGoals.protein.current}g <span className="text-stone-300">/ {macroGoals.protein.target}g</span></span>
                  </div>
                  <div className="w-full bg-stone-100 rounded-full h-2.5">
                    <div className="bg-red-400 h-2.5 rounded-full" style={{width: `${(macroGoals.protein.current/macroGoals.protein.target)*100}%`}}></div>
                  </div>
                </div>
                {/* Carbo */}
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="flex items-center gap-1.5 font-semibold text-stone-600"><Wheat className="w-4 h-4 text-amber-400"/> Karbohidrat</span>
                    <span className="text-stone-500 font-medium">{macroGoals.carbo.current}g <span className="text-stone-300">/ {macroGoals.carbo.target}g</span></span>
                  </div>
                  <div className="w-full bg-stone-100 rounded-full h-2.5">
                    <div className="bg-amber-400 h-2.5 rounded-full" style={{width: `${(macroGoals.carbo.current/macroGoals.carbo.target)*100}%`}}></div>
                  </div>
                </div>
                {/* Fat */}
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="flex items-center gap-1.5 font-semibold text-stone-600"><Droplets className="w-4 h-4 text-blue-400"/> Lemak</span>
                    <span className="text-stone-500 font-medium">{macroGoals.fat.current}g <span className="text-stone-300">/ {macroGoals.fat.target}g</span></span>
                  </div>
                  <div className="w-full bg-stone-100 rounded-full h-2.5">
                    <div className="bg-blue-400 h-2.5 rounded-full" style={{width: `${(macroGoals.fat.current/macroGoals.fat.target)*100}%`}}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Activity Graph Placeholder */}
          <div className="bg-white rounded-3xl border border-stone-200 p-8 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-stone-900 text-lg flex items-center gap-2"><Activity className="w-5 h-5 text-brand"/> Grafik Pemenuhan Gizi</h3>
              <select className="bg-stone-50 border border-stone-200 text-sm rounded-lg px-3 py-1.5 text-stone-600 focus:outline-none">
                <option>Minggu Ini</option>
                <option>Bulan Ini</option>
              </select>
            </div>
            <div className="h-[250px] w-full flex items-end gap-2 pb-4 border-b border-stone-100 relative">
               {/* Dummy bars */}
               {[40, 70, 85, 60, 95, 50, 80].map((h, i) => (
                 <div key={i} className="flex-1 flex flex-col justify-end group">
                   <div className="w-full bg-brand-light/30 rounded-t-lg group-hover:bg-brand transition-colors" style={{height: `${h}%`}}></div>
                 </div>
               ))}
            </div>
            <div className="flex justify-between mt-2 text-xs font-bold text-stone-400 px-2">
              <span>Sen</span><span>Sel</span><span>Rab</span><span>Kam</span><span>Jum</span><span>Sab</span><span>Min</span>
            </div>
          </div>

        </div>

        {/* Right Sidebar */}
        <div className="lg:col-span-4 space-y-6">
           
           <div className="bg-[#FFF9F2] rounded-3xl border border-amber-100 p-6 shadow-sm">
             <div className="flex items-center gap-3 mb-4">
               <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                 <Target className="w-5 h-5"/>
               </div>
               <h3 className="font-bold text-stone-900">Insight Nutrisi AI</h3>
             </div>
             <p className="text-sm text-stone-600 leading-relaxed mb-4">
               Tingkat konsumsi proteinmu <span className="font-bold text-emerald-600">sangat baik</span> hari ini! Namun, kamu masih kekurangan serat. Coba tambahkan sisa <span className="font-bold">Bayam</span> di kulkasmu untuk makan malam.
             </p>
             <Link href="/ai-assistant" className="inline-flex items-center gap-1.5 text-xs font-bold bg-white border border-amber-200 px-4 py-2 rounded-full text-amber-700 hover:bg-amber-50">
               Tanya Resep Serat Tinggi <ArrowRight className="w-3 h-3"/>
             </Link>
           </div>

           <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-sm">
              <h3 className="font-bold text-stone-900 mb-4">Konsumsi Hari Ini</h3>
              <div className="space-y-4">
                {dummyMeals.map((meal, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-500">
                         <Apple className="w-4 h-4"/>
                       </div>
                       <div>
                         <p className="text-sm font-semibold text-stone-800">{meal.name}</p>
                         <p className="text-[10px] font-bold text-stone-400 uppercase">{meal.time}</p>
                       </div>
                    </div>
                    <span className="text-sm font-bold text-brand-dark">{meal.cals} kcal</span>
                  </div>
                ))}
              </div>
           </div>

        </div>

      </div>
    </div>
  );
}
