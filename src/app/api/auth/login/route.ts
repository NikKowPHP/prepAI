import { NextResponse } from 'next/server';
import { signIn } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    // Check if request body is valid JSON
    let body;
    try {
      body = await request.json();
    } catch (error) {
      console.error('Invalid JSON format in request body:', error);
      return NextResponse.json(
        { error: 'Invalid JSON format in request body' },
        { status: 400 }
      );
    }

    const { email, password } = body;
    
    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const { data, error } = await signIn(email, password);

    if (error) {
      console.error('Login error:', error);
      return NextResponse.json(
        {
          error: error.message,
          code: error.code || 'AUTH_ERROR'
        },
        { status: 400 }
      );
    }

    return NextResponse.json(data);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    console.error('Server error during login:', error);
    return NextResponse.json(
      {
        error: message,
        code: 'SERVER_ERROR'
      },
      { status: 500 }
    );
  }
}