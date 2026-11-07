"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Play, Pause, Shuffle, RotateCw } from "lucide-react";
import { toast } from "sonner";
import { ConfigurationRequired } from "@/app/_components/configuration-required";
import { EmptyState } from "@/app/_components/empty-state";
import { PageHeader } from "@/app/_components/page-header";
import { Flashcard } from "@/app/(features)/learn/_components/flashcard";
import { LearnSetup } from "@/app/(features)/learn/_components/learn-setup";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useAuthSession } from "@/hooks/use-auth-session";
import { useStudyDays } from "@/hooks/use-study-days";
import { useSaveStudySession } from "@/hooks/use-study-sessions";
import { useStudyTimer } from "@/hooks/use-study-timer";
import { useVocabularies } from "@/hooks/use-vocabularies";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import type { VocabularyWithDays } from "@/types/vocabulary";
import { formatDuration } from "@/utils/date-time";

type LearnState =
  | { stage: "setup" }
  | { stage: "studying"; index: number; startedAt: string; deadline: number | null }
  | { stage: "complete"; timedOut: boolean };

function shuffleWords(array: VocabularyWithDays[]): VocabularyWithDays[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = result[i]!;
    result[i] = result[j]!;
    result[j] = temp;
  }
  return result;
}

export function LearnPage() {
  const configured = isSupabaseConfigured();
  const auth = useAuthSession();
  const days = useStudyDays(configured && auth.isSuccess);
  const words = useVocabularies(configured && auth.isSuccess);
  const saveSession = useSaveStudySession(auth.data);

  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [duration, setDuration] = useState(0);
  const [shuffle, setShuffle] = useState(false);
  const [autoPlay, setAutoPlay] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [sessionWords, setSessionWords] = useState<VocabularyWithDays[]>([]);
  const [state, setState] = useState<LearnState>({ stage: "setup" });
  const finished = useRef(false);

  const rawSelectedWords = useMemo(
    () =>
      (words.data ?? []).filter(
        (word) => !selectedDays.length || word.dayIds.some((id) => selectedDays.includes(id))
      ),
    [words.data, selectedDays]
  );

  const finish = useCallback(
    (timedOut: boolean) => {
      if (finished.current || state.stage !== "studying") return;
      finished.current = true;
      setAutoPlay(false);
      const endedAt = new Date();
      saveSession.mutate({
        mode: "learn",
        selected_day_ids: selectedDays,
        question_type: "both",
        duration_seconds: Math.max(
          0,
          Math.round((endedAt.getTime() - new Date(state.startedAt).getTime()) / 1000)
        ),
        total_questions: sessionWords.length,
        correct_answers: 0,
        status: timedOut ? "timed_out" : "completed",
        started_at: state.startedAt,
        ended_at: endedAt.toISOString(),
      });
      setState({ stage: "complete", timedOut });
    },
    [saveSession, selectedDays, sessionWords.length, state]
  );

  const remaining = useStudyTimer(
    state.stage === "studying" ? state.deadline : null,
    useCallback(() => finish(true), [finish])
  );

  const start = () => {
    saveSession.reset();
    finished.current = false;
    setRevealed(false);
    setAutoPlay(false);

    const ordered = shuffle ? shuffleWords(rawSelectedWords) : [...rawSelectedWords];
    setSessionWords(ordered);

    const startedAt = new Date().toISOString();
    setState({
      stage: "studying",
      index: 0,
      startedAt,
      deadline: duration ? Date.now() + duration * 60_000 : null,
    });
  };

  const next = useCallback(() => {
    if (state.stage !== "studying") return;
    if (state.index >= sessionWords.length - 1) {
      finish(false);
    } else {
      setRevealed(false);
      setState((prev) =>
        prev.stage === "studying" ? { ...prev, index: prev.index + 1 } : prev
      );
    }
  }, [finish, sessionWords.length, state]);

  const prev = () => {
    if (state.stage !== "studying" || state.index === 0) return;
    setRevealed(false);
    setState({ ...state, index: state.index - 1 });
  };

  const toggleReveal = useCallback(() => {
    setRevealed((prevVal) => !prevVal);
  }, []);

  const shuffleCurrentSession = () => {
    if (state.stage !== "studying") return;
    const shuffled = shuffleWords(sessionWords);
    setSessionWords(shuffled);
    setRevealed(false);
    setState({ ...state, index: 0 });
    toast.success("Đã xáo trộn ngẫu nhiên toàn bộ thẻ!");
  };

  const currentIndex = state.stage === "studying" ? state.index : 0;

  // Logic tự động lật thẻ và tự động qua thẻ mới (Auto-play: 3s xem từ -> 3s xem nghĩa -> qua thẻ mới)
  useEffect(() => {
    if (!autoPlay || state.stage !== "studying") return;

    if (!revealed) {
      // Đang ở mặt trước: tự động lật sau 3 giây
      const timer = setTimeout(() => {
        setRevealed(true);
      }, 3000);
      return () => clearTimeout(timer);
    } else {
      // Đang ở mặt sau (đã hiện nghĩa): tự động chuyển thẻ sau 3 giây
      const timer = setTimeout(() => {
        next();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [autoPlay, revealed, state.stage, currentIndex, next]);

  const currentWord = state.stage === "studying" ? sessionWords[state.index] : undefined;

  return (
    <>
      <PageHeader
        eyebrow="FLASHCARD"
        title="Học từ vựng"
        description="Lật thẻ, nghe phát âm và ghi nhớ theo nhịp độ của riêng bạn."
      />

      {!configured ? (
        <ConfigurationRequired />
      ) : auth.isPending || days.isPending || words.isPending ? (
        <p>Đang chuẩn bị bộ thẻ...</p>
      ) : auth.error || days.error || words.error ? (
        <div className="error-banner">
          Không thể tải dữ liệu. {auth.error?.message ?? days.error?.message ?? words.error?.message}
        </div>
      ) : state.stage === "setup" ? (
        rawSelectedWords.length || (words.data?.length ?? 0) ? (
          <LearnSetup
            days={days.data ?? []}
            selectedDays={selectedDays}
            duration={duration}
            wordCount={rawSelectedWords.length}
            shuffle={shuffle}
            onDaysChange={setSelectedDays}
            onDurationChange={setDuration}
            onShuffleChange={setShuffle}
            onStart={start}
          />
        ) : (
          <EmptyState
            title="Chưa có từ vựng"
            description="Cần có ít nhất một từ trước khi bắt đầu học."
          />
        )
      ) : state.stage === "complete" ? (
        <div className="result-card card">
          <div className="score-ring">✓</div>
          <h2>{state.timedOut ? "Đã hết thời gian" : "Hoàn thành buổi học"}</h2>
          <p>
            {saveSession.isError
              ? `Lỗi đồng bộ: ${saveSession.error.message}`
              : saveSession.isPending
                ? "Đang đồng bộ..."
                : "Đã lưu lên cloud."}
          </p>
          <Button
            onClick={() => {
              saveSession.reset();
              setState({ stage: "setup" });
            }}
          >
            Học lại
          </Button>
        </div>
      ) : (
        <div className="session-wrap">
          <div className="session-head">
            <strong>
              Thẻ {state.index + 1} / {sessionWords.length}
            </strong>
            <span>{state.deadline ? formatDuration(remaining) : "Không giới hạn"}</span>
          </div>

          <Progress value={((state.index + 1) / sessionWords.length) * 100} />

          {/* Thanh công cụ Tự động phát & Trộn thẻ */}
          <div className="learn-bar" style={{ marginTop: 16 }}>
            <div className="learn-bar-group">
              <Button
                variant={autoPlay ? "primary" : "secondary"}
                size="sm"
                onClick={() => setAutoPlay(!autoPlay)}
                style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
              >
                {autoPlay ? <Pause size={14} /> : <Play size={14} />}
                <span>{autoPlay ? "Tạm dừng tự động" : "Tự động học (3s)"}</span>
              </Button>

              {autoPlay ? (
                <span className="autoplay-tag">
                  {revealed ? "⏳ Đang chuyển thẻ tiếp theo..." : "⏳ Đang lật nghĩa..."}
                </span>
              ) : null}
            </div>

            <div className="learn-bar-group">
              <Button
                variant="secondary"
                size="sm"
                onClick={shuffleCurrentSession}
                title="Trộn ngẫu nhiên thứ tự các thẻ"
                style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
              >
                <Shuffle size={14} />
                <span>Trộn thẻ</span>
              </Button>
            </div>
          </div>

          {currentWord ? (
            <div>
              <Flashcard
                word={currentWord}
                revealed={revealed}
                onToggle={toggleReveal}
              />

              <div className="session-actions">
                <Button
                  variant="secondary"
                  disabled={state.index === 0}
                  onClick={prev}
                >
                  Trước
                </Button>

                <Button
                  variant="secondary"
                  onClick={toggleReveal}
                  style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
                >
                  <RotateCw size={15} />
                  <span>{revealed ? "Ẩn nghĩa" : "Xem nghĩa"}</span>
                </Button>

                <Button onClick={next}>
                  {state.index === sessionWords.length - 1 ? "Hoàn thành" : "Tiếp theo"}
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      )}
    </>
  );
}
