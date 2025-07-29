import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Brain, 
  Target, 
  Calendar, 
  BarChart3, 
  Users, 
  Zap,
  CheckCircle,
  TrendingUp
} from "lucide-react";

const Features = () => {
  return (
    <section id="features" className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4">
            Platform Features
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Everything You Need to Excel
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Our comprehensive platform combines assessment, personalization, and progress tracking 
            to create your ideal learning experience.
          </p>
        </div>

        {/* Main Features Grid */}
        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          {/* Smart Assessment */}
          <Card className="p-8 shadow-elevation hover:shadow-glow transition-all duration-300">
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-3 bg-gradient-primary rounded-lg">
                  <Brain className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-2xl">Smart Pre-Assessment</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-6">
                Our comprehensive quiz evaluates your current knowledge level, identifies learning preferences, 
                and understands your academic goals to create a truly personalized learning path.
              </p>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-success" />
                  <span>Knowledge level assessment</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-success" />
                  <span>Learning style identification</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-success" />
                  <span>Goal-oriented recommendations</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Personalized Learning Path */}
          <Card className="p-8 shadow-elevation hover:shadow-glow transition-all duration-300">
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-3 bg-gradient-success rounded-lg">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-2xl">Curated Learning Paths</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-6">
                Get structured content tailored to your level, covering Classes 9-12, JEE preparation, 
                and early engineering topics with logical progression.
              </p>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Mathematics</span>
                  <span className="text-sm text-muted-foreground">85%</span>
                </div>
                <Progress value={85} className="h-2" />
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Physics</span>
                  <span className="text-sm text-muted-foreground">72%</span>
                </div>
                <Progress value={72} className="h-2" />
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Chemistry</span>
                  <span className="text-sm text-muted-foreground">63%</span>
                </div>
                <Progress value={63} className="h-2" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Secondary Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6 text-center hover:shadow-elevation transition-all duration-300">
            <div className="p-3 bg-warning/10 rounded-lg w-fit mx-auto mb-4">
              <Target className="h-8 w-8 text-warning" />
            </div>
            <CardTitle className="text-lg mb-2">SMART Goals</CardTitle>
            <p className="text-sm text-muted-foreground">
              Set specific, measurable goals with visual progress tracking and milestone celebrations.
            </p>
          </Card>

          <Card className="p-6 text-center hover:shadow-elevation transition-all duration-300">
            <div className="p-3 bg-accent/10 rounded-lg w-fit mx-auto mb-4">
              <Calendar className="h-8 w-8 text-accent" />
            </div>
            <CardTitle className="text-lg mb-2">Study Scheduler</CardTitle>
            <p className="text-sm text-muted-foreground">
              Plan study sessions, set reminders, and optimize your learning schedule for maximum efficiency.
            </p>
          </Card>

          <Card className="p-6 text-center hover:shadow-elevation transition-all duration-300">
            <div className="p-3 bg-primary/10 rounded-lg w-fit mx-auto mb-4">
              <BarChart3 className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-lg mb-2">Progress Analytics</CardTitle>
            <p className="text-sm text-muted-foreground">
              Detailed insights into your learning progress with charts, metrics, and performance trends.
            </p>
          </Card>

          <Card className="p-6 text-center hover:shadow-elevation transition-all duration-300">
            <div className="p-3 bg-destructive/10 rounded-lg w-fit mx-auto mb-4">
              <Zap className="h-8 w-8 text-destructive" />
            </div>
            <CardTitle className="text-lg mb-2">Adaptive Learning</CardTitle>
            <p className="text-sm text-muted-foreground">
              Content difficulty adjusts based on your performance to maintain optimal challenge levels.
            </p>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default Features;