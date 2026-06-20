import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export async function POST(req: Request) {
  try {
    const { mealName } = await req.json();

    if (!mealName) {
      return NextResponse.json({ error: 'Nama makanan tidak boleh kosong' }, { status: 400 });
    }

    if (!genAI) {
      // Mock response if API key is missing
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return NextResponse.json({
        calories: 350,
        protein: 15,
        carbs: 40,
        fat: 12
      });
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: "You are a nutrition expert. Estimate the nutritional value of the following food/meal. Respond ONLY with a valid JSON object containing exactly these numeric keys: 'calories', 'protein', 'carbs', 'fat'. Do NOT include markdown formatting like ```json. If you are unsure, provide a standard average estimate.",
    });

    const prompt = `Tolong estimasi nutrisi untuk makanan ini: "${mealName}". Ingat, balas HANYA dengan objek JSON. Contoh: {"calories": 300, "protein": 10, "carbs": 40, "fat": 5}`;
    
    const result = await model.generateContent(prompt);
    let responseText = result.response.text().trim();
    
    // Clean up potential markdown formatting if model ignores instruction
    if (responseText.startsWith('```json')) {
      responseText = responseText.substring(7);
    }
    if (responseText.startsWith('```')) {
      responseText = responseText.substring(3);
    }
    if (responseText.endsWith('```')) {
      responseText = responseText.substring(0, responseText.length - 3);
    }

    const nutritionData = JSON.parse(responseText);

    return NextResponse.json({
      calories: Number(nutritionData.calories) || 0,
      protein: Number(nutritionData.protein) || 0,
      carbs: Number(nutritionData.carbs) || 0,
      fat: Number(nutritionData.fat) || 0,
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Gemini Estimate Nutrition Error:", errorMessage);
    
    // Fallback if AI fails (to prevent crashing)
    return NextResponse.json({
      calories: 300,
      protein: 10,
      carbs: 30,
      fat: 10,
      error: errorMessage
    });
  }
}
