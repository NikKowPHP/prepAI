// ROO-AUDIT-TAG: START(question-generator-module)
export async function generateQuestions(topics: string[]) {
  return topics.map(topic => ({
    content: `Generated question about ${topic}`,
    category: 'technical',
    difficulty: 'medium'
  }));
}
// ROO-AUDIT-TAG: END(question-generator-module)