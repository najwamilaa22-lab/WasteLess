# WasteLess - Platform Manajemen Food Waste, Nutrisi, dan Budgeting Rumah Tangga Berbasis Multi-AI Agent

WasteLess adalah platform web inovatif terintegrasi yang dirancang untuk membantu pengelolaan ekosistem dapur rumah tangga secara cerdas dan sistematis. Menggabungkan pelacakan inventaris makanan digital (*Digital Fridge*) dengan analisis anggaran belanja keuangan (*Budgeting*) serta pemenuhan gizi keluarga (*Nutrition Tracker*). 

Melalui arsitektur mutakhir **Multi-AI Agent (Google Gemini, Anthropic Claude, dan OpenAI ChatGPT)**, platform ini mampu mereduksi penumpukan limbah makanan domestik (*Food Waste*), mengeliminasi kebocoran keuangan akibat bahan masakan membusuk (*Waste Logs*), sekaligus mendukung pola makan sehat yang bernilai ekonomis (*Thayyiban*).

---

## 🚀 Fitur Unggulan

1. **AI Smart Scanner (OCR & Data Structuring - Powered by Gemini 1.5):** 
   Otomatisasi input belanjaan kulkas hanya dengan memotret struk belanja fisik supermarket atau pasar tradisional. Sistem secara instan mengekstrak item, berat/kuantitas, dan harga beli ke dalam database.
2. **Freshness Dashboard (FIFO System):** 
   Visualisasi berkala aset pangan digital menggunakan indikator warna tingkat urgensi (Hijau = Aman, Kuning = Peringatan, Merah = Kritis) yang berjalan dengan algoritma *First In, First Out*.
3. **AI Meal Planner & Recipe Generator (Powered by Claude 3.5 Sonnet):** 
   Fitur rekomendasi menu masakan harian otomatis dengan memprioritaskan sisa stok bahan makanan dapur yang berstatus kritis (merah) untuk diselamatkan dari potensi pembuangan.
4. **Waste-to-Cash & Budget Analytics:** 
   Panel metrik audit yang menghitung secara transparan akumulasi kerugian finansial riil (Rupiah) dari makanan yang kedaluwarsa atau terbuang dibanding pagu anggaran belanja bulanan (*Budget Ceiling*).
5. **Interactive Core Assistant (Powered by GPT-4o):** 
   Asisten virtual dapur yang siaga merespons pertanyaan natural seputar tips penyimpanan bahan masakan, cara memperpanjang kesegaran pangan, dan artikel gaya hidup sehat.

---

## 🛠️ Spesifikasi Teknologi & Multi-AI Stack

### Stack Utama
* **Frontend:** Next.js 14 (App Router), Tailwind CSS, Lucide React Icons
* **Backend:** Next.js API Routes, Supabase Edge Functions (Serverless Architecture)
* **Database & Cloud Storage:** Supabase PostgreSQL & Supabase Object Storage
* **Deployment Platform:** Vercel

### Aliansi Multi-AI Agent
Sistem mengimplementasikan skema orkestrasi *Multi-LLM* secara asinkronus untuk performa biaya dan akurasi terbaik:
* **Google Gemini AI API:** Spesialis pengolah data *multimodal* untuk ekstraksi gambar struk belanja menjadi struktur objek JSON.
* **Anthropic Claude API:** Spesialis logika kuliner tingkat lanjut (*advanced reasoning*) untuk formulasi kalkulasi resep, takaran gizi, dan konversi taksiran penyelamatan aset pangan.
* **OpenAI API (ChatGPT):** Spesialis pemrosesan bahasa alami (NLP) untuk percakapan interaktif (*Chatbot UI*) dan kompilasi *Lifestyle Feed*.

---

## 📂 Struktur Repositori

