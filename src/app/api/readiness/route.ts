import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';
import { calculateReadiness } from '../../../lib/readiness';

export async function GET(request: Request) {
  const user = await supabase.auth.getUser();

  if (!user || !user.data.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const readinessScore = await calculateReadiness(user.data.user.id);

  return NextResponse.json({ score: readinessScore });
}