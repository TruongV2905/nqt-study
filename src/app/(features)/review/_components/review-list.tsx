import { WordCard } from "@/app/_components/word-card";
import type { StudyDayRow, WordProgressRow } from "@/types/database";
import type { VocabularyWithDays } from "@/types/vocabulary";

export function ReviewList({ words, days, progress }: { words: VocabularyWithDays[]; days: StudyDayRow[]; progress: WordProgressRow[] }) {
  return <div className="grid grid-3">{words.map((word) => { const item = progress.find((row) => row.vocabulary_id === word.id); return <div key={word.id}><WordCard word={word} days={days} /><p className="result-count" style={{ margin: "8px 4px 0" }}>Sai {item?.incorrect_count ?? 0} lần · Mức {item?.mastery_level ?? 0}/5</p></div>; })}</div>;
}
