# Security Policy & Implementation Specification (SECURITY.md)
## Project: WasteLess (Platform Manajemen Food Waste, Nutrisi, dan Budgeting Rumah Tangga Berbasis AI)

**Versi:** 1.0  
**Tanggal:** 3 Juni 2026  
**Status:** Approved  
**Author:** Chief Information Security Officer (CISO) & Lead DevSecOps  
**Referensi Utama:** `PRD_WasteLess.md`, `ARCHITECTURE.md`, `AI_SPEC.md`, dan `BLUEPRINT RANCANGAN SISTEM.docx`

---

## 1. Pendahuluan & Filosofi DevSecOps (Introduction)
Dokumen **SECURITY.md** ini mendefinisikan postur keamanan, kebijakan perlindungan data, mitigasi ancaman, dan spesifikasi arsitektur keamanan untuk platform **WasteLess**. Mengingat aplikasi ini mengintegrasikan data sensitif rumah tangga—termasuk pola konsumsi gizi, batasan anggaran finansial keluarga, serta berkas digital struk belanja—keamanan diposisikan sebagai pilar utama sejak awal siklus pengembangan (*Security by Design*).

Platform WasteLess menerapkan model **Zero Trust** pada lapisan arsitektur perangkat lunak dan mengadopsi praktik **DevSecOps** untuk mengotomatisasi pemindaian kerentanan pada alur integrasi berkelanjutan (CI/CD).

---

## 2. Model Ancaman & Vektor Serangan (Threat Modeling & Attack Vectors)

Untuk melindungi integritas aplikasi, tim DevSecOps memetakan potensi risiko keamanan berdasarkan framework STRIDE:

| Vektor Ancaman | Deskripsi Risiko pada Platform WasteLess | Strategi Mitigasi Utama |
| :--- | :--- | :--- |
| **Spoofing Identity** | Penyerang memalsukan identitas digital pengguna untuk mengakses profil kulkas (*Digital Fridge*) korban. | Penerapan Supabase Auth berbasis token JWT bertenggat waktu ketat dilengkapi enkripsi MFA. |
| **Tampering Data** | Modifikasi ilegal pada parameter `budget_ceiling` atau nilai aset keuangan di tabel database. | Validasi skema ketat di tingkat API server dan Row Level Security (RLS) pada PostgreSQL. |
| **Information Disclosure** | Kebocoran foto struk belanja mentah di cloud storage yang menampilkan lokasi ritel atau detail kartu debit. | Proteksi bucket Supabase Storage menggunakan *Authenticated Signed URLs* berdurasi pendek. |
| **Denial of Service (DoS)** | Eksploitasi endpoint pemindaian AI secara berulang untuk membengkakkan biaya token API pengembang. | Implementasi pembatasan laju request (*Rate Limiting*) di level Edge Network Vercel. |

---

## 3. Arsitektur Keamanan Multi-LLM Agent (AI Security Guardrails)

Arsitektur Multi-AI Agent (Gemini, Claude, ChatGPT) memerlukan penanganan perimeter keamanan khusus guna mencegah eksploitasi manipulasi instruksi (*Prompt Injection*) dan kebocoran data saat transit.

```text
  [ Client Browser ]
          |
    ( HTTPS TLS 1.3 )
          |
          v
  [ Next.js API Gateway ] --( Menyembunyikan Secret Keys via Environment Variables )
          |
          +------> Payload Anonim (Hanya Nama Bahan & Gramasi) -------> [ Pihak Ketiga: API LLM ]
          |                                                              (Gemini / Claude / OpenAI)
          +------> Logika Sanitasi String & Validasi Regex Regex ------> [ PostgreSQL DB ]
```

### 3.1 Isolasi API Credentials & Runtime Lingkungan
* **Larangan Eksposur Klien:** Seluruh kunci token API (`GOOGLE_GEMINI_API_KEY`, `ANTHROPIC_CLAUDE_API_KEY`, dan `OPENAI_API_KEY`) disimpan sebagai *Secret Variables* terenkripsi pada infrastruktur Vercel. Kunci-kunci tersebut hanya dimuat ke dalam runtime lingkungan sisi server (*Server-Side Node.js Environment*) dan tidak pernah diekspos ke klien.
* **Gateway Abstraksi:** Klien tidak diizinkan melakukan konektivitas langsung ke endpoint vendor AI. Semua request wajib melalui Next.js API Routes yang bertindak sebagai proksi penyaring keamanan.

