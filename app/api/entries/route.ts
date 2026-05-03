import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const days = parseInt(searchParams.get('days') || '30', 10);
    const limit = parseInt(searchParams.get('limit') || '100', 10);

    const supabase = await createClient();

    // Calculate the date range
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - days);

    const { data, error } = await supabase
      .from('entries')
      .select('id, text_content, modality, valence_score, dominant_emotion, created_at')
      .gte('created_at', fromDate.toISOString())
      .order('created_at', { ascending: true })
      .limit(limit);

    if (error) {
      console.error("Supabase Error:", error);
      throw error;
    }

    // Also compute some aggregate stats
    const entries = data || [];
    const stats = {
      totalEntries: entries.length,
      averageValence: entries.length > 0 
        ? entries.reduce((sum, e) => sum + (e.valence_score || 0), 0) / entries.length 
        : 0,
      emotionCounts: entries.reduce((acc: Record<string, number>, e) => {
        const emotion = e.dominant_emotion || 'Unknown';
        acc[emotion] = (acc[emotion] || 0) + 1;
        return acc;
      }, {}),
      mostFrequentEmotion: '',
      moodTrend: 'stable' as 'improving' | 'declining' | 'stable',
    };

    // Find most frequent emotion
    if (Object.keys(stats.emotionCounts).length > 0) {
      stats.mostFrequentEmotion = Object.entries(stats.emotionCounts)
        .sort(([, a], [, b]) => b - a)[0][0];
    }

    // Calculate mood trend (compare first half to second half)
    if (entries.length >= 4) {
      const mid = Math.floor(entries.length / 2);
      const firstHalf = entries.slice(0, mid);
      const secondHalf = entries.slice(mid);
      const firstAvg = firstHalf.reduce((s, e) => s + (e.valence_score || 0), 0) / firstHalf.length;
      const secondAvg = secondHalf.reduce((s, e) => s + (e.valence_score || 0), 0) / secondHalf.length;
      const diff = secondAvg - firstAvg;
      if (diff > 0.15) stats.moodTrend = 'improving';
      else if (diff < -0.15) stats.moodTrend = 'declining';
    }

    return NextResponse.json({ entries, stats });

  } catch (error) {
    console.error('Entries API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch entries' }, { status: 500 });
  }
}
