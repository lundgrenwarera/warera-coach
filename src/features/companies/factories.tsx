import { ArrowUp, Plus, TrendingUp, TriangleAlert } from "lucide-react";
import { flagUrl } from "@/api/warera/country";
import type { Factory, GameRules, PlayerProfile } from "@/api/warera/types";
import { factoryCapFor } from "@/api/warera/types";
import { getPlaybook, PLAYBOOKS, type PlaybookStep } from "@/core/playbook";
import { ItemIcon, Money } from "@/shared/components/item-display";
import { LinkedHeading } from "@/shared/components/linked-heading";
import { PanelHelp } from "@/shared/components/panel-help";
import { factoryUrl } from "@/shared/lib/item-meta";
import { itemLabel } from "@/shared/lib/items";
import { cn } from "@/shared/lib/utils";
import { phaseTargetAE } from "./targets";

function storageCap(rules: GameRules, level: number): number {
  return rules.storage.find((s) => s.level === level)?.value ?? 0;
}

function dailyOutput(rules: GameRules, f: Factory): number {
  const points = rules.items[f.item]?.productionPoints ?? 1;
  const dailyProd = rules.ae.find((a) => a.level === f.ae)?.dailyProd ?? 0;
  return dailyProd / points;
}

function RegionLine({ region }: { region: NonNullable<Factory["region"]> }) {
  const flag = flagUrl(region.countryCode);
  return (
    <div className="text-muted-foreground mb-0.5 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[11px]">
      {flag && <img src={flag} alt="" className="h-3 w-4 rounded-[1px] object-cover" />}
      <span>{region.name}</span>
      {region.terrain && <span className="capitalize opacity-70">· {region.terrain}</span>}
      {region.tax != null && <span className="opacity-70">· {region.tax}% tax</span>}
    </div>
  );
}

function AeBadge({ ae, target, behind }: { ae: number; target: number; behind: boolean }) {
  if (!behind) {
    return <span className="text-chart-2 shrink-0 text-xs font-medium tabular-nums">AE {ae}</span>;
  }
  return (
    <span className="shrink-0 text-xs font-medium tabular-nums">
      <span className="text-muted-foreground">AE {ae}</span>
      <span className="text-primary"> → {target}</span>
    </span>
  );
}

interface ActionLine {
  text: string;
  tone: "primary" | "destructive";
  alert: boolean;
}

function factoryAction(convertTo: string | null, behind: boolean, full: boolean, targetAE: number): ActionLine | null {
  if (convertTo) return { text: `Wrong product, convert to ${itemLabel(convertTo)}`, tone: "destructive", alert: true };
  if (full) return { text: "Storage full, upgrade storage", tone: "destructive", alert: true };
  if (behind) return { text: `Upgrade to AE${targetAE}`, tone: "primary", alert: false };
  return null;
}

function cardTone(isNext: boolean, action: ActionLine | null): string {
  if (action?.tone === "destructive") return "border-destructive/60 bg-destructive/5 hover:border-destructive";
  if (isNext) return "border-primary/50 bg-primary/5 hover:border-primary";
  return "border-border/60 hover:border-foreground/30";
}

function FactoryRow({
  f,
  targetAE,
  cap,
  perDay,
  isNext,
  convertTo,
  markTour,
}: {
  f: Factory;
  targetAE: number;
  cap: number;
  perDay: number;
  isNext: boolean;
  convertTo: string | null;
  markTour?: boolean;
}) {
  const behind = f.ae < targetAE;
  const fill = cap > 0 ? Math.min(100, (f.stock / cap) * 100) : 0;
  const full = fill >= 90;
  const action = factoryAction(convertTo, behind, full, targetAE);
  return (
    <li>
      <a
        href={factoryUrl(f.id)}
        target="_blank"
        rel="noreferrer"
        data-tour={markTour ? "companies-card" : undefined}
        className={cn("block rounded-lg border p-2.5 transition-colors", cardTone(isNext, action))}
      >
        <div className="flex items-start gap-2.5">
          <div className="min-w-0 flex-1">
            {f.region && <RegionLine region={f.region} />}
            <div className="flex items-center gap-1.5">
              <ItemIcon code={f.item} size={18} />
              <span className="truncate text-sm font-medium">{f.name}</span>
            </div>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-0.5">
            <AeBadge ae={f.ae} target={targetAE} behind={behind} />
            {f.estimatedValue > 0 && (
              <span className="text-muted-foreground text-[11px]">
                <Money value={f.estimatedValue} />
              </span>
            )}
          </div>
        </div>
        <div className="mt-2 flex items-center gap-2">
          <div className="bg-muted h-1.5 flex-1 overflow-hidden rounded-full">
            <div
              className={cn("h-full rounded-full", full ? "bg-destructive" : "bg-chart-2/70")}
              style={{ width: `${fill}%` }}
            />
          </div>
          <span className="text-muted-foreground shrink-0 text-[11px] tabular-nums">
            {Math.round(f.stock)}/{cap}
          </span>
          <span className="text-muted-foreground inline-flex shrink-0 items-center gap-0.5 text-[11px] tabular-nums">
            <TrendingUp className="size-3" />
            {perDay.toFixed(1)}/day
          </span>
        </div>
        {action && (
          <div
            className={cn(
              "mt-2 flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium",
              action.tone === "destructive" ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary",
            )}
          >
            {action.alert ? <TriangleAlert className="size-3.5 shrink-0" /> : <ArrowUp className="size-3.5 shrink-0" />}
            {action.text}
          </div>
        )}
      </a>
    </li>
  );
}

