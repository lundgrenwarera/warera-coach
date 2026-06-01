import { RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/shared/lib/utils";

function rel(ts: number): string {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 10) return "just now";
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  return `${Math.floor(m / 60)}h ago`;
}

export function RefreshIndicator({
  updatedAt,
  isFetching,
  onRefresh,
}: {
  updatedAt: number;
  isFetching: boolean;
  onRefresh?: () => void;
}) {
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((n) => n + 1), 15_000);
    return () => clearInterval(id);
  }, []);

  return (
    <button
      type="button"
      onClick={onRefresh}
      disabled={isFetching}
      title="Refresh now"
      className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-xs transition-colors disabled:opacity-70"
    >
      <RefreshCw className={cn("size-3", isFetching && "animate-spin")} />
      {isFetching ? "updating…" : updatedAt ? `updated ${rel(updatedAt)}` : "—"}
    </button>
  );
}
