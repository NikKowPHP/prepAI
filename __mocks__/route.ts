import { NextRequest, NextResponse } from 'next/server';

export function POST(req: NextRequest) {
  return NextResponse.json({
    id: '1',
    createdAt: new Date(),
    content: 'Test question',
    category: 'general',
    difficulty: 'easy',
    source: null,
    userId: 'temp-user-id'
  }, { status: 200 });
}