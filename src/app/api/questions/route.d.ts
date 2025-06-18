import { NextRequest, NextResponse } from 'next/server';

export type Question = {
  id: string;
  content: string;
  category: string;
  difficulty: string;
  createdAt: Date;
  userId: string;
};

export type CreateQuestionRequest = {
  content: string;
  category: string;
  difficulty: string;
};

export type UpdateQuestionRequest = Partial<CreateQuestionRequest>;

export type DeleteQuestionResponse = {
  message: string;
};

export type GetQuestionsResponse = Question[];

export type GetQuestionResponse = Question;

export type ErrorResponse = {
  error: string;
};

export declare function GET(req: NextRequest): Promise<NextResponse<GetQuestionsResponse | GetQuestionResponse | ErrorResponse>>;
export declare function POST(req: NextRequest): Promise<NextResponse<Question | ErrorResponse>>;
export declare function PUT(req: NextRequest): Promise<NextResponse<Question | ErrorResponse>>;
export declare function DELETE(req: NextRequest): Promise<NextResponse<DeleteQuestionResponse | ErrorResponse>>;
