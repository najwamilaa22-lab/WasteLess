import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Format pesan tidak valid' }, { status: 400 });
    }

    const lastUserMessage = messages[messages.length - 1]?.content || "";

    // Fallback if no API key is provided
    if (!genAI) {
      console.warn("GEMINI_API_KEY is not set. Using mock kitchen chatbot assistant fallback.");
      // Wait 1s to simulate network request
      await new Promise((resolve) => setTimeout(resolve, 1000));

      let responseText = "Halo Najwa! Aku WasteLess AI. Aku siap membantumu menghemat belanjaan dan mengurangi sisa makanan di kulkas. Ada bahan yang ingin kamu olah hari ini? (Ini adalah mode simulasi karena API Key belum dipasang)";

      const lowerMessage = lastUserMessage.toLowerCase();
      if (lowerMessage.includes("bayam")) {
        responseText = "Bayam sebaiknya disimpan dengan cara dicuci bersih, dikeringkan sepenuhnya dengan tisu dapur, lalu dimasukkan ke dalam wadah kedap udara yang dilapisi tisu baru. Cara ini bisa membuat bayam segar hingga 5 hari lho!";
      } else if (lowerMessage.includes("daging")) {
        responseText = "Untuk daging sapi segar, jika tidak dimasak hari ini, segera bagi menjadi porsi sekali masak dan masukkan ke wadah kedap udara, lalu bekukan di freezer. Daging beku bisa bertahan hingga 3-6 bulan!";
      } else if (lowerMessage.includes("resep") || lowerMessage.includes("masak")) {
        responseText = "Yuk cobain resep kreasi Zero-Waste! Kamu tinggal pilih menu 'Cari Resep AI' di halaman dashboard utama untuk memanfaatkan sisa bahan makanan kritis di kulkasmu.";
      } else if (lowerMessage.includes("hemat") || lowerMessage.includes("budget")) {
        responseText = "Tips hemat belanja: Selalu buat daftar belanjaan berdasarkan menu seminggu yang sudah dirancang (*Meal Prep*), dan terapkan aturan FIFO (First In First Out) di kulkas agar tidak ada bahan makanan yang terbuang sia-sia!";
      }

      return NextResponse.json({
        success: true,
        choices: [{ message: { role: "assistant", content: responseText } }],
        mock: true
      });
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-pro"
    });

    const formattedMessages = messages.slice(0, -1).map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    while (formattedMessages.length > 0 && formattedMessages[0].role === 'model') {
      formattedMessages.shift();
    }

    const SYSTEM_PROMPT = "You are 'WasteLess AI', a witty, empathetic, and smart kitchen companion for Najwa. Your goal is to guide users to live a healthier, minimalist, and budget-friendly lifestyle by reducing food waste. Use friendly, casual Indonesian tone (use terms like 'kamu', 'aku', 'yuk'), clear, and concise. Avoid robotic lecturing. Knowledge Boundaries: Only answer queries related to food management, shelf-life extensions, recipe substitutions, kitchen hacks, budgeting, and nutrition. Politely deflect unrelated political or non-kitchen queries.";

    const historyWithSystem = [
      { role: 'user', parts: [{ text: SYSTEM_PROMPT + "\\n\\nAyo mulai obrolan kita!" }] },
      { role: 'model', parts: [{ text: "Halo Najwa! Aku WasteLess AI, siap membantumu menghemat belanjaan dan mengurangi sisa makanan di kulkas. Ada yang bisa kubantu?" }] },
      ...formattedMessages
    ];

    const chat = model.startChat({
      history: historyWithSystem,
    });

    const result = await chat.sendMessage(lastUserMessage);
    const responseText = result.response.text();

    return NextResponse.json({
      success: true,
      choices: [{ message: { role: "assistant", content: responseText } }]
    });

  } catch (error: unknown) {
    let errorMessage = error instanceof Error ? error.message : String(error);
    
    // Debugging step: if it's a 404 model not found, let's fetch the list of available models for this API key
    try {
      if (apiKey && errorMessage.includes('404')) {
        const modelsRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const modelsData = await modelsRes.json();
        if (modelsData && modelsData.models) {
          type ModelType = { supportedGenerationMethods?: string[], name: string };
          const availableModels = modelsData.models
            .filter((m: ModelType) => m.supportedGenerationMethods?.includes('generateContent'))
            .map((m: ModelType) => m.name)
            .join(', ');
          errorMessage += `\\n\\n[DEBUG] Model yang tersedia untuk API Key Anda: ${availableModels || 'TIDAK ADA'}`;
        } else {
          errorMessage += `\\n\\n[DEBUG] Gagal melist model: ${JSON.stringify(modelsData)}`;
        }
      }
    } catch (_) {
      // Ignore inner error
    }

    console.error("Gemini API Error:", error);
    return NextResponse.json({ error: 'CHATBOT_FAILED', message: errorMessage }, { status: 500 });
  }
}
