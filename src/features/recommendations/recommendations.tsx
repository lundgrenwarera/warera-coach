import type { Tip } from "@/core/playbook";
import { ItemIcon, Money, MoneyText } from "@/shared/components/item-display";
import { itemLabel } from "@/shared/lib/items";
import { cn } from "@/shared/lib/utils";

const DOT: Record<Tip["severity"], string> = {
  warn: "bg-destructive",
  suggest: "bg-primary",
  info: "bg-sky-400",
};

const LEGEND: { severity: Tip["severity"]; label: string }[] = [
  { severity: "warn", label: "urgent" },
  { severity: "suggest", label: "suggested" },
  { severity: "info", label: "info" },
];

function UrgencyLegend() {
  return (
    <div className="text-muted-foreground mb-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px]">
      {LEGEND.map((l) => (
        <span key={l.severity} className="inline-flex items-center gap-1.5">
          <span className={cn("size-2 rounded-full", DOT[l.severity])} />
          {l.label}
        </span>
      ))}
    </div>
  );
}

export function Recommendations({ tips }: { tips: Tip[] }) {
  return (
    <section data-tour="recommendations" className="bg-card flex h-full flex-col rounded-xl border p-4">
      <h2 className="bracket-heading mb-3 text-sm">Recommendations</h2>
      <UrgencyLegend />
      {tips.length === 0 && <p className="text-muted-foreground text-sm">No actions at the moment.</p>}
      <ul className="min-h-0 flex-1 space-y-2.5 overflow-y-auto">
        {tips.map((t) => (
          <li key={t.id} className="flex gap-2.5">
            <span className={cn("mt-1.5 size-2 shrink-0 rounded-full", DOT[t.severity])} />
            <div className="min-w-0">
              <p className="text-sm font-medium">
                <MoneyText>{t.title}</MoneyText>
              </p>
              <p className="text-muted-foreground text-xs">
                <MoneyText>{t.detail}</MoneyText>
              </p>
              {t.items && t.items.length > 0 && (
                <ul className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1">
                  {t.items.map((it) => (
                    <li key={it.code} className="inline-flex items-center gap-1.5 text-xs">
                      <ItemIcon code={it.code} size={16} />
                      <span className="font-medium">
                        {Math.round(it.qty)} {itemLabel(it.code)}
                      </span>
                      <span className="text-muted-foreground">
                        (<Money value={it.value} />)
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