```text
wasteless-platform/
├── src/
│   ├── app/                 # Next.js 14 App Router (Layouts, Pages)
│   │   ├── dashboard/       # Freshness Dashboard & Analitik Radar Gizi
│   │   ├── inventory/       # Manajemen Digital Fridge (FIFO UI)
│   │   ├── ai-assistant/    # Chatbot Room UI (OpenAI Integration)
│   │   └── api/             # Next.js Serverless API Endpoints
│   │       ├── scan-receipt/# Handler OCR Multimodal Gemini AI
│   │       ├── generate-menu/# Logic Penalaran Resep Claude AI
│   │       └── chat-core/   # Endpoint Percakapan GPT-4o
│   ├── components/          # Reusable UI Components (Cards, Charts, Layout)
│   ├── lib/                 # Utilitas Inisialisasi SDK (Supabase, AI Clients)
│   └── styles/              # Konfigurasi Global Styles & Tailwind CSS
├── supabase/
│   ├── migrations/          # Berkas Migrasi Skema Database SQL
│   └── seed.sql             # Data Awal Kategori Kedaluwarsa Bahan Pangan
├── public/                  # Static Assets (Images, Icons)
├── package.json             # Dependensi Proyek
└── README.md                # Dokumentasi Utama
```

---

## 🗄️ Menyiapkan Skema Database

WasteLess berjalan di atas PostgreSQL (Supabase). Eksekusi script SQL berikut pada SQL Editor di dashboard Supabase Anda untuk membangun relasi tabel data:

```sql
-- Tabel 1: Batas Anggaran Bulanan
CREATE TABLE budget_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    budget_ceiling NUMERIC(12, 2) NOT NULL,
    current_spending NUMERIC(12, 2) DEFAULT 0.00,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tabel 2: Profil Nutrisi Target
CREATE TABLE nutrition_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    target_calories INT NOT NULL,
    target_carbo_gram INT,
    target_protein_gram INT,
    target_fiber_gram INT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tabel 3: Inventaris Kulkas (Pantry Assets)
CREATE TABLE pantry_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    item_name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    weight_quantity_gram NUMERIC(10, 2) NOT NULL,
    purchase_price NUMERIC(12, 2) NOT NULL,
    purchase_date DATE DEFAULT CURRENT_DATE,
    estimated_expiry_date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'Segar', -- 'Segar' (Hijau), 'Warning' (Kuning), 'Kritis' (Merah)
    is_consumed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tabel 4: Audit Kerugian Pangan (Waste Logs)
CREATE TABLE waste_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    pantry_asset_id UUID REFERENCES pantry_assets(id) ON DELETE SET NULL,
    item_name VARCHAR(255) NOT NULL,
    wasted_weight_gram NUMERIC(10, 2) NOT NULL,
    financial_loss NUMERIC(12, 2) NOT NULL,
    waste_reason VARCHAR(255),
    logged_at TIMESTAMP DEFAULT NOW()
);
```

---

## ⚙️ Panduan Instalasi Lokal

### 1. Klon Repositori
```bash
git clone https://github.com/username/wasteless-platform.git
cd wasteless-platform
```

### 2. Instalasi Dependensi
```bash
npm install
# atau
yarn install
```

### 3. Konfigurasi Environment Variables
Buat berkas bernama `.env.local` di root direktori proyek, lalu lengkapi variabel berikut dengan kunci API kredensial Anda:

```env
# Kredensial Supabase
NEXT_PUBLIC_SUPABASE_URL=https://id-proyek-anda.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsIn...

# Multi-AI Agent API Keys
GOOGLE_GEMINI_API_KEY=AIzaSyA4X...
ANTHROPIC_CLAUDE_API_KEY=sk-ant-sid01...
OPENAI_API_KEY=sk-proj-4o...
```

### 4. Jalankan Aplikasi di Lingkungan Lokal
```bash
npm run dev
# atau
yarn dev
```
Buka [http://localhost:3000](http://localhost:3000) pada browser Anda untuk melihat aplikasi berjalan.

---

## 🛡️ Alur Validasi QA & Pengujian Fitur
* **Validasi Gambar Struk:** Pastikan format gambar struk belanja jelas dan memiliki pencahayaan cukup sebelum diunggah ke *AI Smart Scanner* agar API Gemini dapat menguraikan teks item dengan akurasi maksimal.
* **Pengujian Siklus FIFO:** Untuk memverifikasi sistem alert, ubah kolom `estimated_expiry_date` salah satu item pangan di tabel `pantry_assets` menjadi H-1 melalui dashboard Supabase, lalu verifikasi apakah komponen UI di *Freshness Dashboard* otomatis berubah warna menjadi merah (Kritis).
* **Integrasi Pemotongan Stok:** Saat mengeksekusi resep rekomendasi dari Claude AI, pastikan sisa berat kuantitas (`weight_quantity_gram`) pada item terkait otomatis berkurang atau terhapus di database jika kuantitasnya telah habis dikonsumsi.