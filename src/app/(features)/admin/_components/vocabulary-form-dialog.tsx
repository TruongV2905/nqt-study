"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, useWatch } from "react-hook-form";
import { BookOpenCheck, CalendarDays, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { vocabularyFormSchema, type VocabularyFormValues } from "@/schemas/vocabulary.schema";
import type { StudyDayRow } from "@/types/database";
import type { VocabularyWithDays } from "@/types/vocabulary";

export const COMMON_PARTS_OF_SPEECH = [
  { value: "noun", label: "Danh từ (noun)" },
  { value: "verb", label: "Động từ (verb)" },
  { value: "adjective", label: "Tính từ (adjective)" },
  { value: "adverb", label: "Trạng từ (adverb)" },
  { value: "preposition", label: "Giới từ (preposition)" },
  { value: "conjunction", label: "Liên từ (conjunction)" },
  { value: "pronoun", label: "Đại từ (pronoun)" },
  { value: "interjection", label: "Thán từ (interjection)" },
  { value: "phrase", label: "Cụm từ (phrase)" },
  { value: "phrasal verb", label: "Cụm động từ (phrasal verb)" },
  { value: "idiom", label: "Thành ngữ (idiom)" },
] as const;

type VocabularyFormDialogProps = {
  word: VocabularyWithDays | null;
  days: StudyDayRow[];
  open: boolean;
  saving: boolean;
  onClose: () => void;
  onSubmit: (values: VocabularyFormValues) => Promise<void>;
};

export function VocabularyFormDialog({ word, days, open, saving, onClose, onSubmit }: VocabularyFormDialogProps) {
  const [customSelected, setCustomSelected] = useState(false);
  const form = useForm<VocabularyFormValues>({
    resolver: zodResolver(vocabularyFormSchema),
    defaultValues: { word: "", meaningVi: "", pronunciation: "", partOfSpeech: "", examples: [], dayIds: [] },
  });

  const currentPos = useWatch({ control: form.control, name: "partOfSpeech" }) ?? "";
  const isStandardPos = !currentPos || COMMON_PARTS_OF_SPEECH.some((item) => item.value.toLowerCase() === currentPos.toLowerCase().trim());
  const isCustomPos = customSelected || (!isStandardPos && Boolean(currentPos.trim()));

  useEffect(() => {
    if (!open) return;
    form.reset(word ? {
      word: word.word,
      meaningVi: word.meaning_vi,
      pronunciation: word.pronunciation ?? "",
      partOfSpeech: word.part_of_speech ?? "",
      examples: Array.isArray(word.examples) ? word.examples : [],
      dayIds: word.dayIds ?? [],
    } : { word: "", meaningVi: "", pronunciation: "", partOfSpeech: "", examples: [], dayIds: [] });
  }, [form, open, word]);

  const handleSelectPosChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const val = event.target.value;
    if (val === "__custom__") {
      setCustomSelected(true);
    } else {
      setCustomSelected(false);
      form.setValue("partOfSpeech", val, { shouldDirty: true, shouldValidate: true });
    }
  };

  const selectValue = isCustomPos
    ? "__custom__"
    : COMMON_PARTS_OF_SPEECH.some((item) => item.value.toLowerCase() === currentPos.toLowerCase().trim())
      ? currentPos.toLowerCase().trim()
      : currentPos ? "__custom__" : "";

  if (!open) return null;

  return (
    <div className="dialog-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <form className="dialog dialog-wide" role="dialog" aria-modal="true" aria-labelledby="word-dialog-title" onSubmit={form.handleSubmit(onSubmit)}>
        <div className="dialog-head">
          <div className="dialog-title-wrap">
            <span className="dialog-icon"><BookOpenCheck size={21} /></span>
            <div>
              <p className="dialog-eyebrow">THƯ VIỆN TỪ VỰNG</p>
              <h2 id="word-dialog-title">{word ? "Chỉnh sửa từ vựng" : "Thêm từ vựng mới"}</h2>
              <p>Điền thông tin từ và gắn vào một hoặc nhiều ngày học.</p>
            </div>
          </div>
          <Button size="icon" variant="ghost" className="dialog-close" onClick={onClose} aria-label="Đóng"><X size={20} /></Button>
        </div>

        <div className="dialog-body">
          <div className="form-row">
            <div className="field">
              <label htmlFor="word">Từ tiếng Anh <span className="required">*</span></label>
              <Input id="word" autoFocus placeholder="Ví dụ: accommodate" {...form.register("word")} />
              {form.formState.errors.word ? <p className="field-error">{form.formState.errors.word.message}</p> : null}
            </div>
            <div className="field">
              <label htmlFor="meaning">Nghĩa tiếng Việt <span className="required">*</span></label>
              <Input id="meaning" placeholder="Ví dụ: đáp ứng, chứa được" {...form.register("meaningVi")} />
              {form.formState.errors.meaningVi ? <p className="field-error">{form.formState.errors.meaningVi.message}</p> : null}
            </div>
          </div>

          <div className="form-row">
            <div className="field">
              <label htmlFor="pronunciation">Phiên âm</label>
              <Input id="pronunciation" placeholder="/əˈkɒmədeɪt/" {...form.register("pronunciation")} />
            </div>
            <div className="field">
              <label htmlFor="part-of-speech-select">Loại từ</label>
              <select
                id="part-of-speech-select"
                className="input"
                style={{ cursor: "pointer" }}
                value={selectValue}
                onChange={handleSelectPosChange}
              >
                <option value="">-- Chọn loại từ --</option>
                {COMMON_PARTS_OF_SPEECH.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
                <option value="__custom__">Khác (Tự nhập tay)...</option>
              </select>
            </div>
          </div>

          {isCustomPos ? (
            <div className="field" style={{ marginTop: "-4px" }}>
              <label htmlFor="custom-part-of-speech">
                Nhập loại từ tùy chỉnh <span className="field-hint">Nhập tự do (ví dụ: modal verb, count noun...)</span>
              </label>
              <Input
                id="custom-part-of-speech"
                placeholder="Ví dụ: modal verb, count noun, interjection..."
                value={currentPos}
                onChange={(event) => form.setValue("partOfSpeech", event.target.value, { shouldDirty: true, shouldValidate: true })}
                autoFocus
              />
            </div>
          ) : null}

          <div className="field">
            <label htmlFor="examples">Câu ví dụ <span className="field-hint">Mỗi dòng một câu</span></label>
            <Controller
              control={form.control}
              name="examples"
              render={({ field }) => (
                <Textarea
                  id="examples"
                  value={(field.value ?? []).join("\n")}
                  onChange={(event) => field.onChange(event.target.value.split("\n").map((item) => item.trim()).filter(Boolean))}
                  placeholder="The new policies [accommodate] every learner."
                />
              )}
            />
            <p className="helper-text">Đặt đáp án trong <code>[ngoặc vuông]</code> để tự động tạo câu điền từ.</p>
          </div>

          <div className="field day-selection-field">
            <div className="field-heading">
              <div><label>Thuộc các ngày học</label><p>Chọn ít nhất một Day để từ xuất hiện đúng bộ.</p></div>
              <span className="field-heading-icon"><CalendarDays size={18} /></span>
            </div>
            <Controller
              control={form.control}
              name="dayIds"
              render={({ field }) => (
                <div className="check-grid">
                  {days.length ? days.map((day) => {
                    const checked = field.value.includes(day.id);
                    return (
                      <label className={cn("check-label", checked && "selected")} key={day.id}>
                        <input
                          className="check-input"
                          type="checkbox"
                          checked={checked}
                          onChange={(event) => field.onChange(event.target.checked ? [...field.value, day.id] : field.value.filter((id) => id !== day.id))}
                        />
                        <span className="check-control"><Check size={13} strokeWidth={3} /></span>
                        <span className="check-copy"><strong>Day {day.day_number}</strong><small>{day.title}</small></span>
                      </label>
                    );
                  }) : <p className="helper-text">Chưa có ngày học. Hãy tạo Day trước khi thêm từ.</p>}
                </div>
              )}
            />
          </div>
        </div>

        <div className="dialog-actions">
          <Button variant="secondary" onClick={onClose}>Hủy</Button>
          <Button type="submit" disabled={saving}>{saving ? "Đang lưu..." : word ? "Lưu thay đổi" : "Thêm từ vựng"}</Button>
        </div>
      </form>
    </div>
  );
}
