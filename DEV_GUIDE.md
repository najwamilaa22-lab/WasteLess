# Developer Implementation & Setup Guide (DEV_GUIDE.md)
## Project: WasteLess (Platform Manajemen Food Waste, Nutrisi, dan Budgeting Rumah Tangga Berbasis AI)

**Versi:** 1.0  
**Tanggal:** 3 Juni 2026  
**Status:** Approved  
**Author:** Core Engineering Lead  
**Referensi Utama:** `PRD_WasteLess.md`, `ARCHITECTURE.md`, dan `AI_SPEC.md`

---

## 1. Pendahuluan & Prasyarat Lokal
Dokumen **DEV_GUIDE.md** ini dirancang sebagai panduan praktis langkah-demi-langkah bagi pengembang perangkat lunak (*Frontend*, *Backend*, dan *Fullstack Engineer*) untuk menyiapkan lingkungan pengembangan lokal, menulis kode komponen inti, serta mengintegrasikan modul aliansi Multi-AI Agent pada proyek platform **WasteLess**.

### 1.1 Prasyarat Perangkat Lunak (Prerequisites)
Sebelum memulai instalasi, pastikan mesin lokal Anda telah terinstal kakas berikut:
* **Node.js:** Versi `18.17.0` atau lebih baru (Direkomendasikan menggunakan v20 LTS).
* **Package Manager:** `npm` (bawaan Node) atau `yarn`.
* **Git:** Untuk manajemen Repositori.
* **Supabase CLI (Opsional):** Untuk pengelolaan migrasi basis data lokal secara mandiri.

---

## 2. Inisialisasi Proyek & Struktur Manajemen Berkas

### 2.1 Klon Repositori & Instalasi Dependensi
Jalankan perintah berikut pada terminal Anda untuk mengunduh kode sumber dan memasang pustaka dependensi pihak ketiga:

```bash
# Klon kode sumber dari repositori utama
git clone https://github.com/username/wasteless-platform.git
cd wasteless-platform

# Pasang paket dependensi proyek
npm install
```

### 2.2 Dependensi Utama Package.json
Proyek ini mengandalkan paket-paket berikut dalam `package.json` untuk menjamin fungsionalitas UI, grafik analitik, konektivitas database, serta integrasi Multi-LLM:
* `@supabase/supabase-js`: SDK resmi untuk interaksi database, storage, dan auth.
* `@google/generative-ai`: SDK resmi untuk pemanggilan API Gemini 1.5.
* `@anthropic-ai/sdk`: SDK resmi untuk konektivitas Claude 3.5 Sonnet.
* `openai`: SDK resmi untuk penanganan modul chat ChatGPT (GPT-4o).
* `lucide-react`: Paket ikon minimalis untuk komponen visual antarmuka.
* `recharts`: Pustaka grafik interaktif berbasis SVG untuk merender Radar Chart nutrisi dan Bar Chart keuangan.

---

## 3. Konfigurasi Lingkungan Pengembangan (.env.local)

Buat sebuah berkas baru bernama `.env.local` pada direktori root proyek Anda, lalu isi dengan format variabel lingkungan (*environment variables*) berikut. Mintalah kredensial token resmi kepada *Project Manager* atau *Lead Engineer* Anda:

```env
# Kredensial Akses Gateway Supabase (Aman diakses Klien & Server)
NEXT_PUBLIC_SUPABASE_URL=https://id-proyek-anda.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Kunci API Rahasia Multi-LLM Agent (HANYA boleh diakses di Sisi Server / API Routes)
GOOGLE_GEMINI_API_KEY=AIzaSyA4X_ExampleKeyGemini2026
ANTHROPIC_CLAUDE_API_KEY=sk-ant-sid01-ExampleKeyClaude2026
OPENAI_API_KEY=sk-proj-4o-ExampleKeyOpenAICore2026
```

> ⚠️ **Peringatan Keamanan Penting:** Jangan pernah menambahkan prefiks `NEXT_PUBLIC_` pada kunci API `GOOGLE_GEMINI_API_KEY`, `ANTHROPIC_CLAUDE_API_KEY`, atau `OPENAI_API_KEY`. Hal ini mencegah token rahasia bocor ke sisi peramban (*client-side browser*) pengguna.

---

## 4. Implementasi Kode Sisi Server (Next.js API Routes)

Berikut adalah panduan template penulisan kode untuk mengintegrasikan logika Multi-AI Agent pada API internal aplikasi Next.js 14 (App Router).

### 4.1 Modul Pemindaian Struk Belanja (`src/app/api/scan-receipt/route.ts`)
Modul ini menerima berkas gambar base64, mengirimkannya ke **Google Gemini 1.5 Flash**, dan mengembalikan skema data JSON terstruktur untuk dimasukkan ke dalam database.

