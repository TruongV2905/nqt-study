"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createVocabulary, deleteVocabulary, getVocabularies, updateVocabulary } from "@/services/vocabulary.service";
import type { VocabularyFormValues } from "@/schemas/vocabulary.schema";

export function useVocabularies(enabled = true) { return useQuery({ queryKey: ["vocabularies"], queryFn: getVocabularies, enabled }); }
export function useVocabularyMutations() {
  const client = useQueryClient();
  const refresh = () => client.invalidateQueries({ queryKey: ["vocabularies"] });
  return {
    createWord: useMutation({ mutationFn: createVocabulary, onSuccess: refresh }),
    updateWord: useMutation({ mutationFn: ({ id, values }: { id: string; values: VocabularyFormValues }) => updateVocabulary(id, values), onSuccess: refresh }),
    deleteWord: useMutation({ mutationFn: deleteVocabulary, onSuccess: refresh }),
  };
}
