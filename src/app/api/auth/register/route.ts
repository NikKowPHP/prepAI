import { NextResponse } from 'next/server';
import { signUp } from '../../../../lib/auth';
import { validatePassword } from '../../../../lib/validation';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    
    const validation = validatePassword(password);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.message },
        { status: 400 }
      );
    }

    const { data, error } = await signUp(email, password);

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