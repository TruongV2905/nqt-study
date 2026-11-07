"use client";

import { useEffect, useState } from "react";

export function useStudyTimer(deadline: number | null, onExpire: () => void) {
  const [remainingSeconds, setRemainingSeconds] = useState(() => deadline ? Math.max(0, Math.ceil((deadline - Date.now()) / 1000)) : 0);
  useEffect(() => {
    if (!deadline) return;
    const tick = () => {
      const remaining = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
      setRemainingSeconds(remaining);
      if (remaining === 0) onExpire();
    };
    tick();
    const timer = window.setInterval(tick, 500);
    return () => window.clearInterval(timer);
  }, [deadline, onExpire]);
  return remainingSeconds;
}
