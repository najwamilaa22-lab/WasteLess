'use client';

import { useState, useEffect } from 'react';
import { Wallet, TrendingUp, TrendingDown, PiggyBank, Receipt, PieChart, Plus, X, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Define the transaction type
type Transaction = {
  id: string;
  name: string;
  amount: number;
  category: string;
  created_at: string;
};

export default function BudgetPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [sessionUser, setSessionUser] = useState<any>(null);

  // Form State
  const [txName, setTxName] = useState('');
  const [txAmount, setTxAmount] = useState('');
  const [txType, setTxType] = useState<'expense' | 'savings'>('expense');

  // Computed totals
  const totalExpense = transactions
    .filter(t => t.amount < 0)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    
  const totalSavings = transactions
    .filter(t => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);

  const budgetLimit = 2000000; // Hardcoded dummy budget limit for visual purposes
  const remainingBudget = budgetLimit - totalExpense;

  // Prepare chart data
  // Group by date (DD MMM) and aggregate expense and savings
  const chartDataMap: Record<string, { date: string, Pengeluaran: number, Penghematan: number }> = {};
  
  // Sort transactions by date ascending for the chart
  const sortedForChart = [...transactions].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  
  sortedForChart.forEach(t => {
    const d = new Date(t.created_at);
    const dateStr = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short' }).format(d);
    
    if (!chartDataMap[dateStr]) {
      chartDataMap[dateStr] = { date: dateStr, Pengeluaran: 0, Penghematan: 0 };
    }
    
    if (t.amount < 0) {
      chartDataMap[dateStr].Pengeluaran += Math.abs(t.amount);
    } else {
      chartDataMap[dateStr].Penghematan += t.amount;
    }
  });

  const chartData = Object.values(chartDataMap);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        setSessionUser(session.user);
        const { data, error } = await supabase
          .from('transactions')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        setTransactions(data || []);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionUser) {
      alert("Harap login terlebih dahulu.");
      return;
    }

    setIsSubmitting(true);
    const amountVal = txType === 'expense' ? -Math.abs(Number(txAmount)) : Math.abs(Number(txAmount));

    try {
      const { error } = await supabase
        .from('transactions')
        .insert([
          { 
            user_id: sessionUser.id,
            name: txName,
            amount: amountVal,
            category: txType === 'expense' ? 'Groceries' : 'Savings'
          }
        ]);

      if (error) throw error;
      
      // Reset form & refresh data
      setTxName('');
      setTxAmount('');
      setIsModalOpen(false);
      await fetchData();
      
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      alert('Gagal menyimpan transaksi: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(d);
  };

  return (
    <div className="min-h-screen bg-brand-bg pb-20 relative">
      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden border border-stone-200">
             <div className="p-6 border-b border-stone-100 flex justify-between items-center">
               <h3 className="text-xl font-bold font-heading text-stone-900">Tambah Transaksi</h3>
               <button onClick={() => setIsModalOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 transition-colors">
                 <X className="w-4 h-4"/>
               </button>
             </div>
             <form onSubmit={handleAddTransaction} className="p-6 space-y-4">
               <div>
                 <label className="text-sm font-semibold text-stone-700 block mb-1.5">Jenis Transaksi</label>
                 <div className="flex bg-stone-100 p-1 rounded-xl">
                   <button type="button" onClick={() => setTxType('expense')} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${txType === 'expense' ? 'bg-white text-red-600 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}>Pengeluaran</button>
                   <button type="button" onClick={() => setTxType('savings')} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${txType === 'savings' ? 'bg-white text-emerald-600 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}>Penghematan AI</button>
                 </div>
               </div>
               
               <div>
                 <label className="text-sm font-semibold text-stone-700 block mb-1.5">Nama / Keterangan</label>
                 <input required type="text" value={txName} onChange={(e) => setTxName(e.target.value)} placeholder={txType === 'expense' ? "Misal: Beli Ayam & Sayur" : "Misal: Kaldu dari Sisa Sayur"} className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand" />
               </div>

               <div>
                 <label className="text-sm font-semibold text-stone-700 block mb-1.5">Nominal (Rp)</label>
                 <input required type="number" min="0" value={txAmount} onChange={(e) => setTxAmount(e.target.value)} placeholder="0" className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand font-mono text-lg" />
               </div>

               <button type="submit" disabled={isSubmitting} className="w-full py-3.5 mt-2 bg-brand-dark text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-brand transition-colors disabled:opacity-70 disabled:cursor-not-allowed">
                 {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Simpan Data"}
               </button>
             </form>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white border-b border-stone-200 py-8 px-6 lg:px-8">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold font-heading text-brand-dark mb-2">Analitik Keuangan</h1>
            <p className="text-stone-500">Lacak pengeluaran belanjamu dan seberapa banyak yang berhasil kamu hemat.</p>
          </div>
          <div className="flex items-center gap-3">
             <button onClick={() => {
                if(!sessionUser) alert("Harap login dari halaman utama terlebih dahulu untuk menambahkan data sungguhan.");
                else setIsModalOpen(true);
             }} className="inline-flex items-center gap-2 bg-brand-dark text-white px-5 py-2.5 rounded-full font-semibold hover:bg-brand transition-colors w-fit shadow-md shadow-brand/20">
               <Plus className="w-4 h-4"/> Tambah Manual
             </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Main Stats */}
        <div className="lg:col-span-8 space-y-8">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-sm flex flex-col justify-between h-40 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5">
                 <Wallet className="w-24 h-24"/>
              </div>
              <div className="flex items-center gap-2 text-stone-500 font-semibold text-sm">
                <Wallet className="w-4 h-4 text-brand"/> Sisa Anggaran (Simulasi Rp 2Jt)
              </div>
              <div>
                 <h2 className="text-3xl font-extrabold text-stone-900 mb-1">Rp {remainingBudget.toLocaleString('id-ID')}</h2>
                 <p className="text-xs font-bold text-stone-400">Total Pengeluaran: Rp {totalExpense.toLocaleString('id-ID')}</p>
              </div>
            </div>

            <div className="bg-brand-dark text-white rounded-3xl border border-brand p-6 shadow-sm flex flex-col justify-between h-40 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                 <PiggyBank className="w-24 h-24"/>
              </div>
              <div className="flex items-center gap-2 text-brand-light font-semibold text-sm relative z-10">
                <PiggyBank className="w-4 h-4 text-brand-cream"/> Total Penyelamatan Uang
              </div>
              <div className="relative z-10">
                 <h2 className="text-3xl font-extrabold text-white mb-1">Rp {totalSavings.toLocaleString('id-ID')}</h2>
                 <p className="text-xs font-bold text-brand-light flex items-center gap-1"><TrendingUp className="w-3 h-3"/> Berhasil dicegah terbuang basi</p>
              </div>
            </div>
          </div>

          {/* Interactive Graph */}
          <div className="bg-white rounded-3xl border border-stone-200 p-8 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-stone-900 text-lg flex items-center gap-2">Trend Analitik</h3>
            </div>
            
            <div className="w-full h-64">
              {chartData.length === 0 ? (
                <div className="w-full h-full flex flex-col items-center justify-center text-stone-400">
                  <TrendingUp className="w-10 h-10 mb-2 opacity-20"/>
                  <p className="text-sm font-bold">Belum ada data untuk divisualisasikan</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorSavings" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f4" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#78716c' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#78716c' }} tickFormatter={(value) => `Rp${value / 1000}k`} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      formatter={(value: any) => [`Rp ${Number(value).toLocaleString('id-ID')}`, '']}
                    />
                    <Area type="monotone" dataKey="Pengeluaran" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorExpense)" />
                    <Area type="monotone" dataKey="Penghematan" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorSavings)" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

        </div>

        {/* Right Sidebar */}
        <div className="lg:col-span-4 space-y-6">
           
           <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-sm flex flex-col max-h-[500px]">
             <div className="flex items-center justify-between mb-6 shrink-0">
               <h3 className="font-bold text-stone-900">Riwayat Terakhir</h3>
             </div>
             
             <div className="space-y-4 overflow-y-auto flex-1 pr-2 scrollbar-hide">
               {loading ? (
                 <div className="flex flex-col items-center justify-center py-10 text-stone-400">
                   <Loader2 className="w-8 h-8 animate-spin mb-2" />
                   <p className="text-sm font-bold">Memuat data...</p>
                 </div>
               ) : transactions.length === 0 ? (
                 <div className="flex flex-col items-center justify-center py-10 text-center">
                    <Receipt className="w-10 h-10 text-stone-200 mb-2" />
                    <p className="text-sm font-bold text-stone-500">Belum ada riwayat tercatat.</p>
                    <p className="text-xs text-stone-400 mt-1">Klik &quot;Tambah Manual&quot; untuk memulai.</p>
                 </div>
               ) : (
                 transactions.map((trx) => (
                   <div key={trx.id} className="flex items-center justify-between">
                     <div className="flex items-center gap-3">
                       <div className={`w-10 h-10 rounded-full flex items-center justify-center ${trx.amount > 0 ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                         {trx.amount > 0 ? <TrendingUp className="w-5 h-5"/> : <TrendingDown className="w-5 h-5"/>}
                       </div>
                       <div>
                         <p className="text-sm font-bold text-stone-800">{trx.name}</p>
                         <p className="text-[10px] font-semibold text-stone-400">{formatDate(trx.created_at)}</p>
                       </div>
                     </div>
                     <span className={`text-sm font-extrabold ${trx.amount > 0 ? 'text-emerald-600' : 'text-stone-800'}`}>
                       {trx.amount > 0 ? '+' : ''}Rp {Math.abs(trx.amount).toLocaleString('id-ID')}
                     </span>
                   </div>
                 ))
               )}
             </div>
           </div>

           <div className="bg-[#FFF0F0] rounded-3xl border border-red-100 p-6 shadow-sm text-center">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-red-500 mx-auto mb-3 shadow-sm border border-red-50">
                <PieChart className="w-6 h-6"/>
              </div>
              <h3 className="font-bold text-red-900 mb-2">Peringatan Pemborosan</h3>
              <p className="text-sm text-red-700/80 mb-4">Ada Rp 35.000 nilai bahan makanan yang berpotensi terbuang minggu ini (Cabai & Susu).</p>
              <Link href="/ai-assistant" className="w-full flex items-center justify-center bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-full text-sm font-bold transition-colors">
                Tanya AI Cara Selamatkan
              </Link>
           </div>

        </div>

      </div>
    </div>
  );
}
