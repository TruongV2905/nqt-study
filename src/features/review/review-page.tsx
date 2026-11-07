"use client";

import { useEffect, useMemo, useState } from "react";
import { ConfigurationRequired } from "@/app/_components/configuration-required";
import { EmptyState } from "@/app/_components/empty-state";
import { PageHeader } from "@/app/_components/page-header";
import { ReviewList } from "@/app/(features)/review/_components/review-list";
import { Flashcard } from "@/app/(features)/learn/_components/flashcard";
import { Button } from "@/components/ui/button";
import { useAuthSession } from "@/hooks/use-auth-session";
import { useStudyDays } from "@/hooks/use-study-days";
import { useVocabularies } from "@/hooks/use-vocabularies";
import { useApplyWordProgress, useWordProgress } from "@/hooks/use-word-progress";
import { isSupabaseConfigured } from "@/lib/supabase/client";

export function ReviewPage() {
  const configured = isSupabaseConfigured();
  const auth = useAuthSession();
  const ready = configured && auth.isSuccess;
  const days = useStudyDays(ready);
  const words = useVocabularies(ready);
  const progress = useWordProgress(auth.data);
  const applyProgress = useApplyWordProgress(auth.data);
  const [reviewing, setReviewing] = useState(false);
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [reviewTime, setReviewTime] = useState<number | null>(null);
  useEffect(() => { const timer = window.setTimeout(() => setReviewTime(Date.now()), 0); return () => window.clearTimeout(timer); }, []);
  const dueWords = useMemo(() => { const dueIds = new Set((progress.data ?? []).filter((item) => item.incorrect_count > 0 || (reviewTime !== null && item.next_review_at && new Date(item.next_review_at).getTime() <= reviewTime)).map((item) => item.vocabulary_id)); return (words.data ?? []).filter((word) => dueIds.has(word.id)); }, [progress.data, reviewTime, words.data]);
  const answer = async (isCorrect: boolean) => { const word = dueWords[index]; if (!word) return; await applyProgress.mutateAsync({ vocabularyId: word.id, isCorrect }); if (index >= dueWords.length - 1) { setReviewing(false); setIndex(0); } else setIndex((value) => value + 1); setRevealed(false); };
  return <><PageHeader eyebrow="GHI NHỚ" title="Ôn tập từ sai" description="Tập trung vào những từ bạn thường nhầm hoặc đã đến lịch ôn." />{!configured ? <ConfigurationRequired /> : auth.isPending || days.isPending || words.isPending || progress.isPending ? <p>Đang tìm các từ cần ôn...</p> : auth.error || days.error || words.error || progress.error ? <div className="error-banner">Không thể tải dữ liệu ôn tập.</div> : !dueWords.length ? <EmptyState title="Chưa có từ cần ôn" description="Các từ trả lời sai hoặc đến lịch sẽ tự động xuất hiện tại đây." /> : reviewing && dueWords[index] ? <div className="session-wrap"><Flashcard word={dueWords[index]} revealed={revealed} onReveal={() => setRevealed(true)} />{revealed ? <div className="session-actions"><Button variant="danger" disabled={applyProgress.isPending} onClick={() => void answer(false)}>Chưa nhớ</Button><Button disabled={applyProgress.isPending} onClick={() => void answer(true)}>Đã nhớ</Button></div> : null}</div> : <><div className="section-header"><div><h2>{dueWords.length} từ cần ôn</h2><p>Ưu tiên theo lỗi sai và lịch ôn gần nhất.</p></div><Button onClick={() => setReviewing(true)}>Bắt đầu ôn tập</Button></div><ReviewList words={dueWords} days={days.data ?? []} progress={progress.data ?? []} /></>}</>;
}
