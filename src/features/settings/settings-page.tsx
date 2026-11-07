"use client";

import { ConfigurationRequired } from "@/app/_components/configuration-required";
import { PageHeader } from "@/app/_components/page-header";
import { BackupSettings } from "@/app/(features)/settings/_components/backup-settings";
import { RecoverySettings } from "@/app/(features)/settings/_components/recovery-settings";
import { StudyPreferences } from "@/app/(features)/settings/_components/study-preferences";
import { useAuthSession } from "@/hooks/use-auth-session";
import { useImportBackup } from "@/hooks/use-backup";
import { useSettings, useSaveSettings } from "@/hooks/use-settings";
import { useStudyDays } from "@/hooks/use-study-days";
import { useStudySessions } from "@/hooks/use-study-sessions";
import { useVocabularies } from "@/hooks/use-vocabularies";
import { useWordProgress } from "@/hooks/use-word-progress";
import { isSupabaseConfigured } from "@/lib/supabase/client";

export function SettingsPage() {
  const configured = isSupabaseConfigured(); const auth = useAuthSession(); const ready = configured && auth.isSuccess;
  const settings = useSettings(auth.data); const save = useSaveSettings(auth.data); const progress = useWordProgress(auth.data); const sessions = useStudySessions(auth.data); const days = useStudyDays(ready); const words = useVocabularies(ready); const importer = useImportBackup(auth.data);
  const exportJson = () => { const backup = { version: 1, exportedAt: new Date().toISOString(), days: days.data ?? [], words: words.data ?? [], progress: progress.data ?? [], sessions: sessions.data ?? [], settings: settings.data }; const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" }); const url = URL.createObjectURL(blob); const anchor = document.createElement("a"); anchor.href = url; anchor.download = `nqt-vocabulary-${new Date().toLocaleDateString("sv-SE")}.json`; anchor.click(); URL.revokeObjectURL(url); };
  return <><PageHeader eyebrow="CÁ NHÂN" title="Cài đặt" description="Điều chỉnh nhịp học, quản lý khôi phục và sao lưu dữ liệu của bạn." />{!configured ? <ConfigurationRequired /> : auth.isPending || settings.isPending ? <p>Đang tải cài đặt...</p> : auth.error || settings.error ? <div className="error-banner">Không thể tải cài đặt.</div> : <div className="settings-grid"><StudyPreferences settings={settings.data} saving={save.isPending} onSave={save.mutateAsync} /><RecoverySettings /><BackupSettings onExport={exportJson} onImport={(input) => importer.mutateAsync(input).then(() => undefined)} importing={importer.isPending} /><div className="settings-card card"><h2>Dữ liệu và quyền riêng tư</h2><p>Supabase là nguồn dữ liệu chính. Mỗi người học chỉ đọc và sửa tiến độ, lịch sử, cài đặt của UID mình. Chỉ quản trị viên được cấp quyền mới có thể sửa nội dung học.</p><span className="badge">{auth.data ? `UID: ${auth.data.slice(0, 8)}…` : "Chưa có phiên"}</span></div></div>}</>;
}
