"use client";

import { useMemo, useState } from "react";
import { ConfigurationRequired } from "@/app/_components/configuration-required";
import { EmptyState } from "@/app/_components/empty-state";
import { PageHeader } from "@/app/_components/page-header";
import { VocabularyFilters } from "@/app/(features)/vocabulary/_components/vocabulary-filters";
import { VocabularyGrid } from "@/app/(features)/vocabulary/_components/vocabulary-grid";
import { useAuthSession } from "@/hooks/use-auth-session";
import { useStudyDays } from "@/hooks/use-study-days";
import { useVocabularies } from "@/hooks/use-vocabularies";
import { isSupabaseConfigured } from "@/lib/supabase/client";

export function VocabularyPage() {
  const [query, setQuery] = useState("");
  const [dayId, setDayId] = useState("");
  const configured = isSupabaseConfigured();
  const auth = useAuthSession();
  const days = useStudyDays(configured && auth.isSuccess);
  const words = useVocabularies(configured && auth.isSuccess);
  const filtered = useMemo(() => (words.data ?? []).filter((word) => (!dayId || word.dayIds.includes(dayId)) && (!query || `${word.word} ${word.meaning_vi}`.toLocaleLowerCase("vi").includes(query.toLocaleLowerCase("vi").trim()))), [words.data, dayId, query]);
  return <><PageHeader eyebrow="THƯ VIỆN" title="Kho từ vựng" description="Duyệt từ vựng theo ngày học hoặc tìm kiếm nhanh." />{!configured ? <ConfigurationRequired /> : auth.isPending || days.isPending || words.isPending ? <p>Đang tải thư viện từ Supabase...</p> : auth.error || days.error || words.error ? <div className="error-banner">Không thể tải dữ liệu. {auth.error?.message ?? days.error?.message ?? words.error?.message}</div> : <><VocabularyFilters days={days.data ?? []} query={query} dayId={dayId} onQueryChange={setQuery} onDayChange={setDayId} /><p className="result-count">Tìm thấy {filtered.length} từ vựng</p>{filtered.length ? <VocabularyGrid words={filtered} days={days.data ?? []} /> : <EmptyState title="Chưa có từ vựng" description="Không có nội dung phù hợp với bộ lọc hiện tại." />}</>}</>;
}
