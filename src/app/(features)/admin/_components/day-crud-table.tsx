import { CalendarDays, Pencil, Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { StudyDayRow } from "@/types/database";

export function DayCrudTable({
  days,
  onAdd,
  onEdit,
  onDelete,
}: {
  days: StudyDayRow[];
  onAdd: () => void;
  onEdit: (day: StudyDayRow) => void;
  onDelete: (day: StudyDayRow) => void;
}) {
  return (
    <>
      <div className="admin-list-head">
        <div>
          <strong>{days.length}</strong>
          <span>ngày học trong lộ trình</span>
        </div>
        <Button onClick={onAdd}>
          <Plus size={17} />
          Thêm ngày học
        </Button>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Ngày học</th>
              <th>Tiêu đề</th>
              <th>Ngày dự kiến</th>
              <th className="action-column">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {days.length ? (
              days.map((day) => (
                <tr key={day.id}>
                  <td>
                    <div className="table-primary">
                      <span className="table-icon">
                        <CalendarDays size={16} />
                      </span>
                      <Badge>Day {day.day_number}</Badge>
                    </div>
                  </td>
                  <td>
                    <strong>{day.title}</strong>
                  </td>
                  <td>
                    <span className="table-muted">
                      {day.study_date ?? "Chưa đặt ngày"}
                    </span>
                  </td>
                  <td>
                    <div className="table-actions">
                      <Button
                        size="icon"
                        variant="secondary"
                        aria-label={`Sửa Day ${day.day_number}`}
                        onClick={() => onEdit(day)}
                      >
                        <Pencil size={15} />
                      </Button>
                      <Button
                        size="icon"
                        variant="danger"
                        aria-label={`Xóa Day ${day.day_number}`}
                        onClick={() => onDelete(day)}
                      >
                        <Trash2 size={15} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4}>
                  <div className="table-empty">
                    <CalendarDays size={22} />
                    <strong>Chưa có ngày học</strong>
                    <span>Thêm Day đầu tiên để tổ chức từ vựng.</span>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
