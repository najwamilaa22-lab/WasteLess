# System Architecture Documentation (ARCHITECTURE.md)
## Project: WasteLess (Platform Manajemen Food Waste, Nutrisi, dan Budgeting Rumah Tangga Berbasis AI)

**Versi:** 1.0  
**Tanggal:** 3 Juni 2026  
**Status:** Approved  
**Author:** Lead Enterprise Architect  
**Referensi Utama:** `PRD_WasteLess.md`, `WasteLess (1).pdf`, dan `BLUEPRINT RANCANGAN SISTEM.docx`

---

## 1. Kisi-Kisi Arsitektur (Architecture Overview)
Dokumen ini mendefinisikan desain arsitektur, pola integrasi, aliran data, dan struktur infrastruktur untuk platform **WasteLess**. Sistem dibangun menggunakan model **Monolith Terdistribusi Modern** berbasis **Next.js 14 App Router** yang dideploy di platform serverless **Vercel**, berkolaborasi secara asinkronus dengan layanan database **Supabase** serta **Orkestrasi Aliansi Multi-AI Agent (Multi-LLM)**.

Desain ini dibuat khusus untuk menjamin:
1. **Kecepatan Komputasi Multimodal:** Pemrosesan berkas gambar struk dalam hitungan detik.
2. **Efisiensi Biaya Token AI:** Pembagian beban kerja model bahasa besar (LLM) berdasarkan kompleksitas tugas operasional.
3. **Integritas Transaksi Data Finansial & Inventaris:** Sinkronisasi inventaris FIFO dengan modul log kerugian kas.

---

## 2. Diagram Blok Sistem (System Architecture Diagram)

```text
                               +-----------------------------------+
                               |       CLIENT LAYER (B2C)          |
                               |  Next.js 14 Client Components     |
                               |  Tailwind CSS (UI Responsive)     |
                               +-----------------------------------+
                                                 |
                                     HTTPS (REST / Server Actions)
                                                 |
                                                 v
                               +-----------------------------------+
                               |      SERVERLESS ROUTING LAYER     |
                               |      Vercel / Next.js API Routes  |
                               +-----------------------------------+
                                                 |
                       +-------------------------+-------------------------+
                       |                                                   |
                       v                                                   v
         +---------------------------+                       +---------------------------+
         |     DATA & STORAGE LAYER  |                       |   AI MULTI-AGENT ENGINE   |
         |                           |                       |   (API Integration Layer) |
         |  - Supabase PostgreSQL    |                       |                           |
         |  - Supabase Auth (JWT)    |                       |  - Gemini 1.5 Flash API   |
         |  - Supabase Object Storage|                       |  - Claude 3.5 Sonnet API  |
         +---------------------------+                       |  - OpenAI GPT-4o API      |
                       ^                                     +---------------------------+
                       |                                                   |
                       +----------------- Update Stok & Logs --------------+
```

---

## 3. Komponen Utama Arsitektur (Core Architectural Components)

### 3.1 Frontend & Orchestration Layer (Next.js 14)
* **App Router (Server Components):** Digunakan untuk merender halaman dashboard finansial, portal gaya hidup, dan profil inventaris dari sisi server (*Server-Side Rendering*) demi memangkas First Contentful Paint (FCP).
* **Client Components (React Event-Driven):** Digunakan pada halaman interaksi langsung seperti modul kamera *AI Smart Scanner*, ruang interaksi asisten chat virtual, dan visualisasi grafik interaktif.

### 3.2 Backend & Edge Compute Layer
* **Next.js API Routes:** Bertindak sebagai API Gateway internal yang mengamankan komunikasi data, mengabstraksi *API Key* pihak ketiga (Google, Anthropic, OpenAI), serta melakukan sanitasi payload masukan.
* **Supabase Edge Functions:** Digunakan untuk memproses fungsi-fungsi asinkronus jarak jauh yang membutuhkan pemicu (*database triggers*) atau berjalan di lingkungan runtime terisolasi yang dekat dengan wilayah server database.

### 3.3 Database & State Persistence Layer
* **Supabase PostgreSQL Engine:** Menyimpan data relasional transaksional (Stok kulkas, batas anggaran belanja, profil target gizi, dan riwayat kerugian finansial).
* **Supabase Object Storage:** Menyimpan aset statis media biner berupa foto struk belanja mentah (`.png`/`.jpeg`) dengan enkripsi di tingkat bucket penyimpanan.
* **Supabase Auth (Row Level Security - RLS):** Menangani daftaran akun dan manajemen sesi token JWT. Setiap tabel database dilindungi dengan kebijakan RLS ketat, memastikan data inventaris pangan hanya dapat dibaca dan dimodifikasi oleh pemilik akun (`auth.uid() = user_id`).

---

## 4. Orkestrasi Aliansi Multi-AI Agent (Multi-LLM Strategy)

Untuk menghindari kemacetan pemrosesan data (*bottleneck*) serta menghemat alokasi biaya token, subsistem kecerdasan buatan dibagi menjadi tiga agen terspesialisasi:

```text
[Foto Struk Belanja] ---> ( Gemini 1.5 API )  ---> JSON Terstruktur ---> [Pantry Database]
[Stok Kritis H-1]    ---> ( Claude 3.5 API )  ---> Formulasi Resep ---> [UI Meal Planner]
[Konsultasi Bebas]   ---> ( OpenAI GPT-4o )   ---> Chat Respon     ---> [UI Room Chat]
```

