import { requireSupabaseClient } from "@/lib/supabase/client";
import type { VocabularyFormValues } from "@/schemas/vocabulary.schema";
import type { VocabularyWithDays } from "@/types/vocabulary";

const WORD_COLUMNS = "id,user_id,word,meaning_vi,pronunciation,part_of_speech,examples,created_at";

export async function getVocabularies(): Promise<VocabularyWithDays[]> {
  const supabase = requireSupabaseClient();
  const [words, relations] = await Promise.all([
    supabase.from("vocabularies").select(WORD_COLUMNS).order("word"),
    supabase.from("vocabulary_days").select("day_id,vocabulary_id,user_id"),
  ]);
  if (words.error) throw words.error;
  if (relations.error) throw relations.error;
  const dayMap = new Map<string, string[]>();
  for (const relation of relations.data) dayMap.set(relation.vocabulary_id, [...(dayMap.get(relation.vocabulary_id) ?? []), relation.day_id]);
  return (words.data ?? []).map((word) => ({
    ...word,
    examples: Array.isArray(word.examples) ? word.examples : [],
    dayIds: dayMap.get(word.id) ?? [],
  }));
}

export async function createVocabulary(values: VocabularyFormValues) {
  const supabase = requireSupabaseClient();
  const userResult = await supabase.auth.getUser();
  if (userResult.error) throw userResult.error;
  const user = userResult.data.user;
  if (!user) throw new Error("Bạn cần xác thực quản trị.");
  const { data, error } = await supabase.from("vocabularies").insert({ user_id: user.id, word: values.word, meaning_vi: values.meaningVi, pronunciation: values.pronunciation || null, part_of_speech: values.partOfSpeech || null, examples: values.examples }).select("id").single();
  if (error) throw error;
  if (values.dayIds.length) {
    const relation = await supabase.from("vocabulary_days").insert(values.dayIds.map((dayId) => ({ day_id: dayId, vocabulary_id: data.id, user_id: user.id })));
    if (relation.error) throw relation.error;
  }
}

export async function updateVocabulary(id: string, values: VocabularyFormValues) {
  const supabase = requireSupabaseClient();
  const userResult = await supabase.auth.getUser();
  if (userResult.error) throw userResult.error;
  const user = userResult.data.user;
  if (!user) throw new Error("Bạn cần xác thực quản trị.");
  const update = await supabase.from("vocabularies").update({ word: values.word, meaning_vi: values.meaningVi, pronunciation: values.pronunciation || null, part_of_speech: values.partOfSpeech || null, examples: values.examples }).eq("id", id);
  if (update.error) throw update.error;
  const removed = await supabase.from("vocabulary_days").delete().eq("vocabulary_id", id);
  if (removed.error) throw removed.error;
  if (values.dayIds.length) {
    const added = await supabase.from("vocabulary_days").insert(values.dayIds.map((dayId) => ({ day_id: dayId, vocabulary_id: id, user_id: user.id })));
    if (added.error) throw added.error;
  }
}

export async function deleteVocabulary(id: string) {
  const { error } = await requireSupabaseClient().from("vocabularies").delete().eq("id", id);
  if (error) throw error;
}
