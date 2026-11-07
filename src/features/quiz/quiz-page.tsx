"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ConfigurationRequired } from "@/app/_components/configuration-required";
import { EmptyState } from "@/app/_components/empty-state";
import { PageHeader } from "@/app/_components/page-header";
import { FillInBlank } from "@/app/(features)/quiz/_components/fill-in-blank";
import { MultipleChoice } from "@/app/(features)/quiz/_components/multiple-choice";
import { QuizResult } from "@/app/(features)/quiz/_components/quiz-result";
import { QuizSetup } from "@/app/(features)/quiz/_components/quiz-setup";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useAuthSession } from "@/hooks/use-auth-session";
import { useStudyDays } from "@/hooks/use-study-days";
import { useSaveStudySession } from "@/hooks/use-study-sessions";
import { useStudyTimer } from "@/hooks/use-study-timer";
import { useVocabularies } from "@/hooks/use-vocabularies";
import { useApplyWordProgress } from "@/hooks/use-word-progress";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { quizSnapshotSchema } from "@/schemas/quiz.schema";
import type { QuizQuestion, QuizQuestionType } from "@/types/quiz";
import { answersMatch, buildQuiz } from "@/utils/quiz-engine";
import { formatDuration } from "@/utils/date-time";

type ActiveQuiz = { questions: QuizQuestion[]; index: number; correct: number; startedAt: string; deadline: number | null; answer: string; checked: boolean };
type QuizState = { stage: "setup" } | ({ stage: "active" } & ActiveQuiz) | { stage: "complete"; correct: number; total: number; timedOut: boolean };