### 4.1 AI Smart Scanner Agent (Google Gemini 1.5 Flash/Pro)
* **Tugas Spesifik:** Pemindaian gambar struk dan pemetaan JSON terstruktur.
* **Alasan Pemilihan:** Memiliki keunggulan performa mutlak pada pemrosesan konteks *multimodal* (gambar ke teks) serta menawarkan latensi rendah dan biaya per token yang sangat bersaing.
* **Pola Aliran:** Menerima raw base64 dari API Route -> Melakukan ekstraksi OCR -> Memetakan baris teks menjadi objek larik JSON untuk di-insert ke tabel `pantry_assets`.

### 4.2 Smart Culinary Reasoning Agent (Anthropic Claude 3.5 Sonnet)
* **Tugas Spesifik:** Penalaran kombinasi resep makanan (*Culinary Reasoning Engine*).
* **Alasan Pemilihan:** Memiliki kemampuan logika penalaran kontekstual (*advanced reasoning*) terbaik di kelasnya untuk merangkai resep makanan yang aman, meminimalkan halusinasi kombinasi bahan masakan, serta menghitung estimasi porsi dan gizi mikro secara logis.
* **Pola Aliran:** Backend membaca daftar item berkategori 'Kritis' -> Mengirim data array bahan ke Claude API -> Claude menghasilkan instruksi masak terstruktur beserta kalkulasi nilai aset finansial yang berhasil diselamatkan.

### 4.3 WasteLess Interactive Assistant & NLP (OpenAI GPT-4o)
* **Tugas Spesifik:** Mengelola sesi percakapan natural dan ringkasan edukasi dapur.
* **Alasan Pemilihan:** Menyediakan kecepatan generasi teks natural yang optimal (*conversational fluidity*) serta kemampuan *context-retention* yang sangat stabil untuk mempertahankan riwayat obrolan panjang di dalam antarmuka UI Chat.

---

## 5. Aliran Data & Sequence Diagrams (Data Flow)

### 5.1 Siklus Input Belanja Otomatis (AI Smart Scanner)

```text
Pengguna (UI)             Next.js API Gateway        Supabase Storage       Gemini AI API       PostgreSQL DB
      |                             |                       |                     |                  |
      |--- 1. Unggah Foto Struk --->|                       |                     |                  |
      |                             |--- 2. Simpan Berkas ->|                     |                  |
      |                             |<-- 3. Berikan URL ----|                     |                  |
      |                             |                                             |                  |
      |                             |------------ 4. Kirim Payload Gambar ------->|                  |
      |                             |<----------- 5. Kembalikan Objek JSON -------|                  |
      |                             |                                                                |
      |                             |------------------------- 6. Bulk Insert Assets --------------->|
      |                             |<------------------------ 7. Konfirmasi Sukses -----------------|
      |<-- 8. Render Data Kulkas ---|                                                                |
```

### 5.2 Siklus Penyelamatan Bahan Pangan Kritis (AI Meal Planner)
1. Komponen Frontend memicu aksi "Cari Resep AI".
2. Next.js API Route menjalankan query internal ke tabel `pantry_assets` mencari item milik `user_id` dengan status `Kritis` atau `Warning` berdasar aturan FIFO.
3. Payload dikirim ke **Anthropic Claude API** dengan system prompt panduan resep masakan halal Indonesia.
4. Claude API mengembalikan skema data berisi judul menu masakan, takaran gizi, langkah-langkah, dan nominal rupiah yang berhasil diselamatkan dari limbah makanan.
5. Ketika pengguna menekan tombol "Konfirmasi Selesai Memasak", sebuah mutasi database dijalankan untuk memperbarui atau mengurangi kuantitas gramasi bahan masakan di tabel `pantry_assets`.

---

## 6. Pertimbangan Keamanan & Performansi (Security & NFRs)

### 6.1 Strategi Keamanan (Security Hardening)
* **Isolasi API Key:** Seluruh kunci API (*API Keys*) pihak ketiga disimpan dengan aman pada environment variables Vercel dan hanya dapat diakses melalui server runtime Next.js API Routes. Sisi klien (*browser*) tidak pernah memiliki akses ke kredensial ini.
* **Supabase Row Level Security (RLS):** Mencegah kebocoran data antar pengguna. Setiap query SQL diproteksi secara otomatis di level database menggunakan aturan:
  ```sql
  ALTER TABLE pantry_assets ENABLE ROW LEVEL SECURITY;
  CREATE POLICY "Pengguna hanya dapat mengelola data kulkas sendiri" 
  ON pantry_assets FOR ALL TO authenticated USING (auth.uid() = user_id);
  ```

### 6.2 Skalabilitas & Penanganan Kegagalan (Resilience & Failover)
* **Strategi Fallback LLM:** Jika salah satu API Agent (misalnya Claude API) mengalami batasan kuota (*rate limiting*) atau gangguan jaringan, API Gateway internal dikonfigurasikan untuk mengalihkan rute generasi resep masakan secara otomatis ke model cadangan (GPT-4o) untuk menjaga kelangsungan ketersediaan layanan aplikasi.
* **Caching Strategis:** Untuk portal berita dan info harga pasar harian (*Health & Lifestyle Insights*), sistem mengimplementasikan *Incremental Static Regeneration* (ISR) pada Next.js dengan durasi revalidasi setiap 1 jam untuk meminimalkan beban request API berulang ke server database.