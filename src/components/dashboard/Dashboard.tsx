import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, 
  Target, 
  Calendar, 
  TrendingUp, 
  Clock, 
  Award,
  LogOut,
  User,
  Settings
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UserProfile {
  full_name: string;
  grade_level: string;
  learning_goals: string[];
}

interface Assessment {
  subject: string;
  score: number;
  total_questions: number;
  difficulty_level: string;
}

interface LearningPath {
  title: string;
  description: string;
  progress: number;
  subjects: string[];
}

interface SmartGoal {
  title: string;
  progress: number;
  target_date: string;
  status: string;
}

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [learningPaths, setLearningPaths] = useState<LearningPath[]>([]);
  const [goals, setGoals] = useState<SmartGoal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
    if (!user) return;

    try {
      // Load user profile
      const { data: profileData } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileData) setProfile(profileData);

      // Load recent assessments
      const { data: assessmentData } = await supabase
        .from('assessments')
        .select('*')
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false })
        .limit(3);

      if (assessmentData) setAssessments(assessmentData);

      // Load learning paths
      const { data: pathData } = await supabase
        .from('learning_paths')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (pathData) setLearningPaths(pathData);

      // Load SMART goals
      const { data: goalData } = await supabase
        .from('smart_goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (goalData) setGoals(goalData);

    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed Out",
        description: "You've been successfully signed out.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <BookOpen className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold text-gray-900">Eklavya AI</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">
                  {profile?.full_name || user?.email}
                </span>
              </div>
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {profile?.full_name?.split(' ')[0] || 'Student'}!
          </h2>
          <p className="text-gray-600">
            Continue your personalized learning journey • Grade {profile?.grade_level}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Overall Progress</p>
                  <p className="text-2xl font-bold text-gray-900">78%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <BookOpen className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Assessments Taken</p>
                  <p className="text-2xl font-bold text-gray-900">{assessments.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Target className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Goals</p>
                  <p className="text-2xl font-bold text-gray-900">{goals.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Study Streak</p>
                  <p className="text-2xl font-bold text-gray-900">7 days</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Learning Paths */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BookOpen className="h-5 w-5 mr-2" />
                Your Learning Paths
              </CardTitle>
              <CardDescription>
                Personalized learning journeys based on your assessments
              </CardDescription>
            </CardHeader>
            <CardContent>
              {learningPaths.length > 0 ? (
                <div className="space-y-4">
                  {learningPaths.map((path, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold">{path.title}</h4>
                        <Badge variant="secondary">{path.progress}%</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{path.description}</p>
                      <div className="flex flex-wrap gap-1 mb-3">
                        {path.subjects.map((subject, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {subject}
                          </Badge>
                        ))}
                      </div>
                      <Progress value={path.progress} className="h-2" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">No learning paths yet</p>
                  <Button>Take Your First Assessment</Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* SMART Goals */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="h-5 w-5 mr-2" />
                Your SMART Goals
              </CardTitle>
              <CardDescription>
                Track your academic objectives and milestones
              </CardDescription>
            </CardHeader>
            <CardContent>
              {goals.length > 0 ? (
                <div className="space-y-4">
                  {goals.map((goal, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold">{goal.title}</h4>
                        <Badge 
                          variant={goal.status === 'completed' ? 'default' : 'secondary'}
                        >
                          {goal.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">
                        Target: {new Date(goal.target_date).toLocaleDateString()}
                      </p>
                      <Progress value={goal.progress} className="h-2" />
                      <p className="text-xs text-gray-500 mt-1">{goal.progress}% complete</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">No goals set yet</p>
                  <Button>Set Your First Goal</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Assessments */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Award className="h-5 w-5 mr-2" />
              Recent Assessment Results
            </CardTitle>
            <CardDescription>
              Your latest performance across different subjects
            </CardDescription>
          </CardHeader>
          <CardContent>
            {assessments.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {assessments.map((assessment, index) => (
                  <div key={index} className="border rounded-lg p-4 text-center">
                    <h4 className="font-semibold mb-2">{assessment.subject}</h4>
                    <div className="text-3xl font-bold text-primary mb-2">
                      {Math.round((assessment.score / assessment.total_questions) * 100)}%
                    </div>
                    <p className="text-sm text-gray-600">
                      {assessment.score}/{assessment.total_questions} correct
                    </p>
                    <Badge variant="outline" className="mt-2">
                      {assessment.difficulty_level}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">No assessments taken yet</p>
                <Button>Take Your First Assessment</Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;