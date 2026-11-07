import { requireSupabaseClient } from "@/lib/supabase/client";
import type { StudyDayFormValues } from "@/schemas/study-day.schema";
import type { StudyDayRow } from "@/types/database";

const DAY_COLUMNS = "id,user_id,day_number,title,study_date,created_at";

export async function getStudyDays(): Promise<StudyDayRow[]> {
  const { data, error } = await requireSupabaseClient().from("study_days").select(DAY_COLUMNS).order("day_number");
  if (error) throw error;
  return data;
}

export async function createStudyDay(values: StudyDayFormValues) {
  const user = await requireSupabaseClient().auth.getUser();
  if (user.error) throw user.error;
  if (!user.data.user) throw new Error("Bạn cần xác thực quản trị.");
  const { error } = await requireSupabaseClient().from("study_days").insert({ user_id: user.data.user.id, day_number: values.dayNumber, title: values.title, study_date: values.studyDate || null });
  if (error) throw error;
}

export async function updateStudyDay(id: string, values: StudyDayFormValues) {
  const { error } = await requireSupabaseClient().from("study_days").update({ day_number: values.dayNumber, title: values.title, study_date: values.studyDate || null }).eq("id", id);
  if (error) throw error;
}

export async function deleteStudyDay(id: string) {
  const { error } = await requireSupabaseClient().from("study_days").delete().eq("id", id);
  if (error) throw error;
}
