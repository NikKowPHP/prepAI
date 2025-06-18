import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { supabase } from './supabase';
import { progressService } from './progress';
import { schedulerService } from './scheduler';
import { formatDistanceToNow } from 'date-fns';

// Function to generate a PDF report for a user's progress
export async function generateUserReport(userId: string) {
  // Verify user is authenticated
  const user = supabase.auth.user();
  if (!user || user.id !== userId) {
    throw new Error('Unauthorized');
  }

  // Fetch user data and progress
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('id, email, name, created_at')
    .eq('id', userId)
    .single();

  if (userError || !userData) {
    throw new Error('User not found');
  }

  // Get progress metrics
  const progress = await progressService.getUserMetrics(userId);

  // Get all questions and their review status
  const { data: questionsData, error: questionsError } = await supabase
    .from('questions')
    .select('id, content, last_reviewed, review_interval, review_ease')
    .eq('user_id', userId);

  if (questionsError) {
    throw new Error('Error fetching questions');
  }

  // Create a new PDF document
  const doc = new jsPDF();

  // Add title
  doc.setFontSize(20);
  doc.text('Interview Prep Progress Report', 14, 22);

  // Add user information
  doc.setFontSize(14);
  doc.text(`Name: ${userData.name || 'N/A'}`, 14, 30);
  doc.text(`Email: ${userData.email}`, 14, 36);
  doc.text(`Account Created: ${formatDistanceToNow(new Date(userData.created_at), { addSuffix: true })}`, 14, 42);

  // Add progress summary
  doc.setFontSize(16);
  doc.text('Progress Summary', 14, 50);

  // Add progress data as a table
  const progressData = [
    ['Metric', 'Value'],
    ['Total Questions', progress.totalQuestions],
    ['Correct Answers', progress.correctAnswers],
    ['Incorrect Answers', progress.incorrectAnswers],
    ['Mastery Score', `${progress.masteryScore.toFixed(2)}%`],
  ];

  autoTable(doc, {
    startY: 58,
    head: [['Metric', 'Value']],
    body: progressData,
  });

  // Add detailed question performance
  doc.addPage();
  doc.setFontSize(16);
  doc.text('Question Performance', 14, 22);

  const questionData = questionsData.map(q => [
    q.content,
    q.last_reviewed ? 'Answered' : 'Pending',
    q.review_ease >= 2.5 ? '✓' : '✗',
  ]);

  autoTable(doc, {
    startY: 30,
    head: [['Question', 'Status', 'Correct']],
    body: questionData,
  });

  // Return the PDF as a buffer
  return doc.output('arraybuffer');
}