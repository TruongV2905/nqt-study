import { z } from "zod";

export const settingsSchema = z.object({
  defaultDurationMinutes: z.number().int().min(0).max(60),
  defaultQuestionType: z.enum(["mixed", "multiple_choice", "fill"]),
  dailyStudyTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/).nullable(),
  dailyTestTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/).nullable(),
});
export type SettingsValues = z.infer<typeof settingsSchema>;
