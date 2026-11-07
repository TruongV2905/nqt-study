"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getSettings, saveSettings } from "@/services/settings.service";
import type { SettingsValues } from "@/schemas/settings.schema";

export function useSettings(userId?: string) { return useQuery({ queryKey: ["settings", userId], queryFn: () => getSettings(userId ?? ""), enabled: Boolean(userId) }); }
export function useSaveSettings(userId?: string) {
  const client = useQueryClient();
  return useMutation({ mutationFn: (values: SettingsValues) => { if (!userId) throw new Error("Chưa có phiên người học."); return saveSettings(userId, values); }, onSuccess: () => client.invalidateQueries({ queryKey: ["settings", userId] }) });
}
