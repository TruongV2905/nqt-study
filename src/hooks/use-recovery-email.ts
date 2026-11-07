"use client";

import { useMutation } from "@tanstack/react-query";
import { linkRecoveryEmail } from "@/services/auth.service";

export function useRecoveryEmail() { return useMutation({ mutationFn: linkRecoveryEmail }); }
