import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@/lib/supabase/server';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: Request) {
  try {
    // 1. Extract the audio file from the FormData
    const formData = await req.formData();
    const audioFile = formData.get('audio') as Blob;

    if (!audioFile) {
      return NextResponse.json({ error: 'No audio provided' }, { status: 400 });
    }

    // 2. Convert the Blob to Base64 so Gemini can read it
    const arrayBuffer = await audioFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Audio = buffer.toString('base64');

    // 3. The "Wizard of Oz" Multimodal Prompt
    const flashModel = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const prompt = `
      Listen to this audio diary entry. 
      Return ONLY a valid JSON object with no markdown formatting. 
      It must contain exactly three keys: 
      "transcript" (the exact words spoken by the user)
      "valence_score" (a number from -1.0 to 1.0 representing negative to positive sentiment)
      "dominant_emotion" (a single word string describing the core feeling, e.g., 'Anxious', 'Calm', 'Excited').
    `;

    const result = await flashModel.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: audioFile.type || 'audio/webm',
          data: base64Audio
        }
      }
    ]);

    const responseText = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
    const analyzedData = JSON.parse(responseText);

    // 4. Generate the Vector Embeddings using the new transcript
    const embeddingModel = genAI.getGenerativeModel({ model: 'gemini-embedding-001' });
    const embeddingResult = await embeddingModel.embedContent(analyzedData.transcript);
    const embedding = embeddingResult.embedding.values;

    // 5. Save to the locked Supabase table using your Service Role Key
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('entries')
      .insert({
        text_content: analyzedData.transcript,
        modality: 'audio',
        valence_score: analyzedData.valence_score,
        dominant_emotion: analyzedData.dominant_emotion,
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
    console.error('Audio Ingest Pipeline Error:', error);
    return NextResponse.json({ error: 'Failed to process audio' }, { status: 500 });
  }
}