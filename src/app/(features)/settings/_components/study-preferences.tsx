"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { SettingsValues } from "@/schemas/settings.schema";
import type { UserSettingsRow } from "@/types/database";

export function StudyPreferences({
  settings,
  saving,
  onSave,
}: {
  settings: UserSettingsRow | null;
  saving: boolean;
  onSave: (values: SettingsValues) => Promise<void>;
}) {
  const [form, setForm] = useState<SettingsValues>(() => ({
    defaultDurationMinutes: settings?.default_duration_minutes ?? 0,
    defaultQuestionType:
      settings?.default_question_type === "fill"
        ? "fill"
        : settings?.default_question_type === "mcq" ||
            settings?.default_question_type === "multiple_choice"
          ? "multiple_choice"
          : "mixed",
    dailyStudyTime: settings?.daily_study_time?.slice(0, 5) ?? null,
    dailyTestTime: settings?.daily_test_time?.slice(0, 5) ?? null,
  }));
  const submit = async () => {
    try {
      await onSave(form);
      toast.success("Đã lưu lên cloud.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Lỗi đồng bộ.");
    }
  };
  return (
    <div className="settings-card card">
      <h2>Thiết lập học tập</h2>
      <p>
        Giờ học là cấu hình nhắc trong website; ứng dụng không thể gửi thông báo
        khi đã đóng.
      </p>
      <div className="field">
        <label htmlFor="default-duration">Thời lượng mặc định</label>
        <select
          id="default-duration"
          className="input"
          value={form.defaultDurationMinutes}
          onChange={(event) =>
            setForm({
              ...form,
              defaultDurationMinutes: Number(event.target.value),
            })
          }
        >
          {[0, 5, 10, 15, 20, 30, 45, 60].map((value) => (
            <option key={value} value={value}>
              {value ? `${value} phút` : "Không giới hạn"}
            </option>
          ))}
        </select>
      </div>
      <div className="field">
        <label htmlFor="default-type">Dạng câu hỏi</label>
        <select
          id="default-type"
          className="input"
          value={form.defaultQuestionType}
          onChange={(event) =>
            setForm({
              ...form,
              defaultQuestionType:
                event.target.value === "fill" ||
                event.target.value === "multiple_choice"
                  ? event.target.value
                  : "mixed",
            })
          }
        >
          <option value="mixed">Cả hai dạng</option>
          <option value="multiple_choice">Trắc nghiệm</option>
          <option value="fill">Điền từ</option>
        </select>
      </div>
      <div className="field">
        <label htmlFor="study-time">Giờ học mỗi ngày</label>
        <Input
          id="study-time"
          type="time"
          value={form.dailyStudyTime ?? ""}
          onChange={(event) =>
            setForm({ ...form, dailyStudyTime: event.target.value || null })
          }
        />
      </div>
      <div className="field">
        <label htmlFor="test-time">Giờ kiểm tra mỗi ngày</label>
        <Input
          id="test-time"
          type="time"
          value={form.dailyTestTime ?? ""}
          onChange={(event) =>
            setForm({ ...form, dailyTestTime: event.target.value || null })
          }
        />
      </div>
      <Button disabled={saving} onClick={() => void submit()}>
        {saving ? "Đang đồng bộ..." : "Lưu cài đặt"}
      </Button>
    </div>
  );
}
