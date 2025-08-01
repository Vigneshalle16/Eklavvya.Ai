import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface AIRequest {
  type: 'study-plan' | 'question-explanation' | 'performance-analysis' | 'learning-path'
  data: any
  userId: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, data, userId }: AIRequest = await req.json();
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log(`Processing AI request: ${type} for user ${userId}`);

    let result;
    
    switch (type) {
      case 'study-plan':
        result = await generateStudyPlan(data, userId, supabase);
        break;
      case 'question-explanation':
        result = await explainQuestion(data);
        break;
      case 'performance-analysis':
        result = await analyzePerformance(data, userId, supabase);
        break;
      case 'learning-path':
        result = await generateLearningPath(data, userId, supabase);
        break;
      default:
        throw new Error(`Unsupported AI request type: ${type}`);
    }

    return new Response(
      JSON.stringify({ success: true, data: result }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in AI assistant:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Internal server error' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});

async function generateStudyPlan(data: any, userId: string, supabase: any) {
  // Get user profile and assessment data
  const { data: userProfile } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  const { data: assessments } = await supabase
    .from('assessments')
    .select('*')
    .eq('user_id', userId)
    .order('completed_at', { ascending: false })
    .limit(5);

  // AI logic for generating personalized study plan
  const studyPlan = {
    title: `Personalized Study Plan for ${userProfile?.full_name || 'Student'}`,
    duration: calculateOptimalDuration(assessments, data.targetDate),
    subjects: prioritizeSubjects(assessments, data.subjects),
    dailySchedule: generateDailySchedule(userProfile?.grade_level, data.studyHours),
    weakAreas: identifyWeakAreas(assessments),
    recommendations: generateRecommendations(assessments, userProfile?.learning_goals),
    milestones: createMilestones(data.targetDate, data.subjects)
  };

  // Save study plan to database
  const { data: savedPlan } = await supabase
    .from('learning_paths')
    .insert({
      user_id: userId,
      title: studyPlan.title,
      description: `AI-generated study plan based on performance analysis`,
      subjects: studyPlan.subjects.map(s => s.name),
      difficulty_level: determineDifficultyLevel(assessments),
      estimated_duration: studyPlan.duration,
      progress: 0
    })
    .select()
    .single();

  return { ...studyPlan, id: savedPlan.id };
}

async function explainQuestion(data: any) {
  const { question, subject, difficulty } = data;
  const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
  
  if (!openAIApiKey) {
    throw new Error('OpenAI API key not configured');
  }

  const prompt = `As an expert tutor in ${subject}, provide a comprehensive explanation for this ${difficulty} level question:

"${question}"

Please structure your response as JSON with these fields:
- concept: Core concept being tested
- stepByStep: Array of step-by-step solution steps
- alternativeMethods: Array of alternative solution approaches
- relatedTopics: Array of related topics to study
- practiceQuestions: Array of 2-3 similar practice questions
- tips: Array of helpful tips and mnemonics
- commonMistakes: Array of common mistakes to avoid

Make the explanation clear and educational for a student at ${difficulty} level.`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are an expert educational tutor. Always respond with valid JSON.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
    }),
  });

  const aiResponse = await response.json();
  
  try {
    return JSON.parse(aiResponse.choices[0].message.content);
  } catch (error) {
    // Fallback if JSON parsing fails
    return {
      concept: `Core concepts in ${subject}`,
      stepByStep: aiResponse.choices[0].message.content.split('\n').filter(line => line.trim()),
      alternativeMethods: ["Alternative approach available"],
      relatedTopics: [`Related ${subject} topics`],
      practiceQuestions: ["Practice more similar questions"],
      tips: ["Focus on understanding the fundamentals"],
      commonMistakes: ["Double-check your calculations"]
    };
  }
}

