"use client";

import { Volume2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { StudyDayRow } from "@/types/database";
import type { VocabularyWithDays } from "@/types/vocabulary";
import { speakEnglish } from "@/utils/pronunciation";

export function WordCard({ word, days }: { word: VocabularyWithDays; days: StudyDayRow[] }) {
  const labels = days.filter((day) => word.dayIds.includes(day.id));
  return <Card className="word-card"><div className="word-card-head"><div><h3>{word.word}</h3><p>{[word.pronunciation, word.part_of_speech].filter(Boolean).join(" · ") || "Từ vựng"}</p></div><Button size="icon" variant="secondary" aria-label={`Phát âm ${word.word}`} onClick={() => speakEnglish(word.word)}><Volume2 size={18} /></Button></div><p className="meaning">{word.meaning_vi}</p><div className="badge-row">{labels.map((day) => <Badge key={day.id}>Day {day.day_number}</Badge>)}</div>{word.examples[0] ? <p className="example">{word.examples[0].replace(/\[|\]/g, "")}</p> : null}</Card>;
}
