"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { importLearnerBackup } from "@/services/backup.service";

export function useImportBackup(userId?: string) {
  const client = useQueryClient();
  return useMutation({ mutationFn: (input: unknown) => { if (!userId) throw new Error("Chưa có phiên người học."); return importLearnerBackup(userId, input); }, onSuccess: async () => { await Promise.all([client.invalidateQueries({ queryKey: ["progress", userId] }), client.invalidateQueries({ queryKey: ["settings", userId] })]); } });
}
