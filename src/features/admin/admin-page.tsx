"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { toast } from "sonner";
import { ConfigurationRequired } from "@/app/_components/configuration-required";
import { PageHeader } from "@/app/_components/page-header";
import { DayCrudTable } from "@/app/(features)/admin/_components/day-crud-table";
import { DayFormDialog } from "@/app/(features)/admin/_components/day-form-dialog";
import { VocabularyCrudTable } from "@/app/(features)/admin/_components/vocabulary-crud-table";
import { VocabularyFormDialog } from "@/app/(features)/admin/_components/vocabulary-form-dialog";
import { Input } from "@/components/ui/input";
import { useAuthSession } from "@/hooks/use-auth-session";
import { useStudyDayMutations, useStudyDays } from "@/hooks/use-study-days";
import { useVocabularies, useVocabularyMutations } from "@/hooks/use-vocabularies";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import type { StudyDayFormValues } from "@/schemas/study-day.schema";
import type { VocabularyFormValues } from "@/schemas/vocabulary.schema";
import type { StudyDayRow } from "@/types/database";
import type { VocabularyWithDays } from "@/types/vocabulary";

export function AdminPage() {
  const configured = isSupabaseConfigured();
  const auth = useAuthSession();
  const ready = configured && auth.isSuccess;
  const days = useStudyDays(ready);
  const words = useVocabularies(ready);
  const dayMutations = useStudyDayMutations();
  const wordMutations = useVocabularyMutations();
  const [tab, setTab] = useState<"days" | "words">("days");
  const [query, setQuery] = useState("");
  const [dayDialog, setDayDialog] = useState(false);
  const [wordDialog, setWordDialog] = useState(false);
  const [editingDay, setEditingDay] = useState<StudyDayRow | null>(null);
  const [editingWord, setEditingWord] = useState<VocabularyWithDays | null>(null);

  const filteredDays = useMemo(
    () => (days.data ?? []).filter((day) => `${day.day_number} ${day.title}`.toLocaleLowerCase("vi").includes(query.toLocaleLowerCase("vi"))),
    [days.data, query],
  );
  const filteredWords = useMemo(
    () => (words.data ?? []).filter((word) => `${word.word} ${word.meaning_vi}`.toLocaleLowerCase("vi").includes(query.toLocaleLowerCase("vi"))),
    [query, words.data],
  );

  const handleError = (error: unknown) => toast.error(error instanceof Error ? error.message : "Thao tác thất bại.");

  const submitDay = async (values: StudyDayFormValues) => {
    try {
      if (editingDay) await dayMutations.updateDay.mutateAsync({ id: editingDay.id, values });
      else await dayMutations.createDay.mutateAsync(values);
      toast.success("Đã lưu ngày học.");
      setDayDialog(false);
    } catch (error) {
      handleError(error);
    }
  };

  const submitWord = async (values: VocabularyFormValues) => {
    try {
      if (editingWord) await wordMutations.updateWord.mutateAsync({ id: editingWord.id, values });
      else await wordMutations.createWord.mutateAsync(values);
      toast.success("Đã lưu từ vựng.");
      setWordDialog(false);
    } catch (error) {
      handleError(error);
    }
  };

  const removeDay = async (day: StudyDayRow) => {
    if (!window.confirm(`Xóa Day ${day.day_number}? Từ vựng không bị xóa.`)) return;
    try {
      await dayMutations.deleteDay.mutateAsync(day.id);
      toast.success("Đã xóa ngày học.");
    } catch (error) {
      handleError(error);
    }
  };

  const removeWord = async (word: VocabularyWithDays) => {
    if (!window.confirm(`Xóa “${word.word}” và tiến độ liên quan?`)) return;
    try {
      await wordMutations.deleteWord.mutateAsync(word.id);
      toast.success("Đã xóa từ vựng.");
    } catch (error) {
      handleError(error);
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="QUẢN TRỊ"
        title="Quản trị nội dung"
        description="Tạo ngày học, từ vựng và quan hệ nhiều-nhiều. Trang này không yêu cầu đăng nhập quản trị."
      />
      {!configured ? (
        <ConfigurationRequired />
      ) : auth.isPending ? (
        <p>Đang chuẩn bị phiên làm việc...</p>
      ) : auth.error ? (
        <div className="error-banner">Không thể tạo phiên Supabase. {auth.error.message}</div>
      ) : (
        <>
          <section className="admin-panel">
          <div className="admin-toolbar">
            <div className="toolbar" style={{ flex: 1, margin: 0, gridTemplateColumns: "minmax(220px, 460px)" }}>
              <label style={{ position: "relative" }}>
                <span className="sr-only">Tìm nội dung</span>
                <Search size={17} style={{ position: "absolute", left: 13, top: 14, color: "#79869a" }} />
                <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm nội dung..." style={{ paddingLeft: 40 }} />
              </label>
            </div>
          </div>
          <div className="tabs">
            <button type="button" className={`tab ${tab === "days" ? "active" : ""}`} onClick={() => setTab("days")}>Quản lý ngày học</button>
            <button type="button" className={`tab ${tab === "words" ? "active" : ""}`} onClick={() => setTab("words")}>Quản lý từ vựng</button>
          </div>
          {days.isPending || words.isPending ? (
            <p>Đang tải dữ liệu quản trị...</p>
          ) : days.error || words.error ? (
            <div className="error-banner">Không thể tải nội dung. {days.error?.message ?? words.error?.message}</div>
          ) : tab === "days" ? (
            <DayCrudTable
              days={filteredDays}
              onAdd={() => { setEditingDay(null); setDayDialog(true); }}
              onEdit={(day) => { setEditingDay(day); setDayDialog(true); }}
              onDelete={(day) => void removeDay(day)}
            />
          ) : (
            <VocabularyCrudTable
              words={filteredWords}
              days={days.data ?? []}
              onAdd={() => { setEditingWord(null); setWordDialog(true); }}
              onEdit={(word) => { setEditingWord(word); setWordDialog(true); }}
              onDelete={(word) => void removeWord(word)}
            />
          )}
          </section>
          <DayFormDialog
            day={editingDay}
            open={dayDialog}
            saving={dayMutations.createDay.isPending || dayMutations.updateDay.isPending}
            onClose={() => setDayDialog(false)}
            onSubmit={submitDay}
          />
          <VocabularyFormDialog
            word={editingWord}
            days={days.data ?? []}
            open={wordDialog}
            saving={wordMutations.createWord.isPending || wordMutations.updateWord.isPending}
            onClose={() => setWordDialog(false)}
            onSubmit={submitWord}
          />
        </>
      )}
    </>
  );
}