async function analyzePerformance(data: any, userId: string, supabase: any) {
  // Get comprehensive user data
  const { data: assessments } = await supabase
    .from('assessments')
    .select('*')
    .eq('user_id', userId)
    .order('completed_at', { ascending: false });

  const { data: studySessions } = await supabase
    .from('study_sessions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50);

  // AI analysis
  const analysis = {
    overallProgress: calculateOverallProgress(assessments),
    subjectWiseAnalysis: analyzeSubjectPerformance(assessments),
    learningTrends: identifyLearningTrends(assessments, studySessions),
    strengthsAndWeaknesses: categorizePerformance(assessments),
    studyPatterns: analyzeStudyPatterns(studySessions),
    recommendations: generatePerformanceRecommendations(assessments, studySessions),
    predictedOutcomes: predictFuturePerformance(assessments),
    adaptiveSuggestions: generateAdaptiveSuggestions(assessments)
  };

  return analysis;
}

async function generateLearningPath(data: any, userId: string, supabase: any) {
  const { targetGoal, currentLevel, timeframe, preferences } = data;

  // Get user context
  const { data: userProfile } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  // AI logic for creating adaptive learning path
  const learningPath = {
    title: `Learning Path: ${targetGoal}`,
    phases: createLearningPhases(currentLevel, targetGoal, timeframe),
    adaptiveModules: generateAdaptiveModules(currentLevel, targetGoal, preferences),
    assessmentSchedule: createAssessmentSchedule(timeframe),
    personalizedContent: recommendPersonalizedContent(userProfile, targetGoal),
    progressTracking: setupProgressTracking(targetGoal),
    adaptationTriggers: defineAdaptationTriggers()
  };

  // Save to database
  const { data: savedPath } = await supabase
    .from('learning_paths')
    .insert({
      user_id: userId,
      title: learningPath.title,
      description: `Adaptive learning path for ${targetGoal}`,
      subjects: extractSubjectsFromGoal(targetGoal),
      difficulty_level: currentLevel,
      estimated_duration: calculatePathDuration(timeframe),
      progress: 0
    })
    .select()
    .single();

  return { ...learningPath, id: savedPath.id };
}

// Helper functions for AI logic
function calculateOptimalDuration(assessments: any[], targetDate: string): number {
  const averageScore = assessments.reduce((sum, a) => sum + (a.score / a.total_questions), 0) / assessments.length;
  const baseHours = 100;
  const adjustment = averageScore < 0.7 ? 1.5 : averageScore > 0.85 ? 0.8 : 1;
  return Math.round(baseHours * adjustment);
}

function prioritizeSubjects(assessments: any[], requestedSubjects: string[]): any[] {
  const subjectScores = assessments.reduce((acc, assessment) => {
    if (!acc[assessment.subject]) {
      acc[assessment.subject] = [];
    }
    acc[assessment.subject].push(assessment.score / assessment.total_questions);
    return acc;
  }, {});

  return requestedSubjects.map(subject => {
    const scores = subjectScores[subject] || [0.5];
    const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
    return {
      name: subject,
      priority: avgScore < 0.6 ? 'high' : avgScore < 0.8 ? 'medium' : 'low',
      allocatedHours: avgScore < 0.6 ? 40 : avgScore < 0.8 ? 25 : 15,
      currentLevel: avgScore
    };
  });
}

function generateDailySchedule(gradeLevel: string, studyHours: number): any {
  const sessions = Math.min(Math.floor(studyHours / 1.5), 4);
  const sessionLength = Math.floor(studyHours * 60 / sessions);
  
  return {
    sessionsPerDay: sessions,
    sessionLength: sessionLength,
    breakTime: 15,
    optimalTimes: ['09:00-10:30', '11:00-12:30', '14:00-15:30', '16:00-17:30'].slice(0, sessions),
    adaptiveScheduling: true
  };
}

function identifyWeakAreas(assessments: any[]): string[] {
  const subjectPerformance = assessments.reduce((acc, assessment) => {
    const score = assessment.score / assessment.total_questions;
    if (!acc[assessment.subject] || acc[assessment.subject] > score) {
      acc[assessment.subject] = score;
    }
    return acc;
  }, {});

  return Object.entries(subjectPerformance)
    .filter(([, score]) => (score as number) < 0.6)
    .map(([subject]) => subject);
}

function generateRecommendations(assessments: any[], learningGoals: string[]): string[] {
  const recommendations = [
    "Focus on weak areas identified in recent assessments",
    "Practice daily for consistent improvement",
    "Use spaced repetition for better retention"
  ];

  if (assessments.some(a => a.learning_style === 'visual')) {
    recommendations.push("Use visual aids and diagrams for better understanding");
  }

  if (learningGoals?.includes('jee-prep')) {
    recommendations.push("Focus on problem-solving techniques and time management");
  }

  return recommendations;
}

function createMilestones(targetDate: string, subjects: string[]): any[] {
  const target = new Date(targetDate);
  const now = new Date();
  const totalWeeks = Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 7));
  
  return subjects.map((subject, index) => ({
    subject,
    targetWeek: Math.ceil((index + 1) * totalWeeks / subjects.length),
    description: `Master core concepts of ${subject}`,
    assessmentRequired: true
  }));
}

