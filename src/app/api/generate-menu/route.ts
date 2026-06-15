import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const apiKey = process.env.ANTHROPIC_CLAUDE_API_KEY;
const anthropic = apiKey ? new Anthropic({ apiKey }) : null;

export async function POST(req: Request) {
  try {
    const { criticalIngredients } = await req.json();

    if (!criticalIngredients || !Array.isArray(criticalIngredients)) {
      return NextResponse.json({ error: 'Bahan kritis tidak ditemukan' }, { status: 400 });
    }

    // Fallback if no API key is provided
    if (!anthropic) {
      console.warn("ANTHROPIC_CLAUDE_API_KEY is not set. Using mock recipe generator fallback.");
      // Wait 1.5s to simulate API call latency
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const mockRecipes = [
        {
          recipe_name: "Beef Teriyaki & Tumis Bayam Gurih",
          estimated_duration_minutes: 15,
          critical_items_used: ["Daging Sapi", "Bayam"],
          steps: [
            "Iris tipis daging sapi, marinasi dengan kecap manis, saus teriyaki, dan bawang putih cincang selama 5 menit.",
            "Panaskan sedikit minyak, tumis bawang bombay hingga harum, lalu masukkan daging sapi termarinasi. Masak hingga matang dan empuk.",
            "Di wajan terpisah, tumis bawang merah, bawang putih, dan irisan cabai, lalu masukkan bayam yang sudah dicuci bersih. Tambahkan garam dan gula secukupnya. Tumis cepat selama 2 menit.",
            "Sajikan Beef Teriyaki hangat berdampingan dengan Tumis Bayam segar."
          ],
          nutritional_summary: {
            calories: 450,
            protein: 28,
            carbo: 15,
            fiber: 4
          },
          estimated_savings_idr: 75000
        },
        {
          recipe_name: "Sop Daging Hangat ala Dapur Minimalis",
          estimated_duration_minutes: 25,
          critical_items_used: ["Daging Sapi"],
          steps: [
            "Rebus daging sapi dalam air mendidih selama 10-15 menit untuk membuat kaldu gurih. Angkat busa yang mengapung.",
            "Masukkan irisan wortel, kentang, dan bumbu halus (bawang putih, merica, pala).",
            "Setelah daging empuk, tambahkan daun bawang dan seledri.",
            "Sajikan sup hangat dengan taburan bawang goreng."
          ],
          nutritional_summary: {
            calories: 380,
            protein: 24,
            carbo: 12,
            fiber: 3
          },
          estimated_savings_idr: 70000
        }
      ];

      return NextResponse.json({ success: true, recipes: mockRecipes, mock: true });
    }

    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20240620',
      max_tokens: 1000,
      system: 'Anda adalah Zero-Waste Chef profesional Indonesia. Tugas Anda menyusun resep sehat halal berdasarkan bahan kritis yang diberikan. Kembalikan data dalam format JSON murni.',
      messages: [
        {
          role: 'user',
          content: `Buat 2-3 resep masakan dari daftar bahan kritis yang hampir basi berikut ini: ${JSON.stringify(criticalIngredients)}. 
          Output wajib berformat JSON array dengan properti: recipe_name, estimated_duration_minutes, critical_items_used (array), steps (array dari string), nutritional_summary (objek berisi calories, protein, carbo, fiber), dan estimated_savings_idr.
          Kembalikan HANYA string JSON mentah. Jangan sertakan pembukaan atau penutupan percakapan.`
        }
      ]
    });

    const contentBlock = response.content[0];
    const responseText = contentBlock.type === 'text' ? contentBlock.text : '';
    const cleanJson = responseText.replace(/```json|```/g, '').trim();
    
    return NextResponse.json({ success: true, recipes: JSON.parse(cleanJson) });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Claude API Error:", error);
    return NextResponse.json({ error: 'CLAUDE_REASONING_FAILED', message: errorMessage }, { status: 500 });
  }
}
