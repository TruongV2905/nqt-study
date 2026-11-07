"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { applyWordProgress, getWordProgress } from "@/services/progress.service";

export function useWordProgress(userId?: string) { return useQuery({ queryKey: ["progress", userId], queryFn: () => getWordProgress(userId ?? ""), enabled: Boolean(userId) }); }
export function useApplyWordProgress(userId?: string) {
  const client = useQueryClient();
  return useMutation({ mutationFn: ({ vocabularyId, isCorrect }: { vocabularyId: string; isCorrect: boolean }) => applyWordProgress(vocabularyId, isCorrect), onSuccess: () => client.invalidateQueries({ queryKey: ["progress", userId] }) });
}
