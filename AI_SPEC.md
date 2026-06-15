# Artificial Intelligence Engineering & Orchestration Specification (AI_SPEC.md)
## Project: WasteLess (Platform Manajemen Food Waste, Nutrisi, dan Budgeting Rumah Tangga Berbasis AI)

**Versi:** 1.0  
**Tanggal:** 3 Juni 2026  
**Status:** Approved  
**Author:** Principal AI Engineer & Architect  
**Referensi Utama:** `PRD_WasteLess.md`, `ARCHITECTURE.md`, `WasteLess (1).pdf`, dan `BLUEPRINT RANCANGAN SISTEM.docx`

---

## 1. Pendahuluan & Filosofi Aliansi Multi-Agent (Multi-LLM Strategy)
Sistem Kecerdasan Buatan (AI) pada platform **WasteLess** tidak mengandalkan satu model tunggal. Aplikasi mengadopsi pendekatan **Aliansi Multi-Agent (Multi-LLM)** untuk mengoptimalkan tiga parameter krusial dalam rekayasa perangkat lunak modern:
1. **Akurasi Kontekstual & Penalaran Kognitif (Cognitive Accuracy):** Mencocokkan model terbaik untuk penyelesaian masalah logis tertentu.
2. **Latensi Operasional (Latency Efficiency):** Memastikan interaksi pengguna tetap responsif (< 5-6 detik untuk operasi berat).
3. **Efisiensi Biaya Token (Cost-Per-Token Optimization):** Mengurangi pengeluaran komputasi awan dengan mendistribusikan beban kerja ke model yang lebih hemat energi.

Sistem dibagi menjadi tiga agen terspesialisasi: **AI Smart Scanner** (Google Gemini), **Smart Culinary Reasoning** (Anthropic Claude), dan **Interactive Core Assistant** (OpenAI ChatGPT).

---

## 2. Arsitektur Agen AI & Pembagian Tugas (Agent Matrix)

```text
                               +-----------------------------------+
                               |     Next.js API Routes Layer      |
                               +-----------------------------------+
                                                 |
                       +-------------------------+-------------------------+
                       |                                                   |
                       v                                                   v
         +---------------------------+                       +---------------------------+
         |     MULTIMODAL INGESTION  |                       |    TEXT REASONING & NLP   |
         |  (Receipt Photo Analysis) |                       |  (Recipes & Interactive)  |
         +---------------------------+                       +---------------------------+
                       |                                                   |
                       v                                         +---------+---------+
         +---------------------------+                           v                   v
         |      Google Gemini        |                   +---------------+   +---------------+
         |    1.5 Flash / Pro        |                   | Anthropic Claude| |  OpenAI Chat  |
         | (OCR & JSON Extraction)   |                   |  3.5 Sonnet   |   |    GPT-4o     |
         +---------------------------+                   | (Meal Planner)|   | (Core Chatbot)|
                       |                                 +---------------+   +---------------+
                       |                                         |                   |
                       +-------------------+---------------------+-------------------+
                                           |
                                           v
                               +-----------------------------------+
                               |      Supabase PostgreSQL DB       |
                               +-----------------------------------+
```

---

## 3. Spesifikasi Teknis Agen AI & Integrasi API

### 3.1 AI Smart Scanner Agent (Google Gemini 1.5 Flash/Pro)
* **Model Endpoint:** `gemini-1.5-flash` (Default untuk efisiensi/kecepatan), fallback ke `gemini-1.5-pro` (Untuk gambar beresolusi rendah/buram).
* **Fitur Utama:** Ekstraksi data biner gambar struk belanjaan (*multimodal processing*) menjadi format JSON terstruktur.
* **Skema Input Pemanggilan:** Gambar berformat `image/jpeg` atau `image/png` (Base64 atau raw binary data) yang dikirim lewat Supabase Storage URL.

#### System Prompt & Rekayasa Instruksi (Prompt Engineering):
```text
Context: You are an expert Indonesian retail receipt parsing assistant. Your job is to analyze the provided image of a grocery receipt and extract item details accurately.
Instructions:
1. Identify all food, grocery, and raw cooking ingredients. Ignore non-grocery items (e.g., plastic bags, phone credit).
2. Clean the item names to be short, legible, and clear (e.g., "Bf Teriyaki Pack 500g" -> "Daging Sapi").
3. Estimate the weight or quantity in grams/units where possible based on common knowledge if not explicitly stated.
4. Output strict JSON format only. Do not wrap the JSON in markdown code blocks like ```json.

