import type { StudyDayRow } from "@/types/database";
import { cn } from "@/lib/utils";

export function DayPicker({ days, selected, onChange }: { days: StudyDayRow[]; selected: string[]; onChange: (ids: string[]) => void }) {
  const toggle = (id: string) => onChange(selected.includes(id) ? selected.filter((item) => item !== id) : [...selected, id]);
  return <div className="day-picker" role="group" aria-label="Chọn ngày học">{days.map((day) => <button key={day.id} type="button" aria-pressed={selected.includes(day.id)} className={cn("day-chip", selected.includes(day.id) && "selected")} onClick={() => toggle(day.id)}><strong>Day {day.day_number}</strong><span>{day.title}</span></button>)}</div>;
}
