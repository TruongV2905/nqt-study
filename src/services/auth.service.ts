import { requireSupabaseClient } from "@/lib/supabase/client";

let sessionInitialization: Promise<string> | null = null;

function normalizeEmail(email: string) {
  return email.trim();
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
  if (error) throw error;
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
  if (error) throw error;
}
