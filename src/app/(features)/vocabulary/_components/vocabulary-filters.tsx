import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import type { StudyDayRow } from "@/types/database";

export function VocabularyFilters({ days, query, dayId, onQueryChange, onDayChange }: { days: StudyDayRow[]; query: string; dayId: string; onQueryChange: (value: string) => void; onDayChange: (value: string) => void }) {
  return <div className="toolbar"><label className="field" style={{ margin: 0 }}><span className="sr-only">Tìm từ vựng</span><span style={{ position: "relative" }}><Search size={17} style={{ position: "absolute", left: 13, top: 14, color: "#79869a" }} /><Input value={query} onChange={(event) => onQueryChange(event.target.value)} placeholder="Tìm từ tiếng Anh hoặc nghĩa tiếng Việt..." style={{ paddingLeft: 40 }} /></span></label><label><span className="sr-only">Lọc theo ngày học</span><select className="input" value={dayId} onChange={(event) => onDayChange(event.target.value)}><option value="">Tất cả ngày học</option>{days.map((day) => <option value={day.id} key={day.id}>Day {day.day_number} · {day.title}</option>)}</select></label></div>;
}
