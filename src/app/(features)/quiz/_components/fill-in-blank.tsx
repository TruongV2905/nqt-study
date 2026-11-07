import { Input } from "@/components/ui/input";
import type { QuizQuestion } from "@/types/quiz";

type Fill = Extract<QuizQuestion, { kind: "fill" }>;
export function FillInBlank({ question, answer, checked, onAnswer }: { question: Fill; answer: string; checked: boolean; onAnswer: (value: string) => void }) {
  return <div style={{ width: "100%", maxWidth: 700 }}><p className="eyebrow">ĐIỀN VÀO CHỖ TRỐNG</p><h2 style={{ fontSize: 25, lineHeight: 1.5 }}>{question.prompt}</h2><label className="field" style={{ marginTop: 25 }}><span>Câu trả lời của bạn</span><Input autoFocus disabled={checked} value={answer} onChange={(event) => onAnswer(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") event.currentTarget.form?.requestSubmit(); }} placeholder="Nhập từ còn thiếu..." /></label>{checked ? <p className="feedback">Đáp án: <strong>{question.correctAnswer}</strong></p> : null}</div>;
}
