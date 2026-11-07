"use client";

import { CheckCircle2, Clock3, ListChecks } from "lucide-react";
import { ConfigurationRequired } from "@/app/_components/configuration-required";
import { EmptyState } from "@/app/_components/empty-state";
import { PageHeader } from "@/app/_components/page-header";
import { SessionHistory } from "@/app/(features)/statistics/_components/session-history";
import { Card } from "@/components/ui/card";
import { useAuthSession } from "@/hooks/use-auth-session";
import { useStudyDays } from "@/hooks/use-study-days";
import { useStudySessions } from "@/hooks/use-study-sessions";
import { isSupabaseConfigured } from "@/lib/supabase/client";

export function StatisticsPage() {
  const configured = isSupabaseConfigured(); const auth = useAuthSession(); const ready = configured && auth.isSuccess; const sessions = useStudySessions(auth.data); const days = useStudyDays(ready);
  const list = sessions.data ?? []; const tests = list.filter((item) => item.mode === "test"); const correct = tests.reduce((sum, item) => sum + item.correct_answers, 0); const total = tests.reduce((sum, item) => sum + item.total_questions, 0); const accuracy = total ? Math.round(correct / total * 100) : 0;
  const stats = [{ label: "Tổng điểm đúng", value: correct, icon: CheckCircle2 }, { label: "Lượt học", value: list.length, icon: Clock3 }, { label: "Tỷ lệ đúng", value: `${accuracy}%`, icon: ListChecks }];
  return <><PageHeader eyebrow="TIẾN BỘ" title="Thống kê học tập" description="Mọi số liệu được tổng hợp từ các buổi học đã lưu trên Supabase." />{!configured ? <ConfigurationRequired /> : auth.isPending || sessions.isPending || days.isPending ? <p>Đang tổng hợp...</p> : auth.error || sessions.error || days.error ? <div className="error-banner">Không thể tải thống kê.</div> : <><div className="grid grid-3">{stats.map(({ label, value, icon: Icon }) => <Card className="stat-card" key={label}><div className="stat-top"><span>{label}</span><span className="stat-icon"><Icon size={18} /></span></div><strong>{value}</strong></Card>)}</div><div className="section-header"><div><h2>Lịch sử gần đây</h2><p>Tối đa 100 buổi gần nhất.</p></div></div>{list.length ? <SessionHistory sessions={list} days={days.data ?? []} /> : <EmptyState title="Chưa có lịch sử" description="Hoàn thành một buổi học hoặc kiểm tra để xem thống kê." />}</>}</>;
}
