'use client';

import { useState, useEffect } from 'react';
import { Camera, Plus, Trash2, Check, RefreshCw, AlertCircle, ShoppingBag, Calendar } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface PantryItem {
  id: string;
  item_name: string;
  category: string;
  weight_quantity_gram: number;
  purchase_price: number;
  purchase_date: string;
  estimated_expiry_date: string;
  status: string; // 'Segar', 'Warning', 'Kritis', 'Dikonsumsi'
}

export default function Inventory() {
  const [items, setItems] = useState<PantryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [scanModalOpen, setScanModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [scannedItems, setScannedItems] = useState<Omit<PantryItem, 'id' | 'status' | 'purchase_date' | 'estimated_expiry_date'>[]>([]);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  // Form states for manual add
  const [newItem, setNewItem] = useState({
    item_name: '',
    category: 'Sayur',
    weight_quantity_gram: 200,
    purchase_price: 10000,
    shelf_life_days: 5
  });

  // Load items on mount
  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUserId(session.user.id);
        fetchPantryItems(session.user.id);
      }
    };
    init();
  }, []);

  const fetchPantryItems = async (uid: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('pantry_assets')
        .select('*')
        .eq('user_id', uid)
        .order('estimated_expiry_date', { ascending: true });

      if (error) {
        console.error(error);
      } else {
        setItems(data as PantryItem[]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Helper to calculate status color
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Kritis':
        return { badge: 'bg-red-50 text-red-700 border-red-200/50', border: 'border-red-200 bg-red-50/20', dot: 'bg-red-500' };
      case 'Warning':
        return { badge: 'bg-amber-50 text-amber-700 border-amber-200/50', border: 'border-amber-200 bg-amber-50/20', dot: 'bg-amber-500' };
      default:
        return { badge: 'bg-emerald-50 text-emerald-700 border-emerald-200/50', border: 'border-stone-200/80 bg-white/70', dot: 'bg-emerald-500' };
    }
  };

  // Simulate receipt scanner triggering Gemini API
  const handleReceiptUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show image preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    setLoading(true);
    try {
      // Call scan-receipt API
      const res = await fetch('/api/scan-receipt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: 'placeholder_for_local_testing' })
      });
      const result = await res.json();
      if (result.success && result.data?.items) {
        setScannedItems(result.data.items);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Confirm adding OCR items to digital fridge
  const handleConfirmScannedItems = async () => {
    const today = new Date();
    const formattedToday = today.toISOString().split('T')[0];

    const itemsToSave = scannedItems.map((item, index) => {
      // Auto estimate expiry days based on category
      let shelfLife = 3;
      if (item.category === 'Sayur') shelfLife = 4;
      if (item.category === 'Telur') shelfLife = 14;
      if (item.category === 'Susu') shelfLife = 7;
      if (item.category === 'Bumbu') shelfLife = 30;

      const expiryDate = new Date();
      expiryDate.setDate(today.getDate() + shelfLife);
      const formattedExpiry = expiryDate.toISOString().split('T')[0];

      // Expiry status checks
      let itemStatus = 'Segar';
      if (shelfLife <= 1) itemStatus = 'Kritis';
      else if (shelfLife <= 2) itemStatus = 'Warning';

      return {
        id: `scanned-${Date.now()}-${index}`,
        item_name: item.item_name,
        category: item.category,
        weight_quantity_gram: item.weight_quantity_gram,
        purchase_price: item.purchase_price,
        purchase_date: formattedToday,
        estimated_expiry_date: formattedExpiry,
        status: itemStatus
      };
    });

    try {
      const dbInsertPayload = itemsToSave.map(i => ({
        user_id: userId,
        item_name: i.item_name,
        category: i.category,
        weight_quantity_gram: i.weight_quantity_gram,
        purchase_price: i.purchase_price,
        purchase_date: i.purchase_date,
        estimated_expiry_date: i.estimated_expiry_date,
        status: i.status
      }));
      const { data } = await supabase.from('pantry_assets').insert(dbInsertPayload).select();
      if (data) {
         setItems([...data, ...items]);
      } else {
         setItems([...itemsToSave, ...items]);
      }
    } catch (e) {
      console.warn("DB Insert failed, logging to local state instead", e);
      setItems([...itemsToSave, ...items]);
    }

    setScanModalOpen(false);
    setScannedItems([]);
    setImagePreview(null);
  };

  // Handle manual item add
  const handleManualAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const today = new Date();
    const formattedToday = today.toISOString().split('T')[0];
    const expiryDate = new Date();
    expiryDate.setDate(today.getDate() + newItem.shelf_life_days);
    const formattedExpiry = expiryDate.toISOString().split('T')[0];

    let itemStatus = 'Segar';
    if (newItem.shelf_life_days <= 1) itemStatus = 'Kritis';
    else if (newItem.shelf_life_days <= 2) itemStatus = 'Warning';

    const itemObj = {
      id: `manual-${Date.now()}`,
      item_name: newItem.item_name,
      category: newItem.category,
      weight_quantity_gram: newItem.weight_quantity_gram,
      purchase_price: newItem.purchase_price,
      purchase_date: formattedToday,
      estimated_expiry_date: formattedExpiry,
      status: itemStatus
    };

    try {
      const { data } = await supabase.from('pantry_assets').insert({
        user_id: userId,
        item_name: itemObj.item_name,
        category: itemObj.category,
        weight_quantity_gram: itemObj.weight_quantity_gram,
        purchase_price: itemObj.purchase_price,
        purchase_date: itemObj.purchase_date,
        estimated_expiry_date: itemObj.estimated_expiry_date,
        status: itemObj.status
      }).select();
      
      if (data && data.length > 0) {
         setItems([data[0], ...items]);
      } else {
         setItems([itemObj, ...items]);
      }
    } catch (e) {
      console.warn(e);
      setItems([itemObj, ...items]);
    }

    setAddModalOpen(false);
    setNewItem({
      item_name: '',
      category: 'Sayur',
      weight_quantity_gram: 200,
      purchase_price: 10000,
      shelf_life_days: 5
    });
  };

  // Consume / Use item (reduces weight or marks as consumed)
  const handleConsumeItem = async (id: string, amount: number) => {
    const targetItem = items.find(item => item.id === id);
    if (!targetItem) return;

    const remainingWeight = Math.max(0, targetItem.weight_quantity_gram - amount);
    
    if (remainingWeight === 0) {
      // Remove item / mark as fully consumed
      setItems(items.filter(item => item.id !== id));
      try {
        await supabase.from('pantry_assets').delete().eq('id', id);
      } catch (e) {
        console.warn(e);
      }
    } else {
      // Update weight
      setItems(items.map(item => item.id === id ? { ...item, weight_quantity_gram: remainingWeight } : item));
      try {
        await supabase.from('pantry_assets').update({ weight_quantity_gram: remainingWeight }).eq('id', id);
      } catch (e) {
        console.warn(e);
      }
    }
  };

  // Mark as wasted (wastes the item, creates a waste log entry)
  const handleWasteItem = async (id: string, reason: string) => {
    const targetItem = items.find(item => item.id === id);
    if (!targetItem) return;

    // Log to waste logs table
    const wasteEntry = {
      user_id: userId,
      pantry_asset_id: id.startsWith('manual') || id.startsWith('scanned') ? null : id,
      item_name: targetItem.item_name,
      wasted_weight_gram: targetItem.weight_quantity_gram,
      financial_loss: targetItem.purchase_price,
      waste_reason: reason
    };

    try {
      await supabase.from('waste_logs').insert(wasteEntry);
      if (!id.startsWith('manual') && !id.startsWith('scanned')) {
         await supabase.from('pantry_assets').delete().eq('id', id);
      }
    } catch (e) {
      console.warn(e);
    }

    setItems(items.filter(item => item.id !== id));
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      
      {/* Top Banner Alert if items are critical */}
      {items.some(i => i.status === 'Kritis') && (
        <div className="mb-8 flex items-center justify-between rounded-xl bg-red-50 border border-red-200/50 p-4 text-red-800 animate-pulse-border">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
            <div>
              <p className="text-sm font-bold">Waste Alert!</p>
              <p className="text-xs text-red-700 font-medium">Ada beberapa bahan pangan yang kritis (H-1 sebelum basi) dan perlu segera diolah.</p>
            </div>
          </div>
          <button 
            onClick={() => window.location.href='/ai-assistant'}
            className="rounded-full bg-red-600 px-3.5 py-1 text-xs font-semibold text-white hover:bg-red-700 shadow-sm"
          >
            Temukan Resep AI
          </button>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-emerald-950">Kulkas Digital</h1>
          <p className="text-sm text-stone-500 font-medium mt-1">Kelola dan pantau stok makanan dapur Anda dengan logika FIFO.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setScanModalOpen(true)}
            className="flex items-center gap-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 text-sm font-semibold shadow-md shadow-emerald-100 transition-all duration-200"
          >
            <Camera className="h-4 w-4" />
            Scan Struk AI
          </button>
          <button
            onClick={() => setAddModalOpen(true)}
            className="flex items-center gap-2 rounded-full border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 px-4 py-2.5 text-sm font-semibold shadow-sm transition-colors"
          >
            <Plus className="h-4 w-4 text-stone-500" />
            Tambah Manual
          </button>
        </div>
      </div>

      {/* Main Grid View */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <RefreshCw className="h-8 w-8 text-emerald-600 animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-stone-300 p-12 bg-white/50 text-center">
          <ShoppingBag className="h-12 w-12 text-stone-400 mb-4" />
          <h3 className="text-lg font-bold text-stone-800">Kulkas Digital Kosong</h3>
          <p className="text-sm text-stone-500 max-w-sm mt-1">Mulai tambahkan bahan makanan Anda dengan memindai struk belanja atau input manual!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item) => {
            const styles = getStatusStyle(item.status);
            return (
              <div 
                key={item.id}
                className={`relative flex flex-col justify-between rounded-2xl border p-5 shadow-sm hover:shadow-md transition-all duration-200 ${styles.border}`}
              >
                <div>
                  {/* Top line category & status dot */}
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">{item.category}</span>
                    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold ${styles.badge}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${styles.dot}`}></span>
                      {item.status}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-stone-900 mt-3">{item.item_name}</h3>
                  
                  {/* Item details */}
                  <div className="mt-4 space-y-2 text-xs font-semibold text-stone-500">
                    <div className="flex justify-between">
                      <span>Kuantitas:</span>
                      <span className="text-stone-700">{item.weight_quantity_gram} gram</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Harga Beli:</span>
                      <span className="text-stone-700">Rp {item.purchase_price.toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between items-center text-[11px] pt-2 border-t border-stone-200/50">
                      <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> Kedaluwarsa:</span>
                      <span className="text-stone-800 font-bold">{item.estimated_expiry_date}</span>
                    </div>
                  </div>
                </div>

                {/* Operations */}
                <div className="mt-6 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleConsumeItem(item.id, item.weight_quantity_gram)}
                    className="flex-grow flex items-center justify-center gap-1 rounded-full bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white border border-emerald-200/40 py-2 text-xs font-bold transition-all duration-200"
                  >
                    <Check className="h-3.5 w-3.5" />
                    Habiskan
                  </button>
                  <button
                    onClick={() => handleWasteItem(item.id, 'Membusuk')}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-red-50 hover:bg-red-600 text-red-600 hover:text-white border border-red-200/40 transition-all duration-200"
                    title="Buang ke Tong Sampah"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal 1: Scan Struk AI */}
      {scanModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl animate-fade-in">
            <h3 className="text-xl font-bold text-stone-950 flex items-center gap-2">
              <Camera className="h-5 w-5 text-emerald-600" />
              Scan Struk Belanjaan Anda
            </h3>
            <p className="text-xs text-stone-500 font-semibold mt-1">Kamera AI akan memindai barang & harga secara otomatis.</p>
            
            <div className="mt-6 border-2 border-dashed border-stone-200 rounded-xl p-6 flex flex-col items-center justify-center bg-stone-50/50">
              {imagePreview ? (
                <div className="relative w-full max-h-48 overflow-hidden rounded-lg">
                  <img src={imagePreview} alt="Receipt Preview" className="w-full h-full object-contain" />
                </div>
              ) : (
                <div className="text-center">
                  <Camera className="h-8 w-8 text-stone-400 mx-auto mb-2" />
                  <span className="text-xs text-stone-500 font-bold">Pilih foto struk belanja untuk dipindai</span>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleReceiptUpload}
                className="mt-4 text-xs font-semibold"
              />
            </div>

            {/* OCR Extracted Items confirmed preview */}
            {scannedItems.length > 0 && (
              <div className="mt-5 max-h-40 overflow-y-auto border border-stone-200 rounded-xl p-3 bg-white space-y-2">
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-stone-400">Hasil Deteksi Gemini AI:</p>
                {scannedItems.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-xs font-bold border-b border-stone-100 pb-1">
                    <span className="text-stone-800">{item.item_name} <span className="text-[10px] text-stone-400">({item.category})</span></span>
                    <span className="text-stone-600">{item.weight_quantity_gram}g - Rp{item.purchase_price.toLocaleString('id-ID')}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => { setScanModalOpen(false); setScannedItems([]); setImagePreview(null); }}
                className="rounded-full px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-50"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmScannedItems}
                disabled={scannedItems.length === 0}
                className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 text-xs font-semibold shadow-md disabled:opacity-50"
              >
                Konfirmasi Masuk Kulkas
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Tambah Manual */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-sm p-4">
          <form onSubmit={handleManualAdd} className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl animate-fade-in">
            <h3 className="text-xl font-bold text-stone-950 flex items-center gap-2">
              <Plus className="h-5 w-5 text-emerald-600" />
              Input Bahan Makanan Manual
            </h3>
            
            <div className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-600 mb-1.5">Nama Bahan Makanan</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Wortel, Keju, Tempe"
                  value={newItem.item_name}
                  onChange={e => setNewItem({ ...newItem, item_name: e.target.value })}
                  className="block w-full rounded-xl border border-stone-200 px-3 py-2 text-xs focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-600 mb-1.5">Kategori</label>
                  <select
                    value={newItem.category}
                    onChange={e => setNewItem({ ...newItem, category: e.target.value })}
                    className="block w-full rounded-xl border border-stone-200 px-3 py-2 text-xs focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="Sayur">Sayur</option>
                    <option value="Daging">Daging</option>
                    <option value="Telur">Telur</option>
                    <option value="Suku">Susu</option>
                    <option value="Bumbu">Bumbu</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-600 mb-1.5">Berat (Gram)</label>
                  <input
                    type="number"
                    required
                    value={newItem.weight_quantity_gram}
                    onChange={e => setNewItem({ ...newItem, weight_quantity_gram: Number(e.target.value) })}
                    className="block w-full rounded-xl border border-stone-200 px-3 py-2 text-xs focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-600 mb-1.5">Harga Beli (Rp)</label>
                  <input
                    type="number"
                    required
                    value={newItem.purchase_price}
                    onChange={e => setNewItem({ ...newItem, purchase_price: Number(e.target.value) })}
                    className="block w-full rounded-xl border border-stone-200 px-3 py-2 text-xs focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-600 mb-1.5">Masa Simpan (Hari)</label>
                  <input
                    type="number"
                    required
                    value={newItem.shelf_life_days}
                    onChange={e => setNewItem({ ...newItem, shelf_life_days: Number(e.target.value) })}
                    className="block w-full rounded-xl border border-stone-200 px-3 py-2 text-xs focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setAddModalOpen(false)}
                className="rounded-full px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-50"
              >
                Batal
              </button>
              <button
                type="submit"
                className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 text-xs font-semibold shadow-md"
              >
                Simpan
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
