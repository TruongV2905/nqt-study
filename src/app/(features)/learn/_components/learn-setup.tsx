"use client";

import { Shuffle, Clock } from "lucide-react";
import { DayPicker } from "@/app/_components/day-picker";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { StudyDayRow } from "@/types/database";

const DURATIONS = [0, 5, 10, 15, 20, 30, 45, 60];

export function LearnSetup({
  days,
  selectedDays,
  duration,
  wordCount,
  shuffle,
  onDaysChange,
  onDurationChange,
  onShuffleChange,
  onStart,
}: {
  days: StudyDayRow[];
  selectedDays: string[];
  duration: number;
  wordCount: number;
  shuffle: boolean;
  onDaysChange: (ids: string[]) => void;
  onDurationChange: (value: number) => void;
  onShuffleChange: (value: boolean) => void;
  onStart: () => void;
}) {
  return (
    <div className="panel card">
      <h2>Chọn nội dung học</h2>
      <p>Không chọn ngày nào nghĩa là học tất cả các bộ từ.</p>

      <div className="field">
        <label>Ngày học</label>
        <DayPicker days={days} selected={selectedDays} onChange={onDaysChange} />
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onDaysChange(days.map((day) => day.id))}
        >
          Chọn tất cả
        </Button>
        <Button size="sm" variant="ghost" onClick={() => onDaysChange([])}>
          Bỏ chọn
        </Button>
      </div>

      <div className="field">
        <label htmlFor="learn-duration" style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Clock size={14} color="var(--primary)" />
          <span>Thời lượng học</span>
        </label>
        <Select
          value={String(duration)}
          onValueChange={(val: string) => onDurationChange(Number(val))}
        >
          <SelectTrigger id="learn-duration" className="select-trigger-input">
            <SelectValue placeholder="Chọn thời lượng" />
          </SelectTrigger>
          <SelectContent className="select-content-lavender">
            {DURATIONS.map((item) => (
              <SelectItem
                key={item}
                value={String(item)}
                className="select-item-lavender"
              >
                {item === 0 ? "Không giới hạn" : `${item} phút`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div
        role="button"
        tabIndex={0}
        onClick={() => onShuffleChange(!shuffle)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onShuffleChange(!shuffle);
          }
        }}
        className={`check-label ${shuffle ? "selected" : ""}`}
        style={{ marginTop: 8, marginBottom: 20 }}
      >
        <div className="check-control" style={{ borderColor: shuffle ? "var(--primary)" : undefined }}>
          {shuffle ? "✓" : null}
        </div>
        <div className="check-copy">
          <strong style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Shuffle size={14} color="var(--primary)" />
            Trộn ngẫu nhiên thứ tự thẻ
          </strong>
          <small>Xáo trộn các từ vựng ngẫu nhiên giúp ghi nhớ tốt hơn</small>
        </div>
      </div>

      <div className="setup-summary">
        <span>Số từ đã chọn</span>
        <strong>{wordCount} từ</strong>
      </div>

      <Button
        style={{ width: "100%" }}
        disabled={!wordCount}
        onClick={onStart}
      >
        Bắt đầu học
      </Button>
    </div>
  );
}
