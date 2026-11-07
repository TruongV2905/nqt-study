import { requireSupabaseClient } from "@/lib/supabase/client";
import type { WordProgressRow } from "@/types/database";

export async function getWordProgress(userId: string): Promise<WordProgressRow[]> {
  const { data, error } = await requireSupabaseClient().from("word_progress").select("user_id,vocabulary_id,correct_count,incorrect_count,mastery_level,last_reviewed_at,next_review_at").eq("user_id", userId);
  if (error) throw error;
  return data;
}

export async function applyWordProgress(vocabularyId: string, isCorrect: boolean) {
  const { error } = await requireSupabaseClient().rpc("apply_word_progress", { p_vocabulary_id: vocabularyId, p_is_correct: isCorrect });
  if (error) throw error;
}
