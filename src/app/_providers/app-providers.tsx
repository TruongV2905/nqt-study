"use client";

import { useEffect, useState, type ReactNode } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { createQueryClient } from "@/lib/query-client";
import { getSupabaseClient } from "@/lib/supabase/client";
import { syncLearnerSession } from "@/services/auth.service";

export function AppProviders({ children }: { children: ReactNode }) {
  const [queryClient] = useState(createQueryClient);

  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      const userId = session?.user.id;
      syncLearnerSession(userId);

      if (!userId) {
        queryClient.removeQueries({ queryKey: ["auth", "session"], exact: true });
        void queryClient.invalidateQueries({ queryKey: ["auth", "session"], exact: true });
        return;
      }

      const previousUserId = queryClient.getQueryData<string>(["auth", "session"]);
      queryClient.setQueryData(["auth", "session"], userId);
      queryClient.setQueryData(["auth", "user"], session.user);

      if (previousUserId && previousUserId !== userId) {
        void Promise.all([
          queryClient.invalidateQueries({ queryKey: ["settings", userId], exact: true }),
          queryClient.invalidateQueries({ queryKey: ["progress", userId], exact: true }),
          queryClient.invalidateQueries({ queryKey: ["study-sessions", userId], exact: true }),
        ]);
      }
    });

    return () => data.subscription.unsubscribe();
  }, [queryClient]);

  return <QueryClientProvider client={queryClient}>{children}<Toaster richColors position="top-right" /></QueryClientProvider>;
}
