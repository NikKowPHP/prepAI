// ROO-AUDIT-TAG :: plan-002-topic-selection.md :: Implement objective creation with question generation trigger
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const { name, description, topics = [] } = body;
    if (!name || typeof name !== 'string') {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    // Create the objective
    const objective = await prisma.objective.create({
      data: {
        name: name.trim(),
        description: description?.trim(),
        userId: user.id
      }
    });

    // Trigger question generation if topics are provided
    if (topics.length > 0) {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/generate-question`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${req.headers.get('Authorization')}`
          },
          body: JSON.stringify({
            prompt: `Generate questions about ${name}`,
            topics,
            questionType: 'multiple_choice'
          })
        });

        if (!response.ok) {
          console.error('Question generation failed:', await response.text());
        } else {
          const { question, relatedQuestions } = await response.json();
          
          // Store generated questions
          const createdQuestion = await prisma.question.create({
            data: {
              content: question,
              category: 'generated',
              difficulty: 'medium',
              userId: user.id,
              topics
            }
          });

          // Create the relationship
          await prisma.objectiveQuestion.create({
            data: {
              objectiveId: objective.id,
              questionId: createdQuestion.id
            }
          });

          // Store related questions if any
          if (relatedQuestions && relatedQuestions.length > 0) {
            await Promise.all(relatedQuestions.map(async (q: string) => {
              const relatedQuestion = await prisma.question.create({
                data: {
                  content: q,
                  category: 'generated',
                  difficulty: 'medium',
                  userId: user.id,
                  topics
                }
              });
              
              await prisma.objectiveQuestion.create({
                data: {
                  objectiveId: objective.id,
                  questionId: relatedQuestion.id
                }
              });
            }));
          }
        }
      } catch (error) {
        console.error('Error triggering question generation:', error);
      }
    }

    return NextResponse.json(objective, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }
    if (error instanceof Error) {
      console.error('Database Error:', error.message);
    } else {
      console.error('Unknown Error:', error);
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
// ROO-AUDIT-TAG :: plan-002-topic-selection.md :: END