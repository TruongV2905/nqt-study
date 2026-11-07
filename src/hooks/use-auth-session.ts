"use client";

import { useQuery } from "@tanstack/react-query";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { ensureLearnerSession } from "@/services/auth.service";

export function useAuthSession() {
  return useQuery({ queryKey: ["auth", "session"], queryFn: ensureLearnerSession, enabled: isSupabaseConfigured(), staleTime: Number.POSITIVE_INFINITY, retry: 1 });
}
