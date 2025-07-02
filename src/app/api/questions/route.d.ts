import { NextRequest, NextResponse } from 'next/server';

export type Question = {
  id: string;
  content: string;
  category: string;
  difficulty: string;
  userId: string;
  createdAt: Date;
};

export type UpdateQuestionData = {
  content?: string;
  category?: string;
  difficulty?: string;
  lastReviewed?: Date;
  reviewInterval?: number;
  reviewEase?: number;
  struggleCount?: number;
  topics?: string[];
};

export function GET(req: NextRequest): Promise<NextResponse>;
export function POST(req: NextRequest): Promise<NextResponse>;
export function PUT(req: NextRequest): Promise<NextResponse>;
export function DELETE(req: NextRequest): Promise<NextResponse>;
export function PATCH(req: NextRequest): Promise<NextResponse>;
