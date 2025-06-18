import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth-context';

interface Flashcard {
  id: string;
  question: string;
  answer: string;
  deckId: string;
}

interface Deck {
  id: string;
  name: string;
  description: string;
  userId: string;
}

const DeckManagement: React.FC = () => {
  const { user } = useAuth();
  const [decks, setDecks] = useState<Deck[]>([]);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [selectedDeck, setSelectedDeck] = useState<string | null>(null);
  const [newDeckName, setNewDeckName] = useState('');
  const [newDeckDescription, setNewDeckDescription] = useState('');
  const [newQuestion, setNewQuestion] = useState('');
  const [newAnswer, setNewAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDecks(user.id);
    }
  }, [user]);

  const fetchDecks = async (userId: string) => {
    setIsLoading(true);
    try {
      const { data: decksData, error: decksError } = await supabase
        .from('decks')
        .select('*')
        .eq('userId', userId);

      if (decksError) {
        console.error('Error fetching decks:', decksError);
        return;
      }

      setDecks(decksData || []);

      if (decksData && decksData.length > 0) {
        setSelectedDeck(decksData[0].id);
        fetchFlashcards(decksData[0].id);
      }
    } catch (err) {
      console.error('Error fetching decks:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFlashcards = async (deckId: string) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('flashcards')
        .select('*')
        .eq('deckId', deckId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching flashcards:', error);
        return;
      }

      setFlashcards(data || []);
    } catch (err) {
      console.error('Error fetching flashcards:', err);
    }
  };

  const createDeck = async () => {
    if (!user || !newDeckName) return;

    try {
      const { data, error } = await supabase
        .from('decks')
        .insert([{ name: newDeckName, description: newDeckDescription, userId: user.id }])
        .select();

      if (error) {
        console.error('Error creating deck:', error);
        return;
      }

      setDecks([...decks, data[0]]);
      setSelectedDeck(data[0].id);
      setNewDeckName('');
      setNewDeckDescription('');
    } catch (err) {
      console.error('Error creating deck:', err);
    }
  };

  const addFlashcard = async () => {
    if (!user || !selectedDeck || !newQuestion || !newAnswer) return;

    try {
      const { data, error } = await supabase
        .from('flashcards')
        .insert([{ question: newQuestion, answer: newAnswer, deckId: selectedDeck, user_id: user.id }])
        .select();

      if (error) {
        console.error('Error adding flashcard:', error);
        return;
      }

      setFlashcards([...flashcards, data[0]]);
      setNewQuestion('');
      setNewAnswer('');
    } catch (err) {
      console.error('Error adding flashcard:', err);
    }
  };

  const handleDeckChange = (deckId: string) => {
    setSelectedDeck(deckId);
    fetchFlashcards(deckId);
  };

  if (isLoading) {
    return <div>Loading decks...</div>;
  }

  return (
    <div className="p-4 border rounded shadow">
      <h2 className="text-xl font-bold mb-4">Deck Management</h2>

      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Create New Deck</h3>
        <input
          type="text"
          placeholder="Deck Name"
          value={newDeckName}
          onChange={(e) => setNewDeckName(e.target.value)}
          className="border rounded px-2 py-1 mb-2 w-full"
        />
        <input
          type="text"
          placeholder="Deck Description"
          value={newDeckDescription}
          onChange={(e) => setNewDeckDescription(e.target.value)}
          className="border rounded px-2 py-1 mb-2 w-full"
        />
        <button
          onClick={createDeck}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Create Deck
        </button>
      </div>

      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Select Deck</h3>
        <select
          value={selectedDeck || ''}
          onChange={(e) => handleDeckChange(e.target.value)}
          className="border rounded px-2 py-1 w-full"
        >
          {decks.map((deck) => (
            <option key={deck.id} value={deck.id}>
              {deck.name}
            </option>
          ))}
        </select>
      </div>

      {selectedDeck && (
        <div>
          <h3 className="text-lg font-semibold mb-2">Add Flashcard</h3>
          <input
            type="text"
            placeholder="Question"
            value={newQuestion}
            onChange={(e) => setNewQuestion(e.target.value)}
            className="border rounded px-2 py-1 mb-2 w-full"
          />
          <input
            type="text"
            placeholder="Answer"
            value={newAnswer}
            onChange={(e) => setNewAnswer(e.target.value)}
            className="border rounded px-2 py-1 mb-2 w-full"
          />
          <button
            onClick={addFlashcard}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Add Flashcard
          </button>

          <div className="mt-4">
            <h3 className="text-lg font-semibold mb-2">Flashcards</h3>
            {flashcards.length === 0 ? (
              <p>No flashcards in this deck.</p>
            ) : (
              <ul>
                {flashcards.map((flashcard) => (
                  <li key={flashcard.id} className="mb-2 p-2 border rounded">
                    <strong>Q:</strong> {flashcard.question} <br />
                    <strong>A:</strong> {flashcard.answer}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DeckManagement;