export function QuizPage() {
  const configured = isSupabaseConfigured();
  const auth = useAuthSession();
  const days = useStudyDays(configured && auth.isSuccess);
  const words = useVocabularies(configured && auth.isSuccess);
  const saveSession = useSaveStudySession(auth.data);
  const applyProgress = useApplyWordProgress(auth.data);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [type, setType] = useState<QuizQuestionType>("mixed");
  const [duration, setDuration] = useState(0);
  const [state, setState] = useState<QuizState>({ stage: "setup" });
  const finished = useRef(false);
  const selectedWords = useMemo(() => (words.data ?? []).filter((word) => !selectedDays.length || word.dayIds.some((id) => selectedDays.includes(id))), [words.data, selectedDays]);
  const previewQuestions = useMemo(() => buildQuiz(selectedWords, type, () => 0.42), [selectedWords, type]);
  useEffect(() => {
    if (state.stage !== "active") return;
    const beforeUnload = (event: BeforeUnloadEvent) => { event.preventDefault(); };
    const interceptNavigation = (event: MouseEvent) => {
      const target = event.target;
      const anchor = target instanceof Element ? target.closest("a") : null;
      if (anchor && !window.confirm("Bài kiểm tra đang làm chưa được lưu. Bạn vẫn muốn rời trang?")) event.preventDefault();
    };
    window.addEventListener("beforeunload", beforeUnload);
    document.addEventListener("click", interceptNavigation, true);
    return () => { window.removeEventListener("beforeunload", beforeUnload); document.removeEventListener("click", interceptNavigation, true); };
  }, [state.stage]);
  const finish = useCallback((timedOut: boolean) => {
    if (finished.current || state.stage !== "active") return;
    finished.current = true;
    const endedAt = new Date();
    const completedCorrect = state.correct;
    saveSession.mutate({
      mode: "test",
      selected_day_ids: selectedDays,
      question_type: type,
      duration_seconds: Math.max(0, Math.round((endedAt.getTime() - new Date(state.startedAt).getTime()) / 1000)),
      total_questions: state.questions.length,
      correct_answers: completedCorrect,
      status: timedOut ? "timed_out" : "completed",
      started_at: state.startedAt,
      ended_at: endedAt.toISOString(),
    });
    sessionStorage.removeItem("nqt-active-quiz");
    setState({ stage: "complete", correct: completedCorrect, total: state.questions.length, timedOut });
  }, [saveSession, selectedDays, state, type]);
  const remaining = useStudyTimer(state.stage === "active" ? state.deadline : null, useCallback(() => finish(true), [finish]));
  const start = () => { const questions = buildQuiz(selectedWords, type); const startedAt = new Date().toISOString(); finished.current = false; const active: ActiveQuiz = { questions, index: 0, correct: 0, startedAt, deadline: duration ? Date.now() + duration * 60_000 : null, answer: "", checked: false }; setState({ stage: "active", ...active }); sessionStorage.setItem("nqt-active-quiz", JSON.stringify(quizSnapshotSchema.parse(active))); };
  const check = () => {
    if (state.stage !== "active" || state.checked || !state.answer.trim()) return;
    const question = state.questions[state.index];
    if (!question) return;
    const isCorrect = answersMatch(state.answer, question.correctAnswer);
    applyProgress.mutate({ vocabularyId: question.vocabularyId, isCorrect });
    setState({ ...state, checked: true, correct: state.correct + (isCorrect ? 1 : 0) });
  };
  const next = () => { if (state.stage !== "active") return; if (state.index >= state.questions.length - 1) finish(false); else { const nextState = { ...state, index: state.index + 1, answer: "", checked: false }; setState(nextState); sessionStorage.setItem("nqt-active-quiz", JSON.stringify(quizSnapshotSchema.parse(nextState))); } };
  const current = state.stage === "active" ? state.questions[state.index] : undefined;
  const isCorrect = state.stage === "active" && current ? answersMatch(state.answer, current.correctAnswer) : false;
  return <><PageHeader eyebrow="LUYỆN TẬP" title="Kiểm tra từ vựng" description="Kết hợp nhiều ngày học, chọn dạng câu hỏi và thử sức trong thời gian bạn muốn." />{!configured ? <ConfigurationRequired /> : auth.isPending || days.isPending || words.isPending ? <p>Đang tạo bài kiểm tra...</p> : auth.error || days.error || words.error ? <div className="error-banner">Không thể tải dữ liệu. {auth.error?.message ?? days.error?.message ?? words.error?.message}</div> : state.stage === "setup" ? (selectedWords.length ? <QuizSetup days={days.data ?? []} selectedDays={selectedDays} type={type} duration={duration} questionCount={previewQuestions.length} mcqAvailable={new Set(selectedWords.map((word) => word.meaning_vi)).size >= 4} onDaysChange={setSelectedDays} onTypeChange={setType} onDurationChange={setDuration} onStart={start} /> : <EmptyState title="Chưa có từ vựng" description="Cần có nội dung trước khi tạo bài kiểm tra." />) : state.stage === "complete" ? <QuizResult correct={state.correct} total={state.total} timedOut={state.timedOut} syncText={saveSession.isError ? `Lỗi đồng bộ: ${saveSession.error.message}` : saveSession.isPending ? "Đang đồng bộ..." : "Đã lưu lên cloud."} onRestart={() => setState({ stage: "setup" })} /> : <div className="session-wrap"><div className="session-head"><strong>Câu {state.index + 1}/{state.questions.length}</strong><span>{state.deadline ? formatDuration(remaining) : "Không giới hạn"}</span></div><Progress value={(state.index + 1) / state.questions.length * 100} /><Card className="session-card" style={{ marginTop: 16 }}>{current?.kind === "multiple_choice" ? <MultipleChoice question={current} answer={state.answer} checked={state.checked} onAnswer={(answer) => setState({ ...state, answer })} /> : current?.kind === "fill" ? <FillInBlank question={current} answer={state.answer} checked={state.checked} onAnswer={(answer) => setState({ ...state, answer })} /> : null}{state.checked ? <p className="feedback">{isCorrect ? "Chính xác!" : `Chưa đúng. Đáp án đúng: ${current?.correctAnswer}`}</p> : null}</Card><div className="session-actions">{state.checked ? <Button onClick={next}>{state.index === state.questions.length - 1 ? "Xem kết quả" : "Câu tiếp theo"}</Button> : <Button disabled={!state.answer.trim()} onClick={check}>Kiểm tra</Button>}</div></div>}</>;
}
