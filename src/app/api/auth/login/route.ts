import { NextResponse } from 'next/server';
import { signIn } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    const { data, error } = await signIn(email, password);

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(data);
  } catch (error: unknown) {
    const message = error instanceof Error
      ? error.message
      : 'Internal server error';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}