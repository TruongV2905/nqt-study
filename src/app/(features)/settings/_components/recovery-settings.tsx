"use client";

import { useState, type FormEvent } from "react";
import { CheckCircle2, KeyRound, Link2, MailCheck, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  useCurrentAuthUser,
  useLinkRecoveryEmail,
  useRecoverySignIn,
} from "@/hooks/use-recovery-email";

type RecoveryMode = "recover" | "link";

export function RecoverySettings() {
  const [mode, setMode] = useState<RecoveryMode>("recover");
  const [email, setEmail] = useState("");
  const [sentTo, setSentTo] = useState("");
  const currentUser = useCurrentAuthUser();
  const linkEmail = useLinkRecoveryEmail();
  const recoverySignIn = useRecoverySignIn();
  const mutation = mode === "recover" ? recoverySignIn : linkEmail;
  const account = currentUser.data;
  const hasVerifiedEmail = Boolean(account?.email && account.email_confirmed_at);

  const changeMode = (nextMode: RecoveryMode) => {
    setMode(nextMode);
    setEmail("");
    setSentTo("");
    linkEmail.reset();
    recoverySignIn.reset();
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalizedEmail = email.trim();
    if (!normalizedEmail) return;

    const redirectTo = `${window.location.origin}/settings`;
    try {
      if (mode === "recover") {
        await recoverySignIn.mutateAsync({ email: normalizedEmail, redirectTo });
        setSentTo(normalizedEmail);
        toast.success("Đã gửi liên kết khôi phục. Hãy kiểm tra hộp thư của bạn.");
      } else {
        await linkEmail.mutateAsync({ email: normalizedEmail, redirectTo });
        setSentTo(normalizedEmail);
        toast.success("Đã gửi email xác minh cho UID hiện tại.");
      }
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : mode === "recover"
            ? "Không thể gửi liên kết khôi phục."
            : "Không thể liên kết email."
      );
    }
  };

  return (
    <div className="settings-card recovery-card card">
      <div className="recovery-heading">
        <span className="recovery-heading-icon"><ShieldCheck size={20} /></span>
        <div>
          <h2>Tài khoản và khôi phục</h2>
          <p>Dùng email để trở lại đúng UID và lấy lại tiến độ đã lưu trên Supabase.</p>
        </div>
      </div>

      <div className="account-status" aria-live="polite">
        <span className={`account-status-icon${hasVerifiedEmail ? " verified" : ""}`}>
          {hasVerifiedEmail ? <CheckCircle2 size={18} /> : <KeyRound size={18} />}
        </span>
        <div>
          <strong>{currentUser.isPending ? "Đang kiểm tra tài khoản…" : hasVerifiedEmail ? account?.email : "Phiên ẩn danh hiện tại"}</strong>
          <small>{account ? `UID ${account.id.slice(0, 8)}…` : "Chưa xác định UID"}</small>
        </div>
        {!currentUser.isPending ? <span className={`account-status-badge${hasVerifiedEmail ? " verified" : ""}`}>{hasVerifiedEmail ? "Đã bảo vệ" : "Chưa liên kết"}</span> : null}
      </div>

      <div className="recovery-tabs" role="tablist" aria-label="Phương thức khôi phục tài khoản">
        <button className={mode === "recover" ? "active" : ""} type="button" role="tab" aria-selected={mode === "recover"} onClick={() => changeMode("recover")}>
          <MailCheck size={16} /> Khôi phục dữ liệu
        </button>
        <button className={mode === "link" ? "active" : ""} type="button" role="tab" aria-selected={mode === "link"} onClick={() => changeMode("link")}>
          <Link2 size={16} /> Liên kết UID này
        </button>
      </div>

      {mode === "link" && hasVerifiedEmail ? (
        <div className="recovery-success" role="status">
          <CheckCircle2 size={19} />
          <div><strong>UID này đã được bảo vệ</strong><span>Bạn có thể dùng {account?.email} để khôi phục trên trình duyệt hoặc thiết bị khác.</span></div>
        </div>
      ) : sentTo ? (
        <div className="recovery-success" role="status">
          <MailCheck size={19} />
          <div>
            <strong>{mode === "recover" ? "Kiểm tra hộp thư của bạn" : "Xác minh email để hoàn tất"}</strong>
            <span>Đã gửi tới {sentTo}. {mode === "recover" ? "Mở Magic Link để trở lại UID cũ." : "UID chỉ được bảo vệ sau khi bạn bấm liên kết xác minh."}</span>
          </div>
        </div>
      ) : (
        <form className="recovery-form" onSubmit={(event) => void submit(event)}>
          <p className="recovery-mode-copy">
            {mode === "recover"
              ? "Đã từng liên kết email? Nhận Magic Link để đăng nhập lại tài khoản cũ. Dữ liệu của UID hiện tại sẽ không bị ghi đè."
              : "Gắn email với UID đang dùng để không mất tiến độ khi xóa dữ liệu trình duyệt."}
          </p>
          <div className="field">
            <label htmlFor={`recovery-email-${mode}`}>{mode === "recover" ? "Email đã liên kết" : "Email bảo vệ UID này"}</label>
            <Input
              id={`recovery-email-${mode}`}
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="ban@example.com"
            />
          </div>
          <Button type="submit" disabled={!email.trim() || mutation.isPending}>
            {mutation.isPending ? "Đang gửi…" : mode === "recover" ? "Gửi Magic Link" : "Gửi email xác minh"}
          </Button>
          <p className="recovery-security-note"><ShieldCheck size={14} /> Luồng khôi phục không tạo tài khoản mới nếu email không tồn tại.</p>
        </form>
      )}
    </div>
  );
}
