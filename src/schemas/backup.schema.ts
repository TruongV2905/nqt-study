import { z } from "zod";

export const backupSchema = z.object({
  version: z.literal(1),
  exportedAt: z.string().datetime(),
  progress: z.array(z.object({ vocabulary_id: z.string().uuid(), correct_count: z.number().int().nonnegative(), incorrect_count: z.number().int().nonnegative(), mastery_level: z.number().int().min(0).max(5), last_reviewed_at: z.string().datetime().nullable(), next_review_at: z.string().datetime().nullable() })),
  settings: z.object({ default_duration_minutes: z.number().int().nullable(), default_question_type: z.string().nullable(), daily_study_time: z.string().nullable(), daily_test_time: z.string().nullable() }).nullable(),
});
