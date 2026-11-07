import { WordCard } from "@/app/_components/word-card";
import type { StudyDayRow } from "@/types/database";
import type { VocabularyWithDays } from "@/types/vocabulary";

export function VocabularyGrid({ words, days }: { words: VocabularyWithDays[]; days: StudyDayRow[] }) { return <div className="grid grid-3">{words.map((word) => <WordCard key={word.id} word={word} days={days} />)}</div>; }