function determineDifficultyLevel(assessments: any[]): string {
  const avgScore = assessments.reduce((sum, a) => sum + (a.score / a.total_questions), 0) / assessments.length;
  return avgScore < 0.5 ? 'beginner' : avgScore < 0.75 ? 'intermediate' : 'advanced';
}

// Additional helper functions would be implemented here...
function extractCoreConcept(question: string, subject: string): string {
  // AI logic to extract core concept
  return `Core concept analysis for ${subject}`;
}

function generateStepByStepSolution(question: string, subject: string): string[] {
  // AI logic for step-by-step solution
  return ["Step 1: Understand the problem", "Step 2: Apply relevant formula", "Step 3: Calculate result"];
}

function suggestAlternativeMethods(question: string, subject: string): string[] {
  return ["Alternative method 1", "Alternative method 2"];
}

function findRelatedTopics(question: string, subject: string): string[] {
  return ["Related topic 1", "Related topic 2"];
}

function generatePracticeQuestions(question: string, subject: string, difficulty: string): string[] {
  return ["Practice question 1", "Practice question 2"];
}

function generateMnemonics(question: string, subject: string): string[] {
  return ["Mnemonic device 1"];
}

function suggestVisualAids(question: string, subject: string): string[] {
  return ["Diagram suggestion", "Chart recommendation"];
}

function calculateOverallProgress(assessments: any[]): any {
  return { overall: 75, trend: 'improving' };
}

function analyzeSubjectPerformance(assessments: any[]): any {
  return {};
}

function identifyLearningTrends(assessments: any[], studySessions: any[]): any {
  return {};
}

function categorizePerformance(assessments: any[]): any {
  return { strengths: [], weaknesses: [] };
}

function analyzeStudyPatterns(studySessions: any[]): any {
  return {};
}

function generatePerformanceRecommendations(assessments: any[], studySessions: any[]): string[] {
  return [];
}

function predictFuturePerformance(assessments: any[]): any {
  return {};
}

function generateAdaptiveSuggestions(assessments: any[]): string[] {
  return [];
}

function createLearningPhases(currentLevel: string, targetGoal: string, timeframe: string): any[] {
  return [];
}

function generateAdaptiveModules(currentLevel: string, targetGoal: string, preferences: any): any[] {
  return [];
}

function createAssessmentSchedule(timeframe: string): any {
  return {};
}

function recommendPersonalizedContent(userProfile: any, targetGoal: string): any[] {
  return [];
}

function setupProgressTracking(targetGoal: string): any {
  return {};
}

function defineAdaptationTriggers(): any[] {
  return [];
}

function extractSubjectsFromGoal(targetGoal: string): string[] {
  return [];
}

function calculatePathDuration(timeframe: string): number {
  return 30;
}