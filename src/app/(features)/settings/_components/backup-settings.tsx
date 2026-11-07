"use client";

import { useRef } from "react";
import { Download, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function BackupSettings({ onExport, onImport, importing }: { onExport: () => void; onImport: (input: unknown) => Promise<void>; importing: boolean }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const read = async (file?: File) => { if (!file) return; try { const input: unknown = JSON.parse(await file.text()); await onImport(input); toast.success("Đã nhập tiến độ và cài đặt."); } catch (error) { toast.error(error instanceof Error ? error.message : "Tệp sao lưu không hợp lệ."); } finally { if (fileRef.current) fileRef.current.value = ""; } };
  return <div className="settings-card card"><h2>Sao lưu dữ liệu</h2><p>Xuất bản sao tham khảo gồm nội dung và dữ liệu cá nhân. Khi nhập, chỉ tiến độ và cài đặt của tài khoản hiện tại được ghi; nội dung học không bị chỉnh sửa.</p><div style={{ display: "flex", flexWrap: "wrap", gap: 9 }}><Button variant="secondary" onClick={onExport}><Download size={17} />Xuất JSON</Button><Button variant="secondary" disabled={importing} onClick={() => fileRef.current?.click()}><Upload size={17} />{importing ? "Đang nhập..." : "Nhập JSON"}</Button><input ref={fileRef} hidden type="file" accept="application/json,.json" onChange={(event) => void read(event.target.files?.[0])} /></div></div>;
}
