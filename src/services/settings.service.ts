import { requireSupabaseClient } from "@/lib/supabase/client";
import type { SettingsValues } from "@/schemas/settings.schema";
import type { UserSettingsRow } from "@/types/database";

export function toDbSettingsQuestionType(type?: string | null): "mcq" | "fill" | "both" {
  if (type === "multiple_choice" || type === "mcq") return "mcq";
  if (type === "fill") return "fill";
  return "both";
}

export async function getSettings(userId: string): Promise<UserSettingsRow | null> {
  const { data, error } = await requireSupabaseClient().from("user_settings").select("user_id,default_duration_minutes,default_question_type,daily_study_time,daily_test_time,updated_at").eq("user_id", userId).maybeSingle();
  if (error) throw error;
  return data;
}

export async function saveSettings(userId: string, values: SettingsValues) {
  const { error } = await requireSupabaseClient().from("user_settings").upsert({
    user_id: userId,
    default_duration_minutes: values.defaultDurationMinutes,
    default_question_type: toDbSettingsQuestionType(values.defaultQuestionType),
    daily_study_time: values.dailyStudyTime,
    daily_test_time: values.dailyTestTime,
    updated_at: new Date().toISOString(),
  }, { onConflict: "user_id" });
  if (error) throw error;
}
