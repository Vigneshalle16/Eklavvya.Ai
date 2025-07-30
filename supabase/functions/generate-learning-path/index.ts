import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { userId, assessmentResults } = await req.json()

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Generate learning path based on assessment results
    const learningPath = generatePersonalizedPath(assessmentResults)

    // Save to database
    const { data, error } = await supabase
      .from('learning_paths')
      .insert({
        user_id: userId,
        title: learningPath.title,
        description: learningPath.description,
        subjects: learningPath.subjects,
        difficulty_level: learningPath.difficultyLevel,
        estimated_duration: learningPath.estimatedDuration,
      })
      .select()
      .single()

    if (error) throw error

    return new Response(
      JSON.stringify({ success: true, learningPath: data }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})

function generatePersonalizedPath(assessmentResults: any) {
  const { subject, score, totalQuestions, difficultyLevel, learningStyle } = assessmentResults
  const scorePercentage = (score / totalQuestions) * 100

  let title = ""
  let description = ""
  let subjects = []
  let estimatedDuration = 0

  if (subject === "Mathematics") {
    if (scorePercentage < 50) {
      title = "Mathematics Foundation Builder"
      description = "Strengthen your mathematical fundamentals with step-by-step guidance"
      subjects = ["Basic Algebra", "Arithmetic", "Number Systems"]
      estimatedDuration = 40
    } else if (scorePercentage < 80) {
      title = "Intermediate Mathematics Mastery"
      description = "Build on your foundation with advanced concepts and problem-solving"
      subjects = ["Advanced Algebra", "Trigonometry", "Coordinate Geometry"]
      estimatedDuration = 60
    } else {
      title = "Advanced Mathematics Excellence"
      description = "Master complex mathematical concepts for competitive exams"
      subjects = ["Calculus", "Advanced Trigonometry", "Complex Numbers"]
      estimatedDuration = 80
    }
  } else if (subject === "Physics") {
    if (scorePercentage < 50) {
      title = "Physics Fundamentals"
      description = "Build a strong foundation in physics concepts and principles"
      subjects = ["Mechanics", "Heat and Thermodynamics", "Light"]
      estimatedDuration = 45
    } else if (scorePercentage < 80) {
      title = "Intermediate Physics Concepts"
      description = "Explore advanced physics topics with practical applications"
      subjects = ["Electricity", "Magnetism", "Modern Physics"]
      estimatedDuration = 65
    } else {
      title = "Advanced Physics Mastery"
      description = "Master complex physics for JEE and engineering preparation"
      subjects = ["Quantum Physics", "Electrodynamics", "Relativity"]
      estimatedDuration = 85
    }
  } else {
    // General or multi-subject path
    title = "Comprehensive Learning Journey"
    description = "A well-rounded approach covering multiple subjects"
    subjects = ["Mathematics", "Physics", "Chemistry"]
    estimatedDuration = 100
  }

  // Adjust based on learning style
  if (learningStyle === "quick_learner") {
    estimatedDuration = Math.floor(estimatedDuration * 0.8)
  } else if (learningStyle === "thorough") {
    estimatedDuration = Math.floor(estimatedDuration * 1.2)
  }

  return {
    title,
    description,
    subjects,
    difficultyLevel,
    estimatedDuration
  }
}