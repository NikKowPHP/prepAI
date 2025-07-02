import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { calculateReadiness } from '@/lib/readiness';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(request: Request) {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const readinessScore = await calculateReadiness(user.id);
    return NextResponse.json(readinessScore);

  } catch (error) {
    console.error('Error calculating readiness:', error);
    return NextResponse.json({ error: 'Failed to calculate readiness' }, { status: 500 });
  }
}