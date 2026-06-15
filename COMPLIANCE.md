# Compliance & Regulatory Framework Documentation (COMPLIANCE.md)
## Project: WasteLess (Platform Manajemen Food Waste, Nutrisi, dan Budgeting Rumah Tangga Berbasis AI)

**Versi:** 1.0  
**Tanggal:** 3 Juni 2026  
**Status:** Approved  
**Author:** Legal, Sharia Compliance, & Data Protection Officer  
**Referensi Utama:** `PRD_WasteLess.md`, `ARCHITECTURE.md`, `WasteLess (1).pdf`, dan `BLUEPRINT RANCANGAN SYSTEMS.docx`

---

## 1. Pendahuluan (Introduction)
Dokumen **COMPLIANCE.md** ini dirancang untuk memastikan bahwa platform **WasteLess** beroperasi sesuai dengan koridor hukum posisif yang berlaku di Indonesia serta memenuhi prinsip Tata Kelola Ekonomi Syariah. Fokus utama kepatuhan ini mencakup perlindungan data pribadi pengguna (*Data Privacy*), kepatuhan transaksi finansial domestik, dan mitigasi perilaku konsumtif yang bertentangan dengan nilai *Thayyiban* dan larangan *Tabdzir*.

---

## 2. Kepatuhan Syariah (Sharia Compliance & Halal Governance)

