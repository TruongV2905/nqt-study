import { z } from "zod";

const baseQuestion = z.object({ id: z.string().min(1), vocabularyId: z.string().uuid(), prompt: z.string().min(1), correctAnswer: z.string().min(1) });
export const quizQuestionSchema = z.discriminatedUnion("kind", [
  baseQuestion.extend({ kind: z.literal("multiple_choice"), options: z.array(z.string()).length(4) }),
  baseQuestion.extend({ kind: z.literal("fill"), sourceWord: z.string().min(1) }),
]);

export const quizSnapshotSchema = z.object({
  questions: z.array(quizQuestionSchema).min(1),
  index: z.number().int().nonnegative(),
  correct: z.number().int().nonnegative(),
  startedAt: z.string().datetime(),
  deadline: z.number().nullable(),
  answer: z.string(),
  checked: z.boolean(),
});
