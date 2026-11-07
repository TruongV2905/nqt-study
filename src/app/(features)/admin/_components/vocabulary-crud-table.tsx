import { BookOpenText, Pencil, Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { StudyDayRow } from "@/types/database";
import type { VocabularyWithDays } from "@/types/vocabulary";

export function VocabularyCrudTable({
  words,
  days,
  onAdd,
  onEdit,
  onDelete,
}: {
  words: VocabularyWithDays[];
  days: StudyDayRow[];
  onAdd: () => void;
  onEdit: (word: VocabularyWithDays) => void;
  onDelete: (word: VocabularyWithDays) => void;
}) {
  const dayMap = new Map(days.map((day) => [day.id, `Day ${day.day_number}`]));
  return (
    <>
      <div className="admin-list-head">
        <div>
          <strong>{words.length}</strong>
          <span>từ vựng trong thư viện</span>
        </div>
        <Button onClick={onAdd}>
          <Plus size={17} />
          Thêm từ vựng
        </Button>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Từ vựng</th>
              <th>Nghĩa tiếng Việt</th>
              <th>Ngày học</th>
              <th>Ví dụ</th>
              <th className="action-column">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {words.length ? (
              words.map((word) => (
                <tr key={word.id}>
                  <td>
                    <div className="table-primary">
                      <span className="table-icon">
                        <BookOpenText size={16} />
                      </span>
                      <div>
                        <strong>{word.word}</strong>
                        <small>
                          {[word.pronunciation, word.part_of_speech]
                            .filter(Boolean)
                            .join(" · ") || "Chưa có phiên âm"}
                        </small>
                      </div>
                    </div>
                  </td>
                  <td>{word.meaning_vi}</td>
                  <td>
                    <div className="badge-row">
                      {word.dayIds.length ? (
                        word.dayIds.map((id) => (
                          <Badge key={id}>
                            {dayMap.get(id) ?? "Day đã xóa"}
                          </Badge>
                        ))
                      ) : (
                        <span className="table-muted">Chưa gắn Day</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <span className="count-pill">
                      {(word.examples ?? []).length}
                    </span>
                  </td>
                  <td>
                    <div className="table-actions">
                      <Button
                        size="icon"
                        variant="secondary"
                        aria-label={`Sửa ${word.word}`}
                        onClick={() => onEdit(word)}
                      >
                        <Pencil size={15} />
                      </Button>
                      <Button
                        size="icon"
                        variant="danger"
                        aria-label={`Xóa ${word.word}`}
                        onClick={() => onDelete(word)}
                      >
                        <Trash2 size={15} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5}>
                  <div className="table-empty">
                    <BookOpenText size={22} />
                    <strong>Chưa có từ vựng</strong>
                    <span>Thêm từ đầu tiên để bắt đầu xây dựng thư viện.</span>
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
