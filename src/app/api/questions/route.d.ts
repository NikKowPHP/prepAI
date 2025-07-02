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
};

export async function GET(req: NextRequest): Promise<NextResponse>;
export async function POST(req: NextRequest): Promise<NextResponse>;
export async function PUT(req: NextRequest): Promise<NextResponse>;
export async function DELETE(req: NextRequest): Promise<NextResponse>;
export async function PATCH(req: NextRequest): Promise<NextResponse>;
