import React, { useState, useEffect } from 'react';
import { assessmentService } from '@/lib/assessment';
import { supabase } from '@/lib/supabase';
import { Question } from '@/lib/srs';

interface DiscoverModeProps {
  userId: string;
}

const DiscoverMode: React.FC<DiscoverModeProps> = ({ userId }) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);
  const [knowledgeGaps, setKnowledgeGaps] = useState<string[]>([]);
  const [filters, setFilters] = useState({
    showGaps: false,
    topics: '',
  });

  useEffect(() => {
    // Fetch questions for the user
    const fetchQuestions = async () => {
      const { data } = await supabase
        .from('questions')
        .select('*')
        .eq('user_id', userId);

      if (data) {
        setQuestions(data);
        setFilteredQuestions(data);
      }
    };

    fetchQuestions();
  }, [userId]);

  useEffect(() => {
    // Analyze knowledge gaps when questions are loaded
    if (questions.length > 0) {
      const questionPerformance = questions.reduce((acc, question) => {
        acc[question.id] = {
          correct: question.reviewCount > 0, // Simple heuristic: reviewed questions are considered correct
          topics: question.topics || [],
        };
        return acc;
      }, {} as Record<string, { correct: boolean, topics: string[] }>);

      const { gaps } = assessmentService.analyzeKnowledgeGaps(questionPerformance);
      setKnowledgeGaps(gaps);
    }
  }, [questions]);

  useEffect(() => {
    // Filter questions based on current filters
    let updatedQuestions = [...questions];

    if (filters.showGaps && knowledgeGaps.length > 0) {
      updatedQuestions = updatedQuestions.filter(question =>
        question.topics?.some(topic => knowledgeGaps.includes(topic)) ?? false
      );
    }

    if (filters.topics) {
      const topicFilters = filters.topics.split(',').map(t => t.trim());
      updatedQuestions = updatedQuestions.filter(question =>
        question.topics?.some(topic => topicFilters.includes(topic)) ?? false
      );
    }

    setFilteredQuestions(updatedQuestions);
  }, [filters, knowledgeGaps, questions]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="discover-mode">
      <h2>Discover Mode</h2>

      <div className="filter-panel">
        <label>
          Show knowledge gaps:
          <input
            type="checkbox"
            name="showGaps"
            checked={filters.showGaps}
            onChange={handleFilterChange}
          />
        </label>

        <label>
          Filter by topics (comma-separated):
          <input
            type="text"
            name="topics"
            value={filters.topics}
            onChange={handleFilterChange}
          />
        </label>
      </div>

      {knowledgeGaps.length > 0 && (
        <div className="knowledge-gaps">
          <h3>Identified Knowledge Gaps:</h3>
          <ul>
            {knowledgeGaps.map((gap, index) => (
              <li key={index}>{gap}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="question-list">
        {filteredQuestions.map(question => (
          <div key={question.id} className="question-card">
            <h4>{question.question}</h4>
            <p><strong>Topics:</strong> {question.topics?.join(', ') || 'None'}</p>
            <p><strong>Review Count:</strong> {question.reviewCount}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DiscoverMode;