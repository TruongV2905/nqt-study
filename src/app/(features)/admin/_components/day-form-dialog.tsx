"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { CalendarPlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { studyDayFormSchema, type StudyDayFormValues } from "@/schemas/study-day.schema";
import type { StudyDayRow } from "@/types/database";

type DayFormDialogProps = {
  day: StudyDayRow | null;
  open: boolean;
  saving: boolean;
  onClose: () => void;
  onSubmit: (values: StudyDayFormValues) => Promise<void>;
};

export function DayFormDialog({ day, open, saving, onClose, onSubmit }: DayFormDialogProps) {
  const form = useForm<StudyDayFormValues>({ resolver: zodResolver(studyDayFormSchema), defaultValues: { dayNumber: 1, title: "", studyDate: "" } });
  useEffect(() => {
    if (open) form.reset(day ? { dayNumber: day.day_number, title: day.title, studyDate: day.study_date ?? "" } : { dayNumber: 1, title: "", studyDate: "" });
  }, [day, form, open]);
  if (!open) return null;

  return (
    <div className="dialog-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <form className="dialog dialog-compact" role="dialog" aria-modal="true" aria-labelledby="day-dialog-title" onSubmit={form.handleSubmit(onSubmit)}>
        <div className="dialog-head">
          <div className="dialog-title-wrap">
            <span className="dialog-icon"><CalendarPlus size={21} /></span>
            <div><p className="dialog-eyebrow">LỘ TRÌNH HỌC</p><h2 id="day-dialog-title">{day ? "Chỉnh sửa ngày học" : "Thêm ngày học mới"}</h2><p>Tổ chức từ vựng thành một chặng học rõ ràng.</p></div>
          </div>
          <Button size="icon" variant="ghost" className="dialog-close" onClick={onClose} aria-label="Đóng"><X size={20} /></Button>
        </div>
        <div className="dialog-body">
          <div className="form-row day-form-row">
            <div className="field day-number-field"><label htmlFor="day-number">Số Day <span className="required">*</span></label><Input id="day-number" type="number" min={1} {...form.register("dayNumber", { valueAsNumber: true })} />{form.formState.errors.dayNumber ? <p className="field-error">{form.formState.errors.dayNumber.message}</p> : null}</div>
            <div className="field"><label htmlFor="study-date">Ngày học dự kiến</label><Input id="study-date" type="date" {...form.register("studyDate")} /></div>
          </div>
          <div className="field"><label htmlFor="day-title">Tiêu đề <span className="required">*</span></label><Input id="day-title" autoFocus placeholder="Ví dụ: Từ vựng giao tiếp cơ bản" {...form.register("title")} />{form.formState.errors.title ? <p className="field-error">{form.formState.errors.title.message}</p> : null}</div>
        </div>
        <div className="dialog-actions"><Button variant="secondary" onClick={onClose}>Hủy</Button><Button type="submit" disabled={saving}>{saving ? "Đang lưu..." : day ? "Lưu thay đổi" : "Thêm ngày học"}</Button></div>
      </form>
    </div>
  );
}
