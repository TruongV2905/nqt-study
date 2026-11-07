"use client";

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
import type { QuizQuestionType } from "@/types/quiz";

const DURATIONS = [0, 5, 10, 15, 20, 30, 45, 60];

export function QuizSetup({
  days,
  selectedDays,
  type,
  duration,
  questionCount,
  mcqAvailable,
  onDaysChange,
  onTypeChange,
  onDurationChange,
  onStart,
}: {
  days: StudyDayRow[];
  selectedDays: string[];
  type: QuizQuestionType;
  duration: number;
  questionCount: number;
  mcqAvailable: boolean;
  onDaysChange: (ids: string[]) => void;
  onTypeChange: (value: QuizQuestionType) => void;
  onDurationChange: (value: number) => void;
  onStart: () => void;
}) {
  return (
    <div className="panel card">
      <h2>Thiết lập bài kiểm tra</h2>
      <p>Chọn nhiều ngày để gộp từ; từ trùng chỉ xuất hiện một lần.</p>

      <div className="field">
        <label>Ngày học</label>
        <DayPicker days={days} selected={selectedDays} onChange={onDaysChange} />
      </div>

      <div className="field">
        <label htmlFor="quiz-type">Loại câu hỏi</label>
        <Select
          value={type}
          onValueChange={(val: string) => onTypeChange(val as QuizQuestionType)}
        >
          <SelectTrigger id="quiz-type" className="select-trigger-input">
            <SelectValue placeholder="Chọn loại câu hỏi" />
          </SelectTrigger>
          <SelectContent className="select-content-lavender">
            <SelectItem value="mixed" className="select-item-lavender">
              Cả 2 dạng
            </SelectItem>
            <SelectItem value="multiple_choice" className="select-item-lavender">
              Trắc nghiệm 4 đáp án
            </SelectItem>
            <SelectItem value="fill" className="select-item-lavender">
              Điền vào chỗ trống
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {!mcqAvailable && type !== "fill" ? (
        <div className="error-banner">
          Cần ít nhất 4 từ có nghĩa khác nhau để tạo trắc nghiệm 4 đáp án.
        </div>
      ) : null}

      <div className="field">
        <label htmlFor="quiz-duration">Thời lượng</label>
        <Select
          value={String(duration)}
          onValueChange={(val: string) => onDurationChange(Number(val))}
        >
          <SelectTrigger id="quiz-duration" className="select-trigger-input">
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

      <div className="setup-summary">
        <span>Tổng số câu tạo được</span>
        <strong>{questionCount} câu</strong>
      </div>

      <Button
        style={{ width: "100%" }}
        disabled={!questionCount}
        onClick={onStart}
      >
        Bắt đầu kiểm tra
      </Button>
    </div>
  );
}
