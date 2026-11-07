"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getCurrentAuthUser,
  linkRecoveryEmail,
  sendRecoverySignInLink,
} from "@/services/auth.service";

export function useCurrentAuthUser() {
  return useQuery({
    queryKey: ["auth", "user"],
    queryFn: getCurrentAuthUser,
  });
}

export function useLinkRecoveryEmail() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: linkRecoveryEmail,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["auth", "user"] }),
  });
}

export function useRecoverySignIn() {
  return useMutation({ mutationFn: sendRecoverySignInLink });
}