function BuildRow({ item, n }: { item: string | null; n: number }) {
  return (
    <li className="border-primary/50 bg-primary/5 flex min-h-[4.75rem] items-center gap-2.5 rounded-lg border border-dashed p-2.5">
      <div className="border-primary/40 flex size-9 shrink-0 items-center justify-center rounded-md border border-dashed">
        {item ? <ItemIcon code={item} size={22} /> : <Plus className="text-primary size-4" />}
      </div>
      <div className="min-w-0">
        <p className="text-primary text-sm font-medium">
          Build company #{n}
          {item ? ` · ${itemLabel(item)}` : ""}
        </p>
        <p className="text-muted-foreground text-[11px]">Build it as soon as you can afford the materials.</p>
      </div>
    </li>
  );
}

function GhostCompany({ n }: { n: number }) {
  return (
    <li className="border-border/70 flex min-h-[4.75rem] items-center gap-2.5 rounded-lg border border-dashed p-2.5">
      <div className="border-border text-muted-foreground flex size-9 shrink-0 items-center justify-center rounded-md border border-dashed">
        <Plus className="size-4" />
      </div>
      <div className="min-w-0">
        <p className="text-foreground/80 text-sm font-medium">Room for company #{n}</p>
        <p className="text-muted-foreground text-[11px]">
          You have an open slot. Build it once you can afford the materials.
        </p>
      </div>
    </li>
  );
}

export function Factories({ profile, rules, step }: { profile: PlayerProfile; rules: GameRules; step: PlaybookStep }) {
  const playbook = getPlaybook(PLAYBOOKS[0].id);
  const targetAE = phaseTargetAE(profile.factories, playbook.ladder);
  const cap = factoryCapFor(rules, profile.skills.companies);
  const nextActionId = step.factoryId;
  const buildNext = step.action === "build";
  const convertItemTarget = step.action === "convert" ? step.suggestedItem : null;
  const count = profile.factories.length;
  const showGhost = !buildNext && count > 0 && count < cap;

  return (
    <section data-tour="companies" className="bg-card rounded-xl border p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2>
          <LinkedHeading title="Companies" href="https://app.warera.io/companies" dataTour="companies-title" />
        </h2>
        <PanelHelp
          title="Companies"
          sources={[{ label: "War Era Wiki: Company", href: "https://warera.wiki/company" }]}
        >
          <p>
            Companies produce items and are your main source of income. You start with one free company; each extra one
            costs Concrete, and the price climbs with every company you already own.
          </p>
          <p>
            Two parts upgrade with Steel: the <span className="text-foreground font-medium">Automated Engine</span>{" "}
            makes production points (PP) on its own every hour, up to 7 PP/h, and{" "}
            <span className="text-foreground font-medium">Storage</span> holds them, up to 1400. When storage is full it
            stops producing until you hit Produce.
          </p>
          <p>
            Make more PP by self-working (uses Entrepreneurship) or hiring workers (uses their Energy). Hit Produce to
            turn stored PP and raw materials into items.
          </p>
          <p>
            Location matters: a region with a matching resource deposit gives +30% production, and countries add their
            own bonus. Moving a company costs 5 Concrete.
          </p>
        </PanelHelp>
      </div>

      {count === 0 && !buildNext && <p className="text-muted-foreground text-sm">No companies yet.</p>}

      <ul className="space-y-2">
        {profile.factories.map((f, i) => (
          <FactoryRow
            key={f.id}
            f={f}
            targetAE={targetAE}
            cap={storageCap(rules, f.storage)}
            perDay={dailyOutput(rules, f)}
            isNext={f.id === nextActionId}
            convertTo={f.id === nextActionId ? convertItemTarget : null}
            markTour={i === 0}
          />
        ))}
        {buildNext && <BuildRow item={step.suggestedItem} n={count + 1} />}
        {showGhost && <GhostCompany n={count + 1} />}
      </ul>
    </section>
  );
}
