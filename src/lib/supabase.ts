import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database Types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          grade_level: string;
          learning_goals: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          full_name: string;
          grade_level: string;
          learning_goals?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string;
          grade_level?: string;
          learning_goals?: string[];
          updated_at?: string;
        };
      };
      assessments: {
        Row: {
          id: string;
          user_id: string;
          subject: string;
          score: number;
          total_questions: number;
          difficulty_level: string;
          learning_style: string;
          completed_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          subject: string;
          score: number;
          total_questions: number;
          difficulty_level: string;
          learning_style: string;
          completed_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          subject?: string;
          score?: number;
          total_questions?: number;
          difficulty_level?: string;
          learning_style?: string;
          completed_at?: string;
        };
      };
      learning_paths: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string;
          subjects: string[];
          difficulty_level: string;
          estimated_duration: number;
          progress: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description: string;
          subjects: string[];
          difficulty_level: string;
          estimated_duration: number;
          progress?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string;
          subjects?: string[];
          difficulty_level?: string;
          estimated_duration?: number;
          progress?: number;
          updated_at?: string;
        };
      };
      smart_goals: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string;
          target_date: string;
          progress: number;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description: string;
          target_date: string;
          progress?: number;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string;
          target_date?: string;
          progress?: number;
          status?: string;
          updated_at?: string;
        };
      };
      study_sessions: {
        Row: {
          id: string;
          user_id: string;
          subject: string;
          duration: number;
          scheduled_at: string;
          completed: boolean;
          notes: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          subject: string;
          duration: number;
          scheduled_at: string;
          completed?: boolean;
          notes?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          subject?: string;
          duration?: number;
          scheduled_at?: string;
          completed?: boolean;
          notes?: string;
        };
      };
    };
  };
}