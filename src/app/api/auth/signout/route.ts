import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error('Signout error:', error);
      return NextResponse.json(
        {
          error: error.message,
          code: error.code || 'SIGNOUT_ERROR'
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true },
      { status: 200, headers: { Location: '/login' } }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    console.error('Server error during signout:', error);
    return NextResponse.json(
      {
        error: message,
        code: 'SERVER_ERROR'
      },
      { status: 500 }
    );
  }
}