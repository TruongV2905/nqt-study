// Generated-shape Supabase types for the six existing tables plus the NQT admin migration.
// Regenerate from your project after applying migrations; see README.md.
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      study_days: {
        Row: { created_at: string; day_number: number; id: string; study_date: string | null; title: string; user_id: string };
        Insert: { created_at?: string; day_number: number; id?: string; study_date?: string | null; title: string; user_id: string };
        Update: { day_number?: number; study_date?: string | null; title?: string; user_id?: string };
        Relationships: [];
      };
      vocabularies: {
        Row: { created_at: string; examples: string[]; id: string; meaning_vi: string; part_of_speech: string | null; pronunciation: string | null; user_id: string; word: string };
        Insert: { created_at?: string; examples?: string[]; id?: string; meaning_vi: string; part_of_speech?: string | null; pronunciation?: string | null; user_id: string; word: string };
        Update: { examples?: string[]; meaning_vi?: string; part_of_speech?: string | null; pronunciation?: string | null; user_id?: string; word?: string };
        Relationships: [];
      };
      vocabulary_days: {
        Row: { day_id: string; user_id: string; vocabulary_id: string };
        Insert: { day_id: string; user_id: string; vocabulary_id: string };
        Update: { day_id?: string; user_id?: string; vocabulary_id?: string };
        Relationships: [];
      };
      word_progress: {
        Row: { correct_count: number; incorrect_count: number; last_reviewed_at: string | null; mastery_level: number; next_review_at: string | null; user_id: string; vocabulary_id: string };
        Insert: { correct_count?: number; incorrect_count?: number; last_reviewed_at?: string | null; mastery_level?: number; next_review_at?: string | null; user_id: string; vocabulary_id: string };
        Update: { correct_count?: number; incorrect_count?: number; last_reviewed_at?: string | null; mastery_level?: number; next_review_at?: string | null };
        Relationships: [];
      };
      study_sessions: {
        Row: { correct_answers: number; duration_seconds: number; ended_at: string | null; id: string; mode: string; question_type: string | null; selected_day_ids: string[]; started_at: string; status: string; total_questions: number; user_id: string };
        Insert: { correct_answers?: number; duration_seconds?: number; ended_at?: string | null; id?: string; mode: string; question_type?: string | null; selected_day_ids?: string[]; started_at?: string; status: string; total_questions?: number; user_id: string };
        Update: { correct_answers?: number; duration_seconds?: number; ended_at?: string | null; status?: string; total_questions?: number };
        Relationships: [];
      };
      user_settings: {
        Row: { daily_study_time: string | null; daily_test_time: string | null; default_duration_minutes: number | null; default_question_type: string | null; updated_at: string; user_id: string };
        Insert: { daily_study_time?: string | null; daily_test_time?: string | null; default_duration_minutes?: number | null; default_question_type?: string | null; updated_at?: string; user_id: string };
        Update: { daily_study_time?: string | null; daily_test_time?: string | null; default_duration_minutes?: number | null; default_question_type?: string | null; updated_at?: string };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      apply_word_progress: {
        Args: { p_is_correct: boolean; p_vocabulary_id: string };
        Returns: undefined;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
