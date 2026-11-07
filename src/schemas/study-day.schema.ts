import { z } from "zod";

export const studyDayFormSchema = z.object({
  dayNumber: z.number().int().positive("Số ngày phải lớn hơn 0"),
  title: z.string().trim().min(1, "Vui lòng nhập tiêu đề"),
  studyDate: z.string().optional(),
});
export type StudyDayFormValues = z.infer<typeof studyDayFormSchema>;
