import test from "node:test";
import assert from "node:assert/strict";
import { answersMatch, buildQuiz, extractFill } from "./quiz-engine.ts";
import type { VocabularyWithDays } from "../types/vocabulary.ts";

function word(id: string, value: string, meaning: string, examples: string[] = []): VocabularyWithDays {
  return { id, user_id: "admin", word: value, meaning_vi: meaning, pronunciation: null, part_of_speech: null, examples, created_at: "2026-11-06T00:00:00.000Z", dayIds: [] };
}

test("MCQ luôn có bốn nghĩa khác nhau", () => {
  const questions = buildQuiz([word("1", "one", "một"), word("2", "two", "hai"), word("3", "three", "ba"), word("4", "four", "bốn")], "multiple_choice", () => 0.25);
  assert.equal(questions.length, 4);
  for (const question of questions) {
    assert.equal(question.kind, "multiple_choice");
    if (question.kind === "multiple_choice") assert.equal(new Set(question.options).size, 4);
  }
});

test("không tạo MCQ khi thiếu distractor", () => {
  assert.equal(buildQuiz([word("1", "one", "một"), word("2", "two", "hai"), word("3", "three", "ba")], "multiple_choice").length, 0);
});

test("fill thay cặp ngoặc đầu tiên và chuẩn hóa đáp án", () => {
  assert.deepEqual(extractFill("We [accommodate] everyone."), { answer: "accommodate", prompt: "We ________ everyone.", hasMultipleAnswers: false });
  assert.equal(answersMatch(" Accommodate  ", "accommodate"), true);
});

test("khử trùng từ theo id trong một bài", () => {
  const duplicate = word("1", "one", "một", ["[one] item"]);
  const questions = buildQuiz([duplicate, duplicate], "fill", () => 0.5);
  assert.equal(questions.length, 1);
});