Berdasarkan landasan filosofis pada dokumen `BLUEPRINT RANCANGAN SISTEM.docx`, platform WasteLess memosisikan diri sebagai instrumen pendukung gaya hidup berkelanjutan yang sejalan dengan maqashid syariah (menjaga harta/*Hifzh al-Mal* dan menjaga jiwa/*Hifzh an-Nafs*).

### 2.1 Mitigasi Tabdzir (Anti-Mubazir Monitoring)
* **Aturan Prinsip:** Sistem secara aktif dirancang untuk mencegah perilaku *Tabdzir* (membuang-buang sesuatu yang masih memiliki nilai manfaat secara sia-sia).
* **Implementasi Teknis:** Algoritma pemindaian cerdas (FIFO) dan penentuan status *pantry_assets* (Hijau, Kuning, Merah) berfungsi sebagai pengingat berbasis teknologi untuk mengeliminasi kelalaian rumah tangga yang mengakibatkan bahan pangan membusuk tanpa dikonsumsi.
* **Audit Kerugian Finansial:** Fitur *Waste-to-Cash Analytics* bertindak sebagai instrumen muhasabah (evaluasi) finansial riil agar pengguna sadar akan dampak kerugian ekonomi dari makanan yang dibuang.

### 2.2 Aspek Thayyiban (Kesehatan & Keamanan Pangan)
* **Aturan Kerja AI:** Rekomendasi menu masakan yang diproduksi oleh **Smart Culinary Reasoning Agent (Claude AI)** wajib mengutamakan integrasi gizi berimbang, serta menghindari saran kombinasi bahan makanan yang membahayakan kesehatan atau tidak higienis.
* **Penyaringan Konten:** Database internal dilarang keras menyimpan, memproses, atau merekomendasikan resep yang menggunakan bahan dasar yang tidak halal atau tidak sesuai dengan standar konsumsi muslim di Indonesia.

---

## 3. Perlindungan Data Pribadi (PDP) & Regulasi UU No. 27/2022

Sebagai platform yang mengolah data pribadi (nama, email, foto struk belanja, dan kebiasaan konsumsi rumah tangga), WasteLess tunduk sepenuhnya pada **Undang-Undang Perlindungan Data Pribadi (UU PDP) No. 27 Tahun 2022** di Indonesia.

### 3.1 Transparansi Pemrosesan Data (Persetujuan Pengguna)
* **Mekanisme Persetujuan (Consent):** Saat melakukan registrasi (*Sign Up*), pengguna wajib memberikan persetujuan eksplisit terhadap *Kebijakan Privasi* dan *Syarat & Ketentuan Layanan*.
* **Tujuan Khusus Pembacaan Struk:** Foto struk belanja yang diunggah ke *AI Smart Scanner* hanya diproses untuk mengekstrak informasi inventaris makanan milik pengguna tersebut ke dalam tabel `pantry_assets`. Data ini tidak boleh diperjualbelikan kepada pihak ketiga atau pengiklan tanpa persetujuan tertulis yang terpisah.

### 3.2 Keamanan Data Teknis (Technical Hardening)
* **Penyimpanan Gambar Berkas:** Foto struk belanja fisik yang disimpan pada *Supabase Object Storage* wajib diisolasi menggunakan token URL bertenggat (*Authenticated Signed URLs*). Gambar mentah tidak boleh diakses oleh publik secara bebas.
* **Row Level Security (RLS) PostgreSQL:** Enkondisian kebijakan RLS pada database Supabase memastikan tidak terjadi kebocoran horizontal antar pengguna, di mana `user_id` yang terautentikasi melalui token JWT hanya bisa melihat baris datanya sendiri.

### 3.3 Hak Subjek Data (Right to Be Forgotten)
* **Penghapusan Akun Total:** Platform wajib menyediakan fitur yang memungkinkan pengguna menghapus akun mereka secara permanen dari sistem.
* **Penghapusan Kaskade (Cascade Deletion):** Ketika proses penghapusan disetujui, sistem secara otomatis akan menghapus seluruh catatan terkait pada tabel `budget_settings`, `nutrition_profiles`, `pantry_assets`, dan `waste_logs` demi kepatuhan hak penghapusan informasi pribadi secara menyeluruh.

---

## 4. Keamanan Informasi & Manajemen API Pihak Ketiga (Multi-LLM Compliance)

Karena arsitektur WasteLess mengandalkan tiga penyedia LLM eksternal (Google Gemini, Anthropic Claude, dan OpenAI ChatGPT), tata kelola pengiriman data wajib diawasi secara ketat.

### 4.1 Kebijakan Pengiriman Data (Data Transit Policy)
* **Data Anonimitas:** Payload data teks yang dikirimkan ke endpoint API Claude untuk memformulasikan resep, atau ke API OpenAI untuk ruang chat, dilarang mengandung informasi identitas pribadi sensitif (seperti nama lengkap pengguna, nomor telepon, atau detail kartu pembayaran). 
* **Hanya Data Agregat:** Hanya array mentah nama bahan makanan dan bobot gramasi yang boleh dikirimkan ke mesin AI luar (Contoh: `["Daging Sapi 500g", "Bayam 200g"]`).

### 4.2 Manajemen API Keys & Environment Variables
* **Larangan Eksposur Klien:** Semua API Keys dari Google Gemini, Anthropic Claude, dan OpenAI wajib diisolasi di sisi serverless (*Vercel Environment Variables Code*). Tidak boleh ada pemanggilan API AI langsung yang dilakukan dari komponen sisi klien (*React Client-Side Components*).

---

## 5. Kepatuhan Transaksi & Finansial Domestik

Meskipun WasteLess versi 1.0 bertindak sebagai platform pencatatan internal (*budgeting tracker*) dan tidak memproses transaksi pembayaran atau pemindahan dana antar bank secara langsung, platform tetap berkomitmen menerapkan transparansi keuangan:

* **Akurasi Nilai Tukar & Harga:** Sistem pencatatan harga beli barang pada tabel database wajib menggunakan satuan mata uang Rupiah (IDR) resmi untuk menghindari kebingungan pencatatan akuntansi rumah tangga.
* **Pemisahan Log Audit:** Pencatatan log kerugian pada tabel `waste_logs` didasarkan pada rumus nilai sisa aset riil yang disusutkan secara linier terhadap volume barang yang terbuang, memberikan nilai transparansi audit keuangan domestik yang objektif.