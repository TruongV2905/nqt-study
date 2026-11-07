import { z } from "zod";

export const vocabularyFormSchema = z.object({
  word: z.string().trim().min(1, "Vui lòng nhập từ"),
  meaningVi: z.string().trim().min(1, "Vui lòng nhập nghĩa"),
  pronunciation: z.string().trim().optional(),
  partOfSpeech: z.string().trim().optional(),
  examples: z.array(z.string().trim().min(1)),
  dayIds: z.array(z.string().uuid()),
});
export type VocabularyFormValues = z.infer<typeof vocabularyFormSchema>;
