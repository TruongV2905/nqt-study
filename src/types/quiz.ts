export type QuizQuestion =
  | { id: string; kind: "multiple_choice"; vocabularyId: string; prompt: string; correctAnswer: string; options: string[] }
  | { id: string; kind: "fill"; vocabularyId: string; prompt: string; correctAnswer: string; sourceWord: string };

export type QuizQuestionType = "mixed" | "multiple_choice" | "fill";
