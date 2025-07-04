import React, { useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import type { Question } from '@prisma/client';
import { useAuth } from '@/lib/auth-context';
import { KnowledgeGap } from '@/lib/assessment';

const DiscoverMode: React.FC = () => {
  const { user } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState('');
  const [filters, setFilters] = useState({
    topic: '',
    minSeverity: 0.5,
    showGapsOnly: false
  });
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);
  const [isFiltering, setIsFiltering] = useState(false);


  const handleAnalyze = async () => {
    if (!user) return;
    
    setIsAnalyzing(true);
    setAnalysisError('');
    
    try {
      // Get complete knowledge gap analysis from assessment service
      const assessmentResponse = await fetch('/api/analyze-knowledge-gaps', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user.id }),
      });

      if (!assessmentResponse.ok) {
        throw new Error('Failed to analyze knowledge gaps');
      }

      const { gaps } = (await assessmentResponse.json()) as { gaps: KnowledgeGap[] };

      // Generate new questions for each gap and related topics
      const generationPromises = gaps.flatMap(gap => {
        const topics = [gap.topic, ...(gap.relatedTopics || [])];
        return fetch('/api/generate-question', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            prompt: `Generate interview questions about ${gap.topic}`,
            questionType: 'multiple_choice',
            topics,
            knowledgeGap: gap
          }),
        });
      });

      const generationResponses = await Promise.all(generationPromises);
      const newQuestions = await Promise.all(
        generationResponses.map(res => res.json())
      );

      // Save generated questions to database
      const { error } = await supabase
        .from('questions')
        .insert(newQuestions.map(q => ({
          ...q,
          user_id: user.id,
          isAIGenerated: true,
          topics: q.topics || []
        })));

      if (error) throw error;

      // Refresh questions list
      const { data } = await supabase
        .from('questions')
        .select('*')
        .eq('user_id', user.id);

      if (data) setQuestions(data);
    } catch (error) {
      console.error('Error analyzing knowledge gaps:', error);
      setAnalysisError('Failed to analyze knowledge gaps. Please try again.');
      // Reset state on error
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Apply filters whenever they change
  React.useEffect(() => {
    const applyFilters = async () => {
      if (questions.length === 0) return;
      
      setIsFiltering(true);
      try {
        // Get current knowledge gaps
        const response = await fetch('/api/analyze-knowledge-gaps', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId: user?.id }),
        });
        
        if (!response.ok) throw new Error('Failed to get knowledge gaps');
        const { gaps } = await response.json() as { gaps: KnowledgeGap[] };

        const filtered = questions.filter(question => {
          // Topic filter
          if (filters.topic && !(question.topics || []).includes(filters.topic)) {
            return false;
          }
          
          // Gap severity filter
          if (filters.showGapsOnly) {
            const questionGaps = gaps.filter(gap =>
              gap.relatedQuestions.includes(question.id) ||
              (question.topics || []).includes(gap.topic)
            );
            
            if (questionGaps.length === 0) return false;
            if (!questionGaps.some(gap => gap.severity >= filters.minSeverity)) {
              return false;
            }
          }
          
          return true;
        });

        setFilteredQuestions(filtered);
      } catch (error) {
        console.error('Error applying filters:', error);
        setAnalysisError('Failed to apply filters');
      } finally {
        setIsFiltering(false);
      }
    };

    applyFilters();
  }, [filters, questions, user?.id]);

  return (
    <div className="p-4">
      <button 
        onClick={handleAnalyze}
        disabled={isAnalyzing}
        className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-400"
      >
        {isAnalyzing ? 'Analyzing...' : 'Analyze Knowledge Gaps'}
      </button>
      
      {analysisError && (
        <div className="text-red-500 mt-2">{analysisError}</div>
      )}

      <div className="mt-4 space-y-4">
        <div className="flex gap-4 items-center">
          <select
            value={filters.topic}
            onChange={(e) => setFilters({...filters, topic: e.target.value})}
            className="p-2 border rounded"
          >
            <option value="">All Topics</option>
            {Array.from(new Set(questions.flatMap(q => q.topics || []))).map(topic => (
              <option key={topic} value={topic}>{topic}</option>
            ))}
          </select>

          <label className="flex items-center gap-2">
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={filters.minSeverity}
              onChange={(e) => setFilters({...filters, minSeverity: parseFloat(e.target.value)})}
              className="w-32"
            />
            <span>Min Severity: {filters.minSeverity.toFixed(1)}</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={filters.showGapsOnly}
              onChange={(e) => setFilters({...filters, showGapsOnly: e.target.checked})}
            />
            Show gap questions only
          </label>
        </div>

        <h2 className="text-xl font-semibold mb-2">Generated Questions</h2>
        {isFiltering ? (
          <p>Applying filters...</p>
        ) : filteredQuestions.length > 0 ? (
          <ul className="space-y-2">
            {filteredQuestions.map((question) => (
              <li
                key={question.id}
                className="p-2 bg-gray-50 rounded border border-gray-200"
              >
                <h3 className="font-medium">{question.question}</h3>
                {(question.topics || []).length > 0 && (
                  <div className="mt-1 text-sm text-gray-600">
                    Topics: {(question.topics || []).join(', ')}
                  </div>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">
            {questions.length === 0
              ? "No questions generated yet"
              : "No questions match the current filters"}
          </p>
        )}
      </div>
    </div>
  );
};

export default DiscoverMode;