Output Schema:
{
  "items": [
    {
      "item_name": "String",
      "category": "String (Daging / Sayur / Telur / Susu / Bumbu / Lainnya)",
      "weight_quantity_gram": Float,
      "purchase_price": Integer
    }
  ]
}
```

---

### 3.2 Smart Culinary Reasoning Agent (Anthropic Claude 3.5 Sonnet)
* **Model Endpoint:** `claude-3-5-sonnet-20240620`
* **Fitur Utama:** Penalaran tingkat tinggi (*Advanced Logical Reasoning*) untuk menyusun kombinasi menu makanan kreatif Indonesia berdasarkan sisa stok bahan makanan yang mendekati masa pembusukan.
* **Sifat Komputasi:** Berjalan secara sinkronus saat tombol "Cari Resep AI" dipicu oleh pengguna.

#### Skema Payload Input JSON (Context Object dari Database):
```json
{
  "user_profile": {
    "target_calories_daily": 2100,
    "dietary_restrictions": "Halal Indonesian Cuisine Only"
  },
  "critical_ingredients": [
    {"item_name": "Daging Sapi", "weight_quantity_gram": 500, "days_left": 1},
    {"item_name": "Bayam", "weight_quantity_gram": 200, "days_left": 1}
  ],
  "supporting_ingredients": [
    {"item_name": "Telur Ayam", "weight_quantity_gram": 180, "days_left": 5},
    {"item_name": "Bawang Merah", "weight_quantity_gram": 50, "days_left": 12}
  ]
}
```

#### Prompt Rekayasa Logika Resep:
```text
Context: You are a professional Zero-Waste Chef specializing in Indonesian healthy home cooking.
Task: Create up to 3 recipe recommendations. You MUST prioritize using ALL items from 'critical_ingredients' to prevent food waste.
Financial Metric: Based on the ingredients used, estimate the domestic financial asset saved by not throwing away the critical components.

Output Format Requirement: Return a JSON array of objects containing: 'recipe_name', 'estimated_duration_minutes', 'critical_items_used', 'steps' (array of strings), 'nutritional_summary' (calories, protein, carbo, fiber), and 'estimated_savings_idr'.
```

---

### 3.3 WasteLess Interactive Assistant & NLP (OpenAI GPT-4o)
* **Model Endpoint:** `gpt-4o`
* **Fitur Utama:** Agen percakapan natural (*Chatbot Core*), pengelolaan retensi memori konteks percakapan di dalam UI Chat Room, serta perangkum artikel harian (*Lifestyle Feed Builder*).
* **Parameter Teknis:** `temperature=0.7` (Untuk keseimbangan respons kreatif namun tetap akurat), `max_tokens=800`.

#### System Prompt Panduan Karakter Agen:
```text
Role: You are 'WasteLess AI', a witty, empathetic, and smart kitchen companion for Najwa. Your goal is to guide users to live a healthier, minimalist, and budget-friendly lifestyle by reducing food waste.
Tone: Friendly, casual Indonesian (use terms like 'kamu', 'aku', 'yuk'), clear, and concise. Avoid robotic lecturing.
Knowledge Boundaries: Only answer queries related to food management, shelf-life extensions, recipe substitutions, kitchen hacks, budgeting, and nutrition. Politely deflect unrelated political or non-kitchen queries.
```

---

## 4. Format Keluaran JSON Terpadu & Validasi Penanganan Galat

### 4.1 Validasi Struktur Data AI
Untuk memastikan output dari pihak ketiga (LLM) tidak merusak alur aplikasi Next.js, setiap respons string mentah wajib divalidasi melintasi blok parser serverless sebelum dimasukkan ke database Supabase PostgreSQL:

```typescript
// Contoh implementasi skema validasi runtime di Next.js API Routes menggunakan TypeScript
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const rawAiResponse = await callGeminiAPI(req);
    
    // Sanitasi paksa jika AI membungkus dengan tag Markdown markdown
    const cleanJsonString = rawAiResponse.replace(/```json|```/g, '').trim();
    const parsedData = JSON.parse(cleanJsonString);
    
    if (!parsedData.items || !Array.isArray(parsedData.items)) {
      throw new Error("Invalid structure: 'items' array is missing.");
    }
    
    // Lakukan bulk insert aman ke tabel pantry_assets Supabase
    return NextResponse.json({ success: true, data: parsedData });
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: "AI_PARSING_FAILED", 
      message: error.message 
    }, { status: 422 });
  }
}
```

---

## 5. Parameter Ambang Batas Kegagalan & Ketahanan (Failover Guardrails)

* **Skema Penurunan Skala Model Otomatis (Degraded Fallback Matrix):**
  Jika endpoint utama mengalami kendala jaringan atau pembatasan limit kuota API, gerbang backend Next.js API Routes wajib mengalihkan rute operasional ke model sekunder dalam waktu < 2 detik:
  
  | Fitur Operasional | Model Utama (Primary) | Model Cadangan (Fallback) |
  | :--- | :--- | :--- |
  | **Pencatatan Resep Kreatif** | Anthropic Claude 3.5 Sonnet | OpenAI GPT-4o |
  | **Pemindaian OCR Struk** | Google Gemini 1.5 Flash | Google Gemini 1.5 Pro |
  | **Asisten Chat Ruang Utama** | OpenAI GPT-4o | OpenAI GPT-4-mini |

* **Proteksi Halusinasi AI:** Konten instruksi masak yang digenerasikan secara acak oleh Claude AI disaring menggunakan pustaka regex internal untuk mendeteksi kata-kata terlarang atau tidak higienis sebelum ditampilkan pada antarmuka *Smart Recipe For You*.