import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@/lib/supabase/server'; // Ensure this path matches your setup

// Initialize the Gemini SDK using your server-side secret key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: Request) {
  try {
    const { content, modality } = await req.json();
    
    if (!content) {
      return NextResponse.json({ error: 'No content provided' }, { status: 400 });
    }

    // =========================================================================
    // STEP 1: The "Wizard of Oz" Emotion Detection
    // We force Gemini to return strict JSON so we can save it directly to the DB.
    // =========================================================================
    const flashModel = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const emotionPrompt = `
      Analyze this diary entry and return ONLY a valid JSON object with no markdown formatting. 
      It must contain exactly two keys: 
      "valence_score" (a number from -1.0 to 1.0 representing negative to positive sentiment)
      "dominant_emotion" (a single word string describing the core feeling, e.g., 'Anxious', 'Calm', 'Excited').
      
      Entry: "${content}"
    `;
    
    const emotionResult = await flashModel.generateContent(emotionPrompt);
    // Strip out any potential markdown code blocks Gemini might try to add
    const emotionText = emotionResult.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
    const emotionData = JSON.parse(emotionText);

    // =========================================================================
    // STEP 2: Generate Vector Embeddings for Mock GraphRAG
    // This converts the text into a 768-dimensional array of numbers.
    // =========================================================================
    const embeddingModel = genAI.getGenerativeModel({ model: 'gemini-embedding-001' });
    const embeddingResult = await embeddingModel.embedContent(content);
    const embedding = embeddingResult.embedding.values;

    // =========================================================================
    // STEP 3: Save to Supabase (pgvector)
    // =========================================================================
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('entries')
      .insert({
        text_content: content,
        modality: modality || 'text',
        valence_score: emotionData.valence_score,
        dominant_emotion: emotionData.dominant_emotion,
        embedding: embedding
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase Error:", error);
      throw error;
    }

    return NextResponse.json({ success: true, entry: data });

  } catch (error) {
    console.error('Ingest API Pipeline Error:', error);
    return NextResponse.json({ error: 'Failed to process entry' }, { status: 500 });
  }
}