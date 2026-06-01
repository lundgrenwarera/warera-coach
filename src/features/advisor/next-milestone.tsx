import type { GoalPlan } from "@/core/engine/engine";
import type { PlaybookStep } from "@/core/playbook";
import { ItemIcon } from "@/shared/components/item-display";
import { cn } from "@/shared/lib/utils";

export function MilestoneBar({ step, goal }: { step: PlaybookStep; goal: GoalPlan | null }) {
  const skillGated = step.action === "skill";
  const need = skillGated ? null : (goal?.needs[0] ?? null);
  const label = skillGated ? step.description : (goal?.title ?? step.description);
  const ready = need ? need.gap <= 0 : false;
  const pct = need && need.need > 0 ? Math.min(100, (need.have / need.need) * 100) : 0;

  return (
    <section
      data-tour="milestone"
      className="bg-card flex h-full items-center gap-3 rounded-xl border px-4 py-1.5 text-xs"
    >
      <span className="label shrink-0">Next</span>
      <span className="font-medium">{label}</span>
      {need && (
        <>
          <div className="bg-muted h-1.5 min-w-12 flex-1 overflow-hidden rounded-full">
            <div
              className={cn("h-full rounded-full transition-all", ready ? "bg-chart-2" : "bg-primary")}
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className="text-muted-foreground inline-flex shrink-0 items-center gap-1 tabular-nums">
            <ItemIcon code={need.item} size={14} />
            {Math.round(need.have)}/{Math.round(need.need)}
          </span>
        </>
      )}
    </section>
  );
}
