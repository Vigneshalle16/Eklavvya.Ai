import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, Clock, Brain } from 'lucide-react';

interface Question {
  id: string;
  question: string;
  options: string[];
  correct_answer: number;
  subject: string;
  difficulty: string;
  topic: string;
}

interface AssessmentQuizProps {
  subject: string;
  onComplete: (results: AssessmentResults) => void;
}

interface AssessmentResults {
  subject: string;
  score: number;
  totalQuestions: number;
  difficultyLevel: string;
  learningStyle: string;
  recommendations: string[];
}

// Sample questions for the MVP
const sampleQuestions: Question[] = [
  {
    id: '1',
    question: 'What is the derivative of x²?',
    options: ['2x', 'x', '2', 'x²'],
    correct_answer: 0,
    subject: 'Mathematics',
    difficulty: 'beginner',
    topic: 'Calculus'
  },
  {
    id: '2',
    question: 'Which of the following is NOT a fundamental force in physics?',
    options: ['Gravitational', 'Electromagnetic', 'Nuclear', 'Centrifugal'],
    correct_answer: 3,
    subject: 'Physics',
    difficulty: 'intermediate',
    topic: 'Forces'
  },
  {
    id: '3',
    question: 'What is the chemical formula for water?',
    options: ['H2O', 'CO2', 'NaCl', 'CH4'],
    correct_answer: 0,
    subject: 'Chemistry',
    difficulty: 'beginner',
    topic: 'Basic Chemistry'
  },
  {
    id: '4',
    question: 'If f(x) = 2x + 3, what is f(5)?',
    options: ['10', '13', '8', '15'],
    correct_answer: 1,
    subject: 'Mathematics',
    difficulty: 'beginner',
    topic: 'Functions'
  },
  {
    id: '5',
    question: 'What is the SI unit of electric current?',
    options: ['Volt', 'Ampere', 'Ohm', 'Watt'],
    correct_answer: 1,
    subject: 'Physics',
    difficulty: 'beginner',
    topic: 'Electricity'
  }
];

const AssessmentQuiz = ({ subject, onComplete }: AssessmentQuizProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [startTime, setStartTime] = useState<Date>(new Date());
  const [timeElapsed, setTimeElapsed] = useState(0);

  useEffect(() => {
    loadQuestions();
    const timer = setInterval(() => {
      setTimeElapsed(Math.floor((new Date().getTime() - startTime.getTime()) / 1000));
    }, 1000);

    return () => clearInterval(timer);
  }, [startTime]);

  const loadQuestions = () => {
    // Filter questions by subject or use all for general assessment
    const filteredQuestions = subject === 'General' 
      ? sampleQuestions 
      : sampleQuestions.filter(q => q.subject === subject);
    
    setQuestions(filteredQuestions.slice(0, 5)); // Limit to 5 questions for MVP
  };

  const handleNext = () => {
    if (selectedAnswer === '') {
      toast({
        title: "Please select an answer",
        description: "You must select an answer before proceeding.",
        variant: "destructive",
      });
      return;
    }

    const newAnswers = [...answers, parseInt(selectedAnswer)];
    setAnswers(newAnswers);
    setSelectedAnswer('');

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      completeAssessment(newAnswers);
    }
  };

  const completeAssessment = async (finalAnswers: number[]) => {
    if (!user) return;

    // Calculate score
    let correctAnswers = 0;
    questions.forEach((question, index) => {
      if (finalAnswers[index] === question.correct_answer) {
        correctAnswers++;
      }
    });

    const scorePercentage = (correctAnswers / questions.length) * 100;
    
    // Determine difficulty level based on performance
    let difficultyLevel = 'beginner';
    if (scorePercentage >= 80) difficultyLevel = 'advanced';
    else if (scorePercentage >= 60) difficultyLevel = 'intermediate';

    // Determine learning style based on time taken and accuracy
    const avgTimePerQuestion = timeElapsed / questions.length;
    let learningStyle = 'balanced';
    if (avgTimePerQuestion < 30 && scorePercentage > 70) learningStyle = 'quick_learner';
    else if (avgTimePerQuestion > 60) learningStyle = 'thorough';

    // Generate recommendations
    const recommendations = generateRecommendations(scorePercentage, difficultyLevel, subject);

    const results: AssessmentResults = {
      subject,
      score: correctAnswers,
      totalQuestions: questions.length,
      difficultyLevel,
      learningStyle,
      recommendations
    };

    try {
      // Save assessment to database
      const { error } = await supabase.from('assessments').insert({
        user_id: user.id,
        subject,
        score: correctAnswers,
        total_questions: questions.length,
        difficulty_level: difficultyLevel,
        learning_style: learningStyle,
      });

      if (error) throw error;

      onComplete(results);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to save assessment results",
        variant: "destructive",
      });
    }
  };

  const generateRecommendations = (score: number, difficulty: string, subject: string): string[] => {
    const recommendations = [];
    
    if (score < 50) {
      recommendations.push(`Focus on ${subject} fundamentals`);
      recommendations.push('Practice basic concepts daily');
      recommendations.push('Consider additional study resources');
    } else if (score < 80) {
      recommendations.push(`Build on your ${subject} foundation`);
      recommendations.push('Practice intermediate level problems');
      recommendations.push('Review concepts you found challenging');
    } else {
      recommendations.push(`Excellent work in ${subject}!`);
      recommendations.push('Challenge yourself with advanced topics');
      recommendations.push('Consider helping others or teaching concepts');
    }

    return recommendations;
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (questions.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center">
                <Brain className="h-5 w-5 mr-2" />
                {subject} Assessment
              </CardTitle>
              <CardDescription>
                Question {currentQuestion + 1} of {questions.length}
              </CardDescription>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center text-sm text-gray-600">
                <Clock className="h-4 w-4 mr-1" />
                {formatTime(timeElapsed)}
              </div>
            </div>
          </div>
          <Progress 
            value={((currentQuestion + 1) / questions.length) * 100} 
            className="h-2"
          />
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">
              {questions[currentQuestion].question}
            </h3>
            
            <RadioGroup 
              value={selectedAnswer} 
              onValueChange={setSelectedAnswer}
              className="space-y-3"
            >
              {questions[currentQuestion].options.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                  <Label 
                    htmlFor={`option-${index}`} 
                    className="flex-1 cursor-pointer p-3 rounded-lg border hover:bg-gray-50"
                  >
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className="flex justify-between">
            <Button 
              variant="outline" 
              disabled={currentQuestion === 0}
              onClick={() => setCurrentQuestion(currentQuestion - 1)}
            >
              Previous
            </Button>
            
            <Button onClick={handleNext}>
              {currentQuestion === questions.length - 1 ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Complete Assessment
                </>
              ) : (
                'Next Question'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AssessmentQuiz;