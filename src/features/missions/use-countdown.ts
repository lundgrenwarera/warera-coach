import { useEffect, useRef, useState } from "react";

export interface Countdown {
  remaining: number;
  elapsed: boolean;
  label: string;
}

function format(ms: number): string {
  const s = Math.floor(ms / 1000);
  const days = Math.floor(s / 86400);
  const hours = Math.floor((s % 86400) / 3600);
  const mins = Math.floor((s % 3600) / 60);
  const secs = s % 60;
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${mins}m`;
  if (mins > 0) return `${mins}m ${secs}s`;
  return `${secs}s`;
}

export function useCountdown(target: string | null, onElapsed?: () => void): Countdown {
  const [now, setNow] = useState(() => Date.now());
  const firedFor = useRef<string | null>(null);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const remaining = target ? new Date(target).getTime() - now : 0;
  const elapsed = Boolean(target) && remaining <= 0;

  useEffect(() => {
    if (elapsed && target && onElapsed && firedFor.current !== target) {
      firedFor.current = target;
      onElapsed();
    }
  }, [elapsed, target, onElapsed]);

  if (!target) return { remaining: 0, elapsed: false, label: "" };
  return { remaining: Math.max(0, remaining), elapsed, label: format(Math.max(0, remaining)) };
}
