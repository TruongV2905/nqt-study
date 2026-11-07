import { requireSupabaseClient } from "@/lib/supabase/client";
import type { StudySessionRow } from "@/types/database";

export type NewStudySession = Pick<StudySessionRow, "mode" | "selected_day_ids" | "question_type" | "duration_seconds" | "total_questions" | "correct_answers" | "status" | "started_at" | "ended_at">;

export function toDbQuestionType(type?: string | null): "mcq" | "fill" | "both" {
  if (type === "multiple_choice" || type === "mcq") return "mcq";
  if (type === "fill") return "fill";
  return "both";
}

export async function getStudySessions(userId: string): Promise<StudySessionRow[]> {
  const { data, error } = await requireSupabaseClient().from("study_sessions").select("id,user_id,mode,selected_day_ids,question_type,duration_seconds,total_questions,correct_answers,status,started_at,ended_at").eq("user_id", userId).order("started_at", { ascending: false }).limit(100);
  if (error) throw error;
  return data;
}

export async function saveStudySession(userId: string, session: NewStudySession) {
  const question_type = toDbQuestionType(session.question_type);

  const { error } = await requireSupabaseClient().from("study_sessions").insert({
    ...session,
    question_type,
    user_id: userId,
  });
  if (error) throw error;
}
