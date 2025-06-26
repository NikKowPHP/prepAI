// ROO-AUDIT-TAG: START(openai-integration)
import OpenAI from 'openai';
import { sleep } from './utils';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  organization: process.env.OPENAI_ORG_ID
});

const RATE_LIMIT_DELAY = 1000; // 1 second between requests

export async function generateAIQuestions(prompt: string, count = 5) {
  await sleep(RATE_LIMIT_DELAY);
  
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a helpful interview question generator."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1000,
      n: count
    });

    return completion.choices.map(choice => 
      choice.message.content?.trim() || ''
    ).filter(Boolean);
    
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw new Error('Failed to generate questions');
  }
}
// ROO-AUDIT-TAG: END(openai-integration)