### 3.2 Keamanan Data Saat Transit (Data Minimization in Transit)
* **Anonimisasi Payload:** Sebelum data dikirim ke Anthropic Claude API untuk kebutuhan kalkulasi resep masakan, gerbang serverless wajib melakukan pembersihan identitas. Data pengguna seperti `nama`, `email`, atau `user_id` dihapus dari muatan payload. AI hanya menerima larik teks mentah berupa komponen bahan masakan (Contoh: `["Bayam 200g", "Daging Sapi 500g"]`).

### 3.3 Mitigasi Prompt Injection & Validasi Output
* **Sanitasi Output Parser:** Hasil generasi teks dari AI rentan disisipi kode berbahaya jika model mengalami halusinasi atau manipulasi instruksi. Serverless backend wajib melakukan sanitasi string menggunakan fungsi pembersih regex dan memastikan string yang diterima lolos validasi `JSON.parse()` sebelum dijalankan ke database.

---

## 4. Keamanan Lapisan Basis Data (Database Security & Row Level Security)

WasteLess menggunakan **Supabase PostgreSQL** sebagai mesin penyimpanan data utama. Keamanan di tingkat baris tabel dikendalikan secara mutlak menggunakan kebijakan **Row Level Security (RLS)**.

### 4.1 Kebijakan RLS (Row Level Security Policies)
Secara bawaan (*default*), seluruh tabel menolak akses baca-tulis dari luar sebelum aturan RLS disetujui. Aturan ini memastikan pengguna yang terautentikasi hanya dapat mengelola baris data yang memiliki nilai `user_id` cocok dengan ID klaim token JWT (`auth.uid()`).

Berikut adalah perintah SQL pengetatan keamanan yang diterapkan pada database produksi:

```sql
-- Mengaktifkan proteksi RLS pada seluruh tabel operasional
ALTER TABLE budget_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutrition_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE pantry_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE waste_logs ENABLE ROW LEVEL SECURITY;

-- Kebijakan Tabel Inventaris Kulkas (Pantry Assets)
CREATE POLICY "Pengguna hanya dapat melihat data kulkas miliknya"
ON pantry_assets FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Pengguna hanya dapat menambahkan data ke kulkas miliknya"
ON pantry_assets FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Pengguna hanya dapat memperbarui stok kulkas miliknya"
ON pantry_assets FOR UPDATE TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Pengguna hanya dapat menghapus item kulkas miliknya"
ON pantry_assets FOR DELETE TO authenticated
USING (auth.uid() = user_id);
```

---

## 5. Proteksi Repositori & Siklus CI/CD (DevSecOps Pipelines)

Kepatuhan keamanan kode sumber dipantau secara otomatis pada setiap siklus pengiriman perubahan kode:

* **Pencegahan Kebocoran Kredensial (Secret Scanning):** Repositori Git dikonfigurasikan dengan kakas **GitGuardian** atau **GitHub Secret Scanning** untuk mendeteksi secara instan jika ada pengembang yang secara tidak sengaja menuliskan baris API Key mentah ke dalam berkas komitmen kode (*git commit*).
* **Pemindaian Dependensi (Dependency Vulnerability Audit):** Proses build pada CI/CD pipeline Vercel akan otomatis dibatalkan jika kakas pengaudit menemukan pustaka dependensi yang memiliki celah keamanan kritis (*Critical Vulnerabilities*) berdasarkan database CVE (*Common Vulnerabilities and Exposures*). Pengembang wajib menjalankan `npm audit fix` sebelum melakukan merge kode ke cabang `main`.

---

## 6. Protokol Pelaporan Kerentanan & Penanganan Insiden (Vulnerability Reporting)

Jika Anda menemukan celah keamanan (*Bug/Vulnerability*) pada platform WasteLess, kami meminta Anda untuk tidak menyebarluaskannya secara publik demi melindungi privasi pengguna. Mohon ikuti prosedur penanganan berikut:

1. **Kanal Pelaporan:** Kirimkan detail temuan teknis Anda, termasuk langkah-langkah untuk mereproduksi celah tersebut (*Proof of Concept*), melalui email tim respons insiden kami di: `security@wasteless-platform.com`.
2. **Enkripsi Komunikasi:** Disarankan menggunakan enkripsi PGP untuk mengamankan pesan laporan Anda.
3. **Waktu Respons Triage:** Tim Security Operations Center (SOC) kami akan memberikan konfirmasi tanda terima dalam waktu maksimal 24 jam kerja, dan akan merilis perbaikan tambalan keamanan (*security patch*) dalam rentang waktu 72 jam setelah kerentanan divalidasi.
4. **Program Penghargaan (Bug Bounty):** Platform WasteLess menghargai kontribusi para peneliti keamanan (*ethical hackers*) yang melaporkan celah secara bertanggung jawab melalui skema pemberian insentif kompensasi yang diatur dalam kebijakan internal perusahaan.