"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createStudyDay, deleteStudyDay, getStudyDays, updateStudyDay } from "@/services/study-day.service";
import type { StudyDayFormValues } from "@/schemas/study-day.schema";

export function useStudyDays(enabled = true) { return useQuery({ queryKey: ["study-days"], queryFn: getStudyDays, enabled }); }
export function useStudyDayMutations() {
  const client = useQueryClient();
  const refresh = () => client.invalidateQueries({ queryKey: ["study-days"] });
  return {
    createDay: useMutation({ mutationFn: createStudyDay, onSuccess: refresh }),
    updateDay: useMutation({ mutationFn: ({ id, values }: { id: string; values: StudyDayFormValues }) => updateStudyDay(id, values), onSuccess: refresh }),
    deleteDay: useMutation({ mutationFn: deleteStudyDay, onSuccess: refresh }),
  };
}
