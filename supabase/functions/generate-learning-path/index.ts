import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface LearningPathRequest {
  userId: string;
  subjects: string[];
  targetGoal: string;
  timeframe: number; // in days
  studyHoursPerDay: number;
  difficultyLevel: 'beginner' | 'intermediate' | 'advanced';
  learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'reading';
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestData: LearningPathRequest = await req.json();
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log(`Generating learning path for user ${requestData.userId}`);

    // Get user's assessment history for personalization
    const { data: assessments } = await supabase
      .from('assessments')
      .select('*')
      .eq('user_id', requestData.userId)
      .order('completed_at', { ascending: false })
      .limit(10);

    const { data: userProfile } = await supabase
      .from('users')
      .select('*')
      .eq('id', requestData.userId)
      .single();

    // Create AI prompt for learning path generation
    const prompt = `Generate a comprehensive, personalized learning path for a student with the following profile:

Target Goal: ${requestData.targetGoal}
Subjects: ${requestData.subjects.join(', ')}
Timeframe: ${requestData.timeframe} days
Study Hours per Day: ${requestData.studyHoursPerDay}
Difficulty Level: ${requestData.difficultyLevel}
Learning Style: ${requestData.learningStyle}
Grade Level: ${userProfile?.grade_level || 'Not specified'}

Previous Assessment Performance:
${assessments?.map(a => `${a.subject}: ${Math.round(a.score/a.total_questions*100)}%`).join('\n') || 'No previous assessments'}

Please create a detailed learning path with the following JSON structure:
{
  "title": "Learning Path Title",
  "description": "Brief description of the learning path",
  "totalDuration": number (in days),
  "phases": [
    {
      "name": "Phase name",
      "duration": number (in days),
      "objectives": ["objective1", "objective2"],
      "topics": [
        {
          "name": "Topic name",
          "estimatedHours": number,
          "difficulty": "beginner|intermediate|advanced",
          "prerequisites": ["prerequisite1"],
          "resources": ["resource1", "resource2"],
          "assessmentType": "quiz|practice|project"
        }
      ]
    }
  ],
  "milestones": [
    {
      "week": number,
      "title": "Milestone title",
      "description": "What should be achieved",
      "assessmentRequired": boolean
    }
  ],
  "studySchedule": {
    "dailyStructure": "Recommended daily study structure",
    "weeklyPattern": "Weekly pattern recommendations",
    "breakRecommendations": "Break and rest recommendations"
  },
  "adaptiveElements": {
    "difficultyProgression": "How difficulty increases over time",
    "personalizedTips": ["tip1", "tip2"],
    "strengthFocus": "Areas to focus on based on strengths",
    "weaknessImprovement": "Plans for improving weak areas"
  },
  "resources": {
    "books": ["book1", "book2"],
    "onlineResources": ["url1", "url2"],
    "practiceTools": ["tool1", "tool2"],
    "videoLectures": ["lecture1", "lecture2"]
  }
}

Ensure the path is:
1. Personalized to the student's level and learning style
2. Progressive in difficulty
3. Includes regular assessment points
4. Accounts for the available time and study hours
5. Focuses on the target goal while building foundational knowledge`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: 'You are an expert educational curriculum designer. Always respond with valid, well-structured JSON for learning paths.' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 3000,
      }),
    });

    const aiResponse = await response.json();
    let learningPath;

    try {
      learningPath = JSON.parse(aiResponse.choices[0].message.content);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      // Fallback learning path structure
      learningPath = {
        title: `${requestData.targetGoal} Learning Path`,
        description: `Personalized learning path for ${requestData.targetGoal}`,
        totalDuration: requestData.timeframe,
        phases: requestData.subjects.map((subject, index) => ({
          name: `Master ${subject}`,
          duration: Math.ceil(requestData.timeframe / requestData.subjects.length),
          objectives: [`Understand core concepts in ${subject}`, `Apply knowledge practically`],
          topics: [
            {
              name: `Foundation in ${subject}`,
              estimatedHours: requestData.studyHoursPerDay * 7,
              difficulty: requestData.difficultyLevel,
              prerequisites: [],
              resources: [`${subject} textbook`, `Online ${subject} course`],
              assessmentType: 'quiz'
            }
          ]
        })),
        milestones: [
          {
            week: Math.ceil(requestData.timeframe / 7 / 2),
            title: 'Mid-term Assessment',
            description: 'Evaluate progress and adjust study plan',
            assessmentRequired: true
          }
        ],
        studySchedule: {
          dailyStructure: `${requestData.studyHoursPerDay} hours split into focused sessions`,
          weeklyPattern: '6 days study, 1 day review and rest',
          breakRecommendations: '15-minute breaks every hour'
        },
        adaptiveElements: {
          difficultyProgression: 'Gradual increase from current level',
          personalizedTips: [`Focus on ${requestData.learningStyle} learning methods`],
          strengthFocus: 'Build on existing knowledge',
          weaknessImprovement: 'Targeted practice in weak areas'
        },
        resources: {
          books: requestData.subjects.map(s => `Standard ${s} textbook`),
          onlineResources: ['Khan Academy', 'Coursera', 'edX'],
          practiceTools: ['Practice problem sets', 'Mock tests'],
          videoLectures: ['YouTube educational channels', 'MIT OpenCourseWare']
        }
      };
    }

    // Save learning path to database
    const { data: savedPath, error: saveError } = await supabase
      .from('learning_paths')
      .insert({
        user_id: requestData.userId,
        title: learningPath.title,
        description: learningPath.description,
        subjects: requestData.subjects,
        difficulty_level: requestData.difficultyLevel,
        estimated_duration: learningPath.totalDuration,
        progress: 0
      })
      .select()
      .single();

    if (saveError) {
      console.error('Error saving learning path:', saveError);
      throw new Error('Failed to save learning path');
    }

    console.log(`Learning path generated and saved for user ${requestData.userId}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: { 
          ...learningPath, 
          id: savedPath.id,
          created_at: savedPath.created_at 
        } 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in generate-learning-path function:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Internal server error' 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});