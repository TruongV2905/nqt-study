import { cn } from "@/lib/utils";
import type { QuizQuestion } from "@/types/quiz";

type Mcq = Extract<QuizQuestion, { kind: "multiple_choice" }>;
export function MultipleChoice({ question, answer, checked, onAnswer }: { question: Mcq; answer: string; checked: boolean; onAnswer: (value: string) => void }) {
  return <><h2 className="flash-word" style={{ fontSize: 42 }}>{question.prompt}</h2><p>Chọn nghĩa tiếng Việt đúng</p><div className="choice-grid">{question.options.map((option, index) => { const correct = checked && option === question.correctAnswer; const wrong = checked && answer === option && !correct; return <button key={option} type="button" disabled={checked} aria-pressed={answer === option} className={cn("choice", answer === option && "selected", correct && "correct", wrong && "wrong")} onClick={() => onAnswer(option)}><strong>{String.fromCharCode(65 + index)}.</strong> {option}{correct ? " — Đáp án đúng" : wrong ? " — Bạn đã chọn" : ""}</button>; })}</div></>;
}
