import React, { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { assessmentService } from '@/lib/assessment';
import VoiceRecorder from '@/components/VoiceRecorder';

interface QuestionData {
  id: string;
  question: string;
  expectedAnswer: string;
}

interface RecordingResult {
  transcription: string;
  score: number;
  feedback: string[];
}

const AssessmentInterface: React.FC = () => {
  const { user } = useAuth();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [currentQuestion, setCurrentQuestion] = useState<QuestionData | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [score, setScore] = useState<number | null>(null);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [actionPlan, setActionPlan] = useState<string[]>([]);
  const [voiceResults, setVoiceResults] = useState<{
    transcription: string;
    score: number;
    feedback: string[];
  } | null>(null);

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const calculateScore = () => {
    if (Object.keys(answers).length === 0) return;

    const score = assessmentService.calculateScore(answers);
    setScore(score);

    // Get recommendations and action plan
    const recs = assessmentService.getRecommendations(score);
    const actions = assessmentService.generateRecommendationEngine(score);

    setRecommendations(recs);
    setActionPlan(actions);
  };

  return (
    <div className="p-4 border rounded shadow">
      <h2 className="text-xl font-bold mb-4">Readiness Assessment</h2>
      <p className="mb-4">Answer the following questions to assess your readiness:</p>

      {user && currentQuestion && (
        <>
          <div className="mt-6">
            <h3 className="font-bold mb-2">Current Question:</h3>
            <p className="mb-4">{currentQuestion.question}</p>
            <h3 className="font-bold mb-2">Answer by voice:</h3>
            <VoiceRecorder
              expectedAnswer={currentQuestion.expectedAnswer}
              onRecordingComplete={(result: RecordingResult) => {
                setVoiceResults({
                  transcription: result.transcription,
                  score: result.score,
                  feedback: result.feedback
                });
                setScore(result.score);
              }}
            />
            
            {voiceResults && (
              <div className="mt-4 p-4 bg-gray-50 rounded">
                <h4 className="font-bold mb-2">Voice Answer Results:</h4>
                <p>Transcription: {voiceResults.transcription}</p>
                <p>Score: {voiceResults.score.toFixed(2)}%</p>
                <ul className="list-disc list-inside">
                  {voiceResults.feedback.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </>
      )}

      {user && (
        <>
          <div className="mb-4">
            <label className="block font-bold mb-2">Question 1:</label>
            <select
              value={answers['q1'] || ''}
              onChange={(e) => handleAnswerChange('q1', e.target.value)}
              className="border rounded px-2 py-1 w-full"
            >
              <option value="">Select answer</option>
              <option value="correct">Correct</option>
              <option value="incorrect">Incorrect</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block font-bold mb-2">Question 2:</label>
            <select
              value={answers['q2'] || ''}
              onChange={(e) => handleAnswerChange('q2', e.target.value)}
              className="border rounded px-2 py-1 w-full"
            >
              <option value="">Select answer</option>
              <option value="correct">Correct</option>
              <option value="incorrect">Incorrect</option>
            </select>
          </div>

          <button
            onClick={calculateScore}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Calculate Score
          </button>

          {score !== null && (
            <div className="mt-4">
              <h3 className="font-bold mb-2">Your Score: {score.toFixed(2)}%</h3>
              <h4 className="font-bold mb-2">Recommendations:</h4>
              <ul className="list-disc list-inside">
                {recommendations.map((rec, index) => (
                  <li key={index}>{rec}</li>
                ))}
              </ul>

              <h4 className="font-bold mb-2 mt-4">Action Plan:</h4>
              <ul className="list-disc list-inside">
                {actionPlan.map((action, index) => (
                  <li key={index}>{action}</li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AssessmentInterface;