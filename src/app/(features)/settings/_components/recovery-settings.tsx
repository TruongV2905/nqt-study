"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRecoveryEmail } from "@/hooks/use-recovery-email";

export function RecoverySettings() {
  const [email, setEmail] = useState("");
  const mutation = useRecoveryEmail();
  const submit = async () => { try { await mutation.mutateAsync(email); toast.success("Đã gửi email xác minh khôi phục."); setEmail(""); } catch (error) { toast.error(error instanceof Error ? error.message : "Không thể liên kết email."); } };
  return <div className="settings-card card"><h2>Khôi phục bằng email</h2><p>Liên kết email với UID hiện tại để có thể khôi phục đúng tiến độ. Xóa dữ liệu trình duyệt trước khi liên kết có thể làm mất đường khôi phục.</p><div className="field"><label htmlFor="recovery-email">Email khôi phục</label><Input id="recovery-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="ban@example.com" /></div><Button disabled={!email || mutation.isPending} onClick={() => void submit()}>{mutation.isPending ? "Đang gửi..." : "Gửi email xác minh"}</Button></div>;
}
