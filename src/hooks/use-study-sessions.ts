"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getStudySessions, saveStudySession, type NewStudySession } from "@/services/study-session.service";

export function useStudySessions(userId?: string) { return useQuery({ queryKey: ["study-sessions", userId], queryFn: () => getStudySessions(userId ?? ""), enabled: Boolean(userId) }); }
export function useSaveStudySession(userId?: string) {
  const client = useQueryClient();
  return useMutation({ mutationFn: (session: NewStudySession) => { if (!userId) throw new Error("Chưa có phiên người học."); return saveStudySession(userId, session); }, onSuccess: () => client.invalidateQueries({ queryKey: ["study-sessions", userId] }) });
}
