import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { transcriptionService } from '@/lib/transcription';
import { assessmentService } from '@/lib/assessment';

export async function POST(req: NextRequest) {
  try {
    // Authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Request validation
    const body = await req.json();
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const { filePath, expectedAnswer } = body;
    if (!filePath || !expectedAnswer) {
      return NextResponse.json(
        { error: 'filePath and expectedAnswer are required' },
        { status: 400 }
      );
    }

    // Process transcription
    const transcription = await transcriptionService.processTranscription(filePath);
    
    // Assess the answer
    const score = assessmentService.validateAnswer(transcription, expectedAnswer);
    const feedback = assessmentService.generateFeedback(transcription, expectedAnswer);

    return NextResponse.json({
      transcription,
      score,
      feedback
    });

  } catch (error: unknown) {
    // Error handling
    if (error instanceof Error) {
      console.error('Voice processing error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    console.error('Unknown error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}