'use client';

import { Flame, Droplets, Target, Activity, ArrowRight, Apple, Beef, Wheat, Plus, X, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

type NutritionLog = {
  id: string;
  meal_name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  meal_time: string;
  created_at: string;
};

export default function NutritionPage() {
  const [vegetableInFridge, setVegetableInFridge] = useState<string | null>(null);
  const [logs, setLogs] = useState<NutritionLog[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mealName, setMealName] = useState('');
  const [mealCalories, setMealCalories] = useState('');
  const [mealProtein, setMealProtein] = useState('');
  const [mealCarbs, setMealCarbs] = useState('');
  const [mealFat, setMealFat] = useState('');
  const [mealTime, setMealTime] = useState('Makan Siang');

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [sessionUser, setSessionUser] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      setSessionUser(session.user);
      
      // Fetch vegetable tip
      const { data: pantryData } = await supabase
        .from('pantry_assets')
        .select('item_name, category')
        .eq('user_id', session.user.id)
        .eq('category', 'Sayur');
      
      if (pantryData && pantryData.length > 0) {
        setVegetableInFridge(pantryData[0].item_name);
      }

      // Fetch today's logs
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      
      const { data: logData } = await supabase
        .from('nutrition_logs')
        .select('*')
        .eq('user_id', session.user.id)
        .gte('created_at', startOfDay.toISOString())
        .order('created_at', { ascending: false });

      if (logData) {
        setLogs(logData);
      }
    }
    setLoading(false);
  };

  const handleAddMeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionUser) {
      alert("Harap login terlebih dahulu.");
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('nutrition_logs')
        .insert([
          { 
            user_id: sessionUser.id,
            meal_name: mealName,
            calories: Number(mealCalories) || 0,
            protein: Number(mealProtein) || 0,
            carbs: Number(mealCarbs) || 0,
            fat: Number(mealFat) || 0,
            meal_time: mealTime
          }
        ]);

      if (error) throw error;
      
      setIsModalOpen(false);
      setMealName('');
      setMealCalories('');
      setMealProtein('');
      setMealCarbs('');
      setMealFat('');
      await fetchData();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      alert('Gagal menyimpan catatan makanan: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Compute Current Macros
  const currentCalories = logs.reduce((sum, log) => sum + log.calories, 0);
  const currentProtein = logs.reduce((sum, log) => sum + log.protein, 0);
  const currentCarbs = logs.reduce((sum, log) => sum + log.carbs, 0);
  const currentFat = logs.reduce((sum, log) => sum + log.fat, 0);

  const macroGoals = {
    calories: { current: currentCalories, target: 2000 },
    protein: { current: currentProtein, target: 100 },
    carbo: { current: currentCarbs, target: 250 },
    fat: { current: currentFat, target: 65 },
  };

  return (
    <div className="min-h-screen bg-brand-bg pb-20">
      
      {/* Modal Add Meal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden border border-stone-200">
             <div className="p-6 border-b border-stone-100 flex justify-between items-center">
               <h3 className="text-xl font-bold font-heading text-stone-900">Catat Makanan</h3>
               <button onClick={() => setIsModalOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 transition-colors">
                 <X className="w-4 h-4"/>
               </button>
             </div>
             <form onSubmit={handleAddMeal} className="p-6 space-y-4">
               <div>
                 <label className="text-sm font-semibold text-stone-700 block mb-1.5">Nama Makanan</label>
                 <input required type="text" value={mealName} onChange={(e) => setMealName(e.target.value)} placeholder="Misal: Ayam Bakar & Nasi" className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand" />
               </div>

               <div className="grid grid-cols-2 gap-4">
                 <div>
                   <label className="text-sm font-semibold text-stone-700 block mb-1.5">Waktu</label>
                   <select value={mealTime} onChange={(e) => setMealTime(e.target.value)} className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:outline-none focus:ring-2 focus:ring-brand">
                     <option>Sarapan</option>
                     <option>Makan Siang</option>
                     <option>Makan Malam</option>
                     <option>Cemilan</option>
                   </select>
                 </div>
                 <div>
                   <label className="text-sm font-semibold text-stone-700 block mb-1.5">Kalori (kcal)</label>
                   <input required type="number" min="0" value={mealCalories} onChange={(e) => setMealCalories(e.target.value)} placeholder="0" className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:outline-none focus:ring-2 focus:ring-brand" />
                 </div>
               </div>

               <div className="grid grid-cols-3 gap-3 pt-2">
                  <div>
                    <label className="text-xs font-semibold text-stone-700 block mb-1">Protein (g)</label>
                    <input type="number" min="0" value={mealProtein} onChange={(e) => setMealProtein(e.target.value)} placeholder="0" className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-stone-700 block mb-1">Karbo (g)</label>
                    <input type="number" min="0" value={mealCarbs} onChange={(e) => setMealCarbs(e.target.value)} placeholder="0" className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-stone-700 block mb-1">Lemak (g)</label>
                    <input type="number" min="0" value={mealFat} onChange={(e) => setMealFat(e.target.value)} placeholder="0" className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand" />
                  </div>
               </div>

               <button type="submit" disabled={isSubmitting} className="w-full py-3.5 mt-4 bg-brand-dark text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-brand transition-colors disabled:opacity-70 disabled:cursor-not-allowed">
                 {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Simpan Makanan"}
               </button>
             </form>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white border-b border-stone-200 py-8 px-6 lg:px-8">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold font-heading text-brand-dark mb-2">Laporan Nutrisi Harian</h1>
            <p className="text-stone-500">Pantau asupan gizi harianmu berdasarkan bahan makanan di kulkas.</p>
          </div>
          <button onClick={() => {
              if(!sessionUser) alert("Harap login terlebih dahulu.");
              else setIsModalOpen(true);
            }} className="inline-flex items-center justify-center gap-2 bg-brand-dark text-white px-5 py-2.5 rounded-full font-semibold hover:bg-brand transition-colors w-fit shadow-md shadow-brand/20">
            <Plus className="w-4 h-4"/> Catat Makanan
          </button>
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
                  <circle cx="50" cy="50" r="45" fill="none" stroke="#386641" strokeWidth="10" strokeDasharray="283" strokeDashoffset={283 - (283 * Math.min(1, macroGoals.calories.current / macroGoals.calories.target))} className="transition-all duration-1000 ease-out" />
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
                    <div className="bg-red-400 h-2.5 rounded-full transition-all duration-1000" style={{width: `${Math.min(100, (macroGoals.protein.current/macroGoals.protein.target)*100)}%`}}></div>
                  </div>
                </div>
                {/* Carbo */}
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="flex items-center gap-1.5 font-semibold text-stone-600"><Wheat className="w-4 h-4 text-amber-400"/> Karbohidrat</span>
                    <span className="text-stone-500 font-medium">{macroGoals.carbo.current}g <span className="text-stone-300">/ {macroGoals.carbo.target}g</span></span>
                  </div>
                  <div className="w-full bg-stone-100 rounded-full h-2.5">
                    <div className="bg-amber-400 h-2.5 rounded-full transition-all duration-1000" style={{width: `${Math.min(100, (macroGoals.carbo.current/macroGoals.carbo.target)*100)}%`}}></div>
                  </div>
                </div>
                {/* Fat */}
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="flex items-center gap-1.5 font-semibold text-stone-600"><Droplets className="w-4 h-4 text-blue-400"/> Lemak</span>
                    <span className="text-stone-500 font-medium">{macroGoals.fat.current}g <span className="text-stone-300">/ {macroGoals.fat.target}g</span></span>
                  </div>
                  <div className="w-full bg-stone-100 rounded-full h-2.5">
                    <div className="bg-blue-400 h-2.5 rounded-full transition-all duration-1000" style={{width: `${Math.min(100, (macroGoals.fat.current/macroGoals.fat.target)*100)}%`}}></div>
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
               {/* Dummy bars for visual consistency until daily history is built */}
               {[40, 70, 85, 60, 95, 50, Math.min(100, (currentCalories/macroGoals.calories.target)*100)].map((h, i) => (
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
               {currentProtein >= macroGoals.protein.target 
                 ? <span className="font-bold text-emerald-600">Protein harianmu sudah terpenuhi! </span> 
                 : `Kamu masih kurang ${macroGoals.protein.target - currentProtein}g protein hari ini. `}
               Coba tambahkan {vegetableInFridge ? <><span className="font-bold">{vegetableInFridge}</span> dari kulkasmu</> : "sayuran segar"} untuk menyeimbangkan makananmu!
             </p>
             <Link href="/ai-assistant" className="inline-flex items-center gap-1.5 text-xs font-bold bg-white border border-amber-200 px-4 py-2 rounded-full text-amber-700 hover:bg-amber-50">
               Tanya Resep Sehat <ArrowRight className="w-3 h-3"/>
             </Link>
           </div>

           <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-sm flex flex-col max-h-[400px]">
              <div className="flex items-center justify-between mb-4 shrink-0">
                <h3 className="font-bold text-stone-900">Konsumsi Hari Ini</h3>
              </div>
              <div className="space-y-4 overflow-y-auto flex-1 pr-2 scrollbar-hide">
                {loading ? (
                  <div className="flex justify-center py-4 text-stone-400"><Loader2 className="w-5 h-5 animate-spin" /></div>
                ) : logs.length === 0 ? (
                  <div className="text-center py-6 text-sm text-stone-400 font-medium">Belum ada makanan yang dicatat hari ini.</div>
                ) : (
                  logs.map((meal) => (
                    <div key={meal.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-500">
                           <Apple className="w-4 h-4"/>
                         </div>
                         <div>
                           <p className="text-sm font-semibold text-stone-800">{meal.meal_name}</p>
                           <p className="text-[10px] font-bold text-stone-400 uppercase">{meal.meal_time}</p>
                         </div>
                      </div>
                      <span className="text-sm font-bold text-brand-dark">{meal.calories} kcal</span>
                    </div>
                  ))
                )}
              </div>
           </div>

        </div>

      </div>
    </div>
  );
}
