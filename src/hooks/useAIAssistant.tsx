import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AIRequest {
  type: 'study-plan' | 'question-explanation' | 'performance-analysis' | 'learning-path';
  data: any;
}

export const useAIAssistant = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const callAIAssistant = async (request: AIRequest, userId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-assistant', {
        body: {
          ...request,
          userId
        }
      });

      if (error) throw error;

      if (!data.success) {
        throw new Error(data.error || 'AI assistant request failed');
      }

      return data.data;
    } catch (error: any) {
      console.error('AI Assistant Error:', error);
      toast({
        title: "AI Assistant Error",
        description: error.message || "Failed to process AI request",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const generateStudyPlan = async (data: any, userId: string) => {
    return callAIAssistant({ type: 'study-plan', data }, userId);
  };

  const explainQuestion = async (data: any, userId: string) => {
    return callAIAssistant({ type: 'question-explanation', data }, userId);
  };

  const analyzePerformance = async (data: any, userId: string) => {
    return callAIAssistant({ type: 'performance-analysis', data }, userId);
  };

  const generateLearningPath = async (data: any, userId: string) => {
    return callAIAssistant({ type: 'learning-path', data }, userId);
  };

  return {
    loading,
    generateStudyPlan,
    explainQuestion,
    analyzePerformance,
    generateLearningPath,
  };
};