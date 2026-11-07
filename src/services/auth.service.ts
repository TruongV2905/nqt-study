import { requireSupabaseClient } from "@/lib/supabase/client";

let sessionInitialization: Promise<string> | null = null;

function normalizeEmail(email: string) {
  return email.trim();
}

function throwAuthError(error: { code?: string; status?: number; message: string } | null) {
  if (!error) return;
  if (error.code === "over_email_send_rate_limit") {
    throw new Error("Supabase đã hết hạn mức gửi email. Hãy dùng email gần nhất, chờ tối đa 1 giờ hoặc cấu hình Custom SMTP cho production.");
  }
  if (error.code === "over_request_rate_limit" || error.status === 429) {
    throw new Error("Bạn đã gửi quá nhiều yêu cầu. Hãy chờ vài phút rồi thử lại.");
  }
  if (error.code === "email_address_not_authorized") {
    throw new Error("Dịch vụ email mặc định của Supabase không cho phép gửi tới địa chỉ này. Hãy cấu hình Custom SMTP.");
  }
  throw error;
}

export function syncLearnerSession(userId?: string) {
  sessionInitialization = userId ? Promise.resolve(userId) : null;
}

export function ensureLearnerSession() {
  if (sessionInitialization) return sessionInitialization;
  sessionInitialization = (async () => {
    const supabase = requireSupabaseClient();
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) throw sessionError;
    if (sessionData.session?.user.id) return sessionData.session.user.id;
    const { data, error } = await supabase.auth.signInAnonymously();
    if (error) throw error;
    if (!data.user) throw new Error("Supabase không trả về phiên người học.");
    return data.user.id;
  })().catch((error: unknown) => {
    sessionInitialization = null;
    throw error;
  });
  return sessionInitialization;
}

export async function getCurrentAuthUser() {
  const { data, error } = await requireSupabaseClient().auth.getUser();
  if (error) throw error;
  if (!data.user) throw new Error("Không tìm thấy tài khoản hiện tại.");
  return data.user;
}

export async function linkRecoveryEmail({ email, redirectTo }: { email: string; redirectTo: string }) {
  const { data, error } = await requireSupabaseClient().auth.updateUser(
    { email: normalizeEmail(email) },
    { emailRedirectTo: redirectTo }
  );
  throwAuthError(error);
  return data.user;
}

export async function sendRecoverySignInLink({ email, redirectTo }: { email: string; redirectTo: string }) {
  const { error } = await requireSupabaseClient().auth.signInWithOtp({
    email: normalizeEmail(email),
    options: {
      shouldCreateUser: false,
      emailRedirectTo: redirectTo,
    },
  });
  throwAuthError(error);
}
