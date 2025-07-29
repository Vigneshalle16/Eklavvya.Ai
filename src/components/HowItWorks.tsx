import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ClipboardList, 
  Route, 
  Target, 
  TrendingUp,
  ArrowRight
} from "lucide-react";

const HowItWorks = () => {
  const steps = [
    {
      icon: ClipboardList,
      title: "Take Assessment",
      description: "Complete our comprehensive quiz to evaluate your knowledge level, learning preferences, and academic goals.",
      color: "bg-primary",
      badge: "Step 1"
    },
    {
      icon: Route,
      title: "Get Your Path",
      description: "Receive a personalized learning path with curated content for Classes 9-12, JEE, and engineering topics.",
      color: "bg-accent",
      badge: "Step 2"
    },
    {
      icon: Target,
      title: "Set SMART Goals",
      description: "Define specific, measurable academic objectives with our goal-setting module and track your progress.",
      color: "bg-warning",
      badge: "Step 3"
    },
    {
      icon: TrendingUp,
      title: "Learn & Grow",
      description: "Follow your personalized schedule, complete lessons, and watch your progress through visual analytics.",
      color: "bg-success",
      badge: "Step 4"
    }
  ];

  return (
    <section id="how-it-works" className="py-20 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4">
            How It Works
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Your Learning Journey in 4 Simple Steps
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            From assessment to achievement, our platform guides you through every step 
            of your personalized learning experience.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {steps.map((step, index) => {
            const IconComponent = step.icon;
            return (
              <Card key={index} className="relative p-6 text-center hover:shadow-elevation transition-all duration-300 group">
                <CardContent className="p-0">
                  {/* Step Badge */}
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-background text-foreground border">
                    {step.badge}
                  </Badge>

                  {/* Icon */}
                  <div className={`p-4 ${step.color} rounded-lg w-fit mx-auto mb-4 mt-4 group-hover:scale-110 transition-transform duration-300`}>
                    <IconComponent className="h-8 w-8 text-white" />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-semibold text-foreground mb-3">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {step.description}
                  </p>

                  {/* Arrow for connection (desktop only) */}
                  {index < steps.length - 1 && (
                    <div className="hidden lg:block absolute -right-4 top-1/2 transform -translate-y-1/2">
                      <ArrowRight className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <div className="bg-gradient-hero p-8 rounded-2xl text-white">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">
              Ready to Start Your Personalized Learning Journey?
            </h3>
            <p className="text-white/90 mb-6 max-w-2xl mx-auto">
              Join thousands of students who have already transformed their learning experience 
              with our AI-powered personalization.
            </p>
            <Button variant="hero" size="xl" className="bg-white text-primary hover:bg-white/90">
              Start Your Free Assessment
              <ArrowRight />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;