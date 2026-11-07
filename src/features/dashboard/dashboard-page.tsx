"use client";

import Link from "next/link";
import { ArrowRight, BookOpen, CalendarDays, CheckCircle2, ClipboardCheck, Clock3, GraduationCap, Layers3 } from "lucide-react";
import { ConfigurationRequired } from "@/app/_components/configuration-required";
import { EmptyState } from "@/app/_components/empty-state";
import { PageHeader } from "@/app/_components/page-header";
import { WordCard } from "@/app/_components/word-card";
import { Card } from "@/components/ui/card";
import { useAuthSession } from "@/hooks/use-auth-session";
import { useStudyDays } from "@/hooks/use-study-days";
import { useStudySessions } from "@/hooks/use-study-sessions";
import { useVocabularies } from "@/hooks/use-vocabularies";
import { useWordProgress } from "@/hooks/use-word-progress";
import { isSupabaseConfigured } from "@/lib/supabase/client";

export function DashboardPage() {
  const configured = isSupabaseConfigured();
  const auth = useAuthSession();
  const ready = configured && auth.isSuccess;
  const days = useStudyDays(ready);
  const words = useVocabularies(ready);
  const sessions = useStudySessions(auth.data);
  const progress = useWordProgress(auth.data);
  if (!configured) return <><PageHeader eyebrow="NQT VOCABULARY" title="Học mỗi ngày, nhớ thật lâu." description="Tổ chức từ vựng, ôn tập thông minh và theo dõi sự tiến bộ của bạn." /><ConfigurationRequired /></>;
  if (auth.isPending || days.isPending || words.isPending) return <><PageHeader eyebrow="NQT VOCABULARY" title="Đang chuẩn bị góc học tập..." description="NQT đang kết nối an toàn với dữ liệu của bạn." /><Card className="empty-state"><p>Đang tải dữ liệu từ Supabase...</p></Card></>;
  const error = auth.error ?? days.error ?? words.error;
  if (error) return <><PageHeader eyebrow="NQT VOCABULARY" title="Không thể tải dữ liệu" description="Kết nối Supabase chưa sẵn sàng." /><div className="error-banner">{error.message}</div></>;
  const dayList = days.data ?? [];
  const wordList = words.data ?? [];
  const progressList = progress.data ?? [];
  const correct = progressList.reduce((sum, item) => sum + item.correct_count, 0);
  const incorrect = progressList.reduce((sum, item) => sum + item.incorrect_count, 0);
  const accuracy = correct + incorrect ? Math.round(correct / (correct + incorrect) * 100) : 0;
  const stats = [
    { label: "Từ vựng", value: wordList.length, icon: Layers3 },
    { label: "Ngày học", value: dayList.length, icon: CalendarDays },
    { label: "Tỷ lệ trả lời đúng", value: `${accuracy}%`, icon: CheckCircle2 },
    { label: "Buổi đã lưu", value: sessions.data?.length ?? 0, icon: Clock3 },
  ];
  return <><PageHeader eyebrow="NQT VOCABULARY" title="Học mỗi ngày, nhớ thật lâu." description="Tổ chức từ vựng, ôn tập thông minh và theo dõi sự tiến bộ của bạn." /><section className="hero"><div className="hero-copy"><p className="eyebrow">GÓC HỌC TẬP CỦA BẠN</p><h2>Một từ mới hôm nay, một bước tiến ngày mai.</h2><p>Học theo từng ngày, luyện tập đúng trọng tâm và biến những từ mới thành vốn từ của riêng bạn.</p><div className="hero-actions"><Link className="button button-primary button-md" href="/learn"><GraduationCap size={18} />Bắt đầu học</Link><Link className="button button-secondary button-md" href="/quiz"><ClipboardCheck size={18} />Làm bài kiểm tra</Link></div></div><div className="hero-visual"><span className="hero-book"><BookOpen /></span></div></section><section className="grid grid-4 dashboard-stats" style={{ marginTop: 18 }}>{stats.map(({ label, value, icon: Icon }) => <Card className="stat-card" key={label}><div className="stat-top"><span>{label}</span><span className="stat-icon"><Icon size={18} /></span></div><strong>{value}</strong><p>Dữ liệu được tính từ Supabase</p></Card>)}</section><div className="section-header"><div><h2>Hành trình học tập</h2><p>Khám phá các bộ từ theo ngày học.</p></div><Link href="/vocabulary" className="button button-ghost button-sm">Xem tất cả <ArrowRight size={15} /></Link></div>{dayList.length ? <div className="grid grid-3 journey-grid">{dayList.slice(0, 6).map((day) => <Link key={day.id} href="/vocabulary"><Card className="day-card"><div className="day-card-top"><span className="badge">BỘ TỪ VỰNG</span><span className="day-number">{String(day.day_number).padStart(2, "0")}</span></div><h3>{day.title}</h3><p>{wordList.filter((word) => (word.dayIds ?? []).includes(day.id)).length} từ vựng · {day.study_date ?? "Chưa đặt ngày"}</p></Card></Link>)}</div> : <EmptyState title="Chưa có ngày học" description="Nội dung do quản trị viên quản lý. Vào trang quản trị để thêm ngày học đầu tiên." />}<div className="section-header"><div><h2>Một vài từ dành cho bạn</h2><p>Ôn nhanh những từ đang có trong thư viện.</p></div></div>{wordList.length ? <div className="grid grid-3 word-grid">{wordList.slice(0, 3).map((word) => <WordCard key={word.id} word={word} days={dayList} />)}</div> : <EmptyState title="Chưa có từ vựng" description="Khi quản trị viên thêm từ, nội dung sẽ xuất hiện tại đây ngay sau khi làm mới." />}</>;
}