```typescript
import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/generative-ai';

// Inisialisasi Klien Gemini menggunakan API Key dari Environment
const genAI = new GoogleGenAI({ apiKey: process.env.GOOGLE_GEMINI_API_KEY || '' });

export async function POST(req: Request) {
  try {
    const { imageBase64 } = await req.json();
    
    if (!imageBase64) {
      return NextResponse.json({ error: 'Data gambar tidak ditemukan' }, { status: 400 });
    }

    // Panggil model multimodal gemini-1.5-flash
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const prompt = `Analisis foto struk belanjaan ini. Ekstrak semua barang bahan makanan mentah/masakan. 
    Ubah nama barang menjadi nama umum yang bersih (Contoh: "Bf Teriyaki Pack 500g" menjadi "Daging Sapi").
    Berikan output dalam bentuk format JSON bersih tanpa bungkus markdown. 
    Skema: { "items": [ { "item_name": "Nama", "category": "Daging/Sayur/Lainnya", "weight_quantity_gram": 500, "purchase_price": 70000 } ] }`;

    const imagePart = {
      inlineData: {
        data: imageBase64,
        mimeType: 'image/jpeg'
      }
    };

    const response = await model.generateContent([prompt, imagePart]);
    const responseText = response.response.text();
    
    // Sanitasi paksa jika AI membungkus string dengan blok kode markdown
    const cleanJsonString = responseText.replace(/```json|```/g, '').trim();
    const resultData = JSON.parse(cleanJsonString);

    return NextResponse.json({ success: true, data: resultData });
  } catch (error: any) {
    return NextResponse.json({ error: 'AI_PARSING_FAILED', message: error.message }, { status: 500 });
  }
}
```

### 4.2 Modul Rekomendasi Resep Kreatif (`src/app/api/generate-menu/route.ts`)
Modul ini dipanggil saat pengguna menekan tombol "Cari Resep AI", mengeksekusi logika penalaran kuliner melalui **Anthropic Claude 3.5 Sonnet**.

```typescript
import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_CLAUDE_API_KEY || '' });

export async function POST(req: Request) {
  try {
    const { criticalIngredients } = await req.json(); // Array dari database

    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20240620',
      max_tokens: 1000,
      system: 'Anda adalah Zero-Waste Chef profesional Indonesia. Tugas Anda menyusun resep sehat halal berdasarkan bahan kritis.',
      messages: [
        {
          role: 'user',
          content: `Buat resep masakan dari daftar bahan kritis yang hampir basi berikut ini: ${JSON.stringify(criticalIngredients)}. 
          Output wajib berformat JSON array dengan properti: recipe_name, estimated_duration_minutes, steps (array), estimated_savings_idr.`
        }
      ]
    });

    // Ambil teks respons dari Claude
    const responseText = response.content[0].text;
    const cleanJson = responseText.replace(/```json|```/g, '').trim();
    
    return NextResponse.json({ success: true, recipes: JSON.parse(cleanJson) });
  } catch (error: any) {
    return NextResponse.json({ error: 'CLAUDE_REASONING_FAILED', message: error.message }, { status: 500 });
  }
}
```

---

## 5. Sinkronisasi Mutasi Stok Antarmuka Klien (Frontend Mutates)

Ketika pengguna menyetujui rekomendasi resep dan mengonfirmasi aktivitas "Selesai Memasak", komponen frontend wajib mengirimkan request mutasi untuk mengurangi kuantitas bahan makanan atau menghapus item yang habis di database Supabase.

### Alur Sinkronisasi Kode:
1. Panggil endpoint `/api/generate-menu` untuk merender kartu komponen `SmartRecipeCard`.
2. Pengguna mengklik tombol `CTA "Masak Menu Ini"`.
3. Jalankan fungsi mutasi klien Supabase:
   ```typescript
   // Contoh mutasi pengurangan stok setelah aksi memasak selesai
   const { data, error } = await supabase
     .from('pantry_assets')
     .update({ weight_quantity_gram: sisaGramasi, status: 'Dikonsumsi' })
     .eq('id', pantryAssetId);
   ```
4. Panggil fungsi `router.refresh()` atau mutasi *SWR / React Query state* untuk memperbarui indikator warna di *Freshness Dashboard* secara instan tanpa memuat ulang seluruh halaman peramban.

---

## 6. Protokol Pengujian & Penanganan Masalah (Troubleshooting)

### 6.1 Validasi Respons JSON AI Gagal
* **Gejala:** Muncul error `SyntaxError: Unexpected token ... in JSON at position 0` pada log server konsol Next.js.
* **Solusi:** Hal ini terjadi karena model LLM mengembalikan teks pembuka di luar objek JSON (seperti *"Tentu, ini resep untukmu..."*). Pastikan fungsi regex `.replace(/```json|```/g, '').trim()` berjalan sempurna, atau perketat instruksi *System Prompt* Anda dengan menambahkan frasa: `"Return ONLY a raw JSON string. Do not include any conversational introduction or conclusion text."`

### 6.2 Kebijakan Supabase RLS Memblokir Request
* **Gejala:** Query `SELECT` atau `INSERT` mengembalikan array kosong `[]` atau kode galat status 401 meskipun pengguna sudah login.
* **Solusi:** Pastikan token otentikasi sesi JWT pengguna dikirimkan pada header header request melalui SDK Supabase. Periksa kembali pengaturan kebijakan Row Level Security (RLS) di dasbor Supabase, pastikan aturan pengecekan `auth.uid() = user_id` telah diaktifkan untuk operasi tabel `pantry_assets`.