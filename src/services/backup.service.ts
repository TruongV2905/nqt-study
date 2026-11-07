import { requireSupabaseClient } from "@/lib/supabase/client";
import { backupSchema } from "@/schemas/backup.schema";

export async function importLearnerBackup(userId: string, input: unknown) {
  const parsed = backupSchema.parse(input);
  const supabase = requireSupabaseClient();
  if (parsed.progress.length) {
    const progress = await supabase.from("word_progress").upsert(parsed.progress.map((item) => ({ ...item, user_id: userId })), { onConflict: "user_id,vocabulary_id" });
    if (progress.error) throw progress.error;
  }
  if (parsed.settings) {
    const default_question_type =
      parsed.settings.default_question_type === "mcq" || parsed.settings.default_question_type === "multiple_choice"
        ? "mcq"
        : parsed.settings.default_question_type === "fill"
          ? "fill"
          : "both";
    const settings = await supabase.from("user_settings").upsert({
      ...parsed.settings,
      default_question_type,
      user_id: userId,
      updated_at: new Date().toISOString(),
    }, { onConflict: "user_id" });
    if (settings.error) throw settings.error;
  }
  return parsed;
}
