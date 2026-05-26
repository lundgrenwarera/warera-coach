import { useEffect, useState } from "react";
import { cn } from "../lib/cn";
import { isDoneToday, toggleDone } from "../lib/daily";
import type { DailyAction } from "../lib/plan";

export function DailyChecklist({ actions }: { actions: DailyAction[] }) {
  const [, force] = useState(0);

  useEffect(() => {
    function onVisible() {
      if (document.visibilityState === "visible") force((n) => n + 1);
    }
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, []);

  if (actions.length === 0) return null;

  return (
    <ul className="space-y-2">
      {actions.map((a) => (
        <DailyRow key={a.id} action={a} onChange={() => force((n) => n + 1)} />
      ))}
    </ul>
  );
}

function DailyRow({ action, onChange }: { action: DailyAction; onChange: () => void }) {
  const done = isDoneToday(action.id);

  function flip() {
    toggleDone(action.id, !done);
    onChange();
  }

  return (
    <li className="flex items-start gap-3 rounded border border-border bg-surface/40 p-3 sm:p-4">
      <button
        type="button"
        onClick={flip}
        aria-pressed={done}
        aria-label={done ? "Mark not done" : "Mark done"}
        className={cn(
          "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-sm border",
          done && "border-ok bg-ok/15 text-ok",
          !done && "border-border bg-bg-subtle text-transparent hover:border-accent",
        )}
      >
        {done ? "✓" : ""}
      </button>
      <div className="min-w-0 flex-1">
        <div className={cn("text-sm", done ? "text-text-faint line-through" : "text-text")}>
          {action.title}
        </div>
        <p className="mt-1 text-xs leading-relaxed text-text-muted">{action.detail}</p>
        <a
          href={action.source.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1 inline-block font-mono text-[10px] uppercase tracking-wider text-text-faint hover:text-accent"
        >
          source: {action.source.title} ↗
        </a>
      </div>
    </li>
  );
}
