import type { QuizQuestion, QuizQuestionType } from "@/types/quiz";
import type { VocabularyWithDays } from "@/types/vocabulary";

export function normalizeAnswer(value: string) {
  return value.normalize("NFKC").trim().replace(/\s+/g, " ").toLocaleLowerCase("vi");
}

export function answersMatch(actual: string, expected: string) {
  return normalizeAnswer(actual) === normalizeAnswer(expected);
}

export function shuffle<T>(values: readonly T[], random: () => number = Math.random): T[] {
  const output = [...values];
  for (let index = output.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    const current = output[index];
    const swap = output[swapIndex];
    if (current !== undefined && swap !== undefined) {
      output[index] = swap;
      output[swapIndex] = current;
    }
  }
  return output;
}

export function extractFill(example: string) {
  const matches = [...example.matchAll(/\[([^\]]+)\]/g)];
  const first = matches[0];
  if (!first || !first[1]) return null;
  return { answer: first[1], prompt: example.replace(first[0], "________"), hasMultipleAnswers: matches.length > 1 };
}

function createMcq(words: VocabularyWithDays[], random: () => number): QuizQuestion[] {
  const meanings = [...new Set(words.map((item) => item.meaning_vi))];
  if (meanings.length < 4) return [];
  return words.flatMap((word) => {
    const distractors = shuffle(meanings.filter((meaning) => meaning !== word.meaning_vi), random).slice(0, 3);
    if (distractors.length < 3) return [];
    return [{ id: `mcq-${word.id}`, kind: "multiple_choice", vocabularyId: word.id, prompt: word.word, correctAnswer: word.meaning_vi, options: shuffle([word.meaning_vi, ...distractors], random) } satisfies QuizQuestion];
  });
}

function createFills(words: VocabularyWithDays[]): QuizQuestion[] {
  return words.flatMap((word) => word.examples.flatMap((example, index) => {
    const fill = extractFill(example);
    if (!fill) return [];
    return [{ id: `fill-${word.id}-${index}`, kind: "fill", vocabularyId: word.id, prompt: fill.prompt, correctAnswer: fill.answer, sourceWord: word.word } satisfies QuizQuestion];
  }));
}

export function buildQuiz(words: VocabularyWithDays[], type: QuizQuestionType, random: () => number = Math.random) {
  const uniqueWords = [...new Map(words.map((word) => [word.id, word])).values()];
  const mcq = type === "fill" ? [] : createMcq(uniqueWords, random);
  const fills = type === "multiple_choice" ? [] : createFills(uniqueWords);
  return shuffle(type === "mixed" ? [...mcq, ...fills] : type === "fill" ? fills : mcq, random);
}
