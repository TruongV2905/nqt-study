"use client";

import { useCallback, useEffect } from "react";
import { Volume2, Sparkles, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { VocabularyWithDays } from "@/types/vocabulary";
import { speakEnglish } from "@/utils/pronunciation";

export function Flashcard({
  word,
  revealed,
  onToggle,
  onReveal,
}: {
  word: VocabularyWithDays;
  revealed: boolean;
  onToggle?: () => void;
  onReveal?: () => void;
}) {
  const handleToggle = useCallback(() => {
    if (onToggle) onToggle();
    else if (onReveal) onReveal();
  }, [onToggle, onReveal]);

  // Lắng nghe phím Space để lật thẻ
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" && e.target === document.body) {
        e.preventDefault();
        handleToggle();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleToggle]);

  return (
    <Card
      className="session-card flashcard-interactive"
      role="button"
      tabIndex={0}
      aria-label={
        revealed
          ? "Mặt sau thẻ từ vựng. Nhấn để lật về mặt trước."
          : "Mặt trước thẻ từ vựng. Nhấn để xem nghĩa."
      }
      onClick={handleToggle}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleToggle();
        }
      }}
    >
      <div className="flashcard-content">
        {revealed ? (
          <>
            <span className="flashcard-badge back">
              <RotateCw size={12} />
              MẶT SAU • NGHĨA TIẾNG VIỆT
            </span>
            <h2 className="flash-word" style={{ color: "var(--primary)" }}>
              {word.meaning_vi}
            </h2>
            <p
              className="pronunciation"
              style={{ color: "var(--foreground)", fontWeight: 650 }}
            >
              {word.word} {word.pronunciation ? `[${word.pronunciation}]` : ""}
            </p>
            <div style={{ margin: "14px 0" }}>
              <Button
                variant="secondary"
                size="icon"
                aria-label={`Phát âm ${word.word}`}
                onClick={(e) => {
                  e.stopPropagation();
                  speakEnglish(word.word);
                }}
              >
                <Volume2 size={19} />
              </Button>
            </div>
            {word.examples[0] ? (
              <div
                className="revealed"
                style={{ marginTop: 12, paddingTop: 16 }}
              >
                <p
                  style={{
                    fontStyle: "italic",
                    color: "#475069",
                    fontSize: 15,
                  }}
                >
                  &ldquo;{word.examples[0].replace(/\[|\]/g, "")}&rdquo;
                </p>
              </div>
            ) : null}
            <div className="flashcard-hint">
              <span>Chạm vào thẻ hoặc nhấn</span>
              <kbd>Space</kbd>
              <span>để quay lại</span>
            </div>
          </>
        ) : (
          <>
            <span className="flashcard-badge front">
              <Sparkles size={12} />
              MẶT TRƯỚC • TỪ TIẾNG ANH
            </span>
            <h2 className="flash-word">{word.word}</h2>
            <p className="pronunciation">
              {word.pronunciation ? `/${word.pronunciation}/` : ""}{" "}
              {word.part_of_speech ? `(${word.part_of_speech})` : ""}
            </p>
            <div style={{ margin: "14px 0" }}>
              <Button
                variant="secondary"
                size="icon"
                aria-label={`Phát âm ${word.word}`}
                onClick={(e) => {
                  e.stopPropagation();
                  speakEnglish(word.word);
                }}
              >
                <Volume2 size={19} />
              </Button>
            </div>
            <div className="flashcard-hint">
              <span>Chạm vào thẻ hoặc nhấn</span>
              <kbd>Space</kbd>
              <span>để xem nghĩa</span>
            </div>
          </>
        )}
      </div>
    </Card>
  );
}
