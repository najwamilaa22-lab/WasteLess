import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini Client
const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export async function POST(req: Request) {
  try {
    const { imageBase64 } = await req.json();

    if (!imageBase64) {
      return NextResponse.json({ error: 'Data gambar tidak ditemukan' }, { status: 400 });
    }

    // Fallback if no API key is provided for testing convenience
    if (!genAI) {
      console.warn("GOOGLE_GEMINI_API_KEY is not set. Using mock receipt parsing fallback.");
      // Wait 1.5s to simulate network latency
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      const mockResult = {
        items: [
          { item_name: "Daging Sapi", category: "Daging", weight_quantity_gram: 500, purchase_price: 70000 },
          { item_name: "Bayam", category: "Sayur", weight_quantity_gram: 200, purchase_price: 5000 },
          { item_name: "Telur Ayam", category: "Telur", weight_quantity_gram: 480, purchase_price: 24000 },
          { item_name: "Susu UHT", category: "Susu", weight_quantity_gram: 1000, purchase_price: 18000 }
        ]
      };
      return NextResponse.json({ success: true, data: mockResult, mock: true });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `Analisis foto struk belanjaan ini. Ekstrak semua barang bahan makanan mentah/masakan. 
    Ubah nama barang menjadi nama umum yang bersih (Contoh: "Bf Teriyaki Pack 500g" menjadi "Daging Sapi").
    Berikan output dalam bentuk format JSON bersih tanpa bungkus markdown. 
    Skema: { "items": [ { "item_name": "Nama", "category": "Daging/Sayur/Telur/Susu/Bumbu/Lainnya", "weight_quantity_gram": 500, "purchase_price": 70000 } ] }`;

    const imagePart = {
      inlineData: {
        data: imageBase64.replace(/^data:image\/\w+;base64,/, ""),
        mimeType: 'image/jpeg'
      }
    };

    const response = await model.generateContent([prompt, imagePart]);
    const responseText = response.response.text();

    // Sanitize string if markdown code block wraps it
    const cleanJsonString = responseText.replace(/```json|```/g, '').trim();
    const resultData = JSON.parse(cleanJsonString);

    return NextResponse.json({ success: true, data: resultData });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Gemini API Error:", error);
    return NextResponse.json({ error: 'AI_PARSING_FAILED', message: errorMessage }, { status: 500 });
  }
}
