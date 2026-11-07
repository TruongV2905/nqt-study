import type { StudyDayRow, StudySessionRow } from "@/types/database";
import { formatDateTime, formatDuration } from "@/utils/date-time";

export function SessionHistory({ sessions, days }: { sessions: StudySessionRow[]; days: StudyDayRow[] }) {
  const dayMap = new Map(days.map((day) => [day.id, `Day ${day.day_number}`]));
  return <div className="table-wrap"><table><thead><tr><th>Thời gian</th><th>Chế độ</th><th>Ngày học</th><th>Kết quả</th><th>Thời lượng</th><th>Trạng thái</th></tr></thead><tbody>{sessions.map((session) => <tr key={session.id}><td>{formatDateTime(session.started_at)}</td><td>{session.mode === "test" ? "Kiểm tra" : "Học"}</td><td>{session.selected_day_ids.length ? session.selected_day_ids.map((id) => dayMap.get(id) ?? "Day đã xóa").join(", ") : "Tất cả"}</td><td>{session.mode === "test" ? `${session.correct_answers}/${session.total_questions}` : `${session.total_questions} thẻ`}</td><td>{formatDuration(session.duration_seconds)}</td><td><span className="badge">{session.status === "timed_out" ? "Hết giờ" : "Hoàn thành"}</span></td></tr>)}</tbody></table></div>;
}
