import type {
  CoinPriority, DailyAction, EcoSkillKey, Factory, FactoryAction, LevelTarget,
  SkillAudit, SkillAuditRow,
} from "../lib/plan";
import { isBankLevel, LEVEL_PLAN, SOURCES, spDelta } from "../lib/plan";
import { cn } from "../lib/cn";
import { Panel } from "./Panel";
import { DailyChecklist } from "./DailyChecklist";

export type ReportData = {
  username: string;
  audit: SkillAudit;
  factories: Factory[];
  factoryAction: FactoryAction;
  daily: DailyAction[];
  coin: CoinPriority[];
};

export function PlanReport({ data, onReset, onRefresh }: { data: ReportData; onReset: () => void; onRefresh: () => void }) {
  const heroAction = data.daily[0];
  const restActions = data.daily.slice(1);
  const upcomingLevels = LEVEL_PLAN.filter((p) => p.level > data.audit.level).slice(0, 3);

  return (
    <div className="mx-auto w-full max-w-4xl space-y-4 px-3 py-4 sm:px-6 sm:py-8 sm:space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="label">War Era / Coach / Report</div>
          <h1 className="mt-1 bracket-heading text-base sm:text-lg text-text">
            {data.username} · level {data.audit.level}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onRefresh}
            className="rounded border border-border bg-surface px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider text-text-muted hover:border-accent hover:text-accent"
            title="Re-fetch your profile"
          >
            ↻ Refresh
          </button>
          <button
            type="button"
            onClick={onReset}
            className="rounded border border-border bg-surface px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider text-text-muted hover:border-accent hover:text-accent"
          >
            ← New search
          </button>
        </div>
      </header>

      {data.audit.level > 15 ? (
        <PastPlanBanner level={data.audit.level} />
      ) : (
        <>
          <StatusStrip audit={data.audit} factoryCount={data.factories.length} />

          {heroAction && <HeroAction action={heroAction} />}

          <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2">
            <SkillsCard audit={data.audit} />
            <FactoriesCard factories={data.factories} factoryAction={data.factoryAction} />
          </div>

          <Panel title="Daily checklist" subtitle="Resets at UTC midnight. Missions are your biggest leveling lever.">
            <DailyChecklist actions={restActions.length > 0 ? restActions : data.daily} />
          </Panel>

          <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2">
            <CoinCard coin={data.coin} />
            <UpNextCard current={data.audit.target} upcoming={upcomingLevels} />
          </div>

          <SourcesCard />
        </>
      )}
    </div>
  );
}

function StatusStrip({ audit, factoryCount }: { audit: SkillAudit; factoryCount: number }) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
      <Kpi label="Level" value={String(audit.level)} sub={`${audit.totalSP} SP earned`} />
      <Kpi label="Unspent skill points" value={String(audit.availableSP)} sub={unspentSub(audit)} />
      <Kpi label="Factories" value={String(factoryCount)} sub={`${audit.target.companies + 2} cap`} />
      <Kpi
        label="Build status"
        value={audit.matches ? "OPTIMAL" : "OFF"}
        sub={audit.matches ? "matches the canonical plan" : "see Skills below"}
        tone={audit.matches ? "ok" : "warn"}
      />
    </div>
  );
}

function unspentSub(audit: SkillAudit): string {
  if (audit.availableSP === 0) return "all spent";
  const behind = audit.rows.find((r) => r.status === "behind");
  if (behind && audit.availableSP >= behind.spToReach) return `spend ${behind.spToReach} on ${behind.label}`;
  if (isBankLevel(audit.level)) return "hold for next level";
  if (audit.matches) return "save for next level";
  return "ready to allocate";
}

function Kpi({ label, value, sub, tone }: { label: string; value: string; sub: string; tone?: "ok" | "warn" }) {
  const valueClass = toneClass(tone);
  return (
    <div className="tactical-panel rounded-sm p-3">
      <div className="label">{label}</div>
      <div className={`mt-1 font-mono text-lg sm:text-xl ${valueClass}`}>{value}</div>
      <div className="mt-0.5 text-[10.5px] text-text-faint">{sub}</div>
    </div>
  );
}

function toneClass(tone?: "ok" | "warn"): string {
  if (tone === "ok") return "text-ok";
  if (tone === "warn") return "text-warn";
  return "text-text";
}

function PastPlanBanner({ level }: { level: number }) {
  return (
    <section className="tactical-panel rounded-sm border-accent/30 bg-bg-subtle p-4 sm:p-5">
      <div className="label text-accent">Level {level} · past the plan</div>
      <p className="mt-2 text-sm leading-relaxed text-text">
        You're past level 15. The prescriptive table stops here because by this point you probably know what you're doing already, and the optimal path branches into too many viable choices to call.
      </p>
      <p className="mt-2 text-sm leading-relaxed text-text-muted">
        For SP allocation from here on out, the most useful reference is the{" "}
        <a href={SOURCES.ecoDistribution.url} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
          Eco skill point distribution guide
        </a>{" "}
        which has lookup tables for any total SP. The daily checklist below still applies.
      </p>
    </section>
  );
}

function HeroAction({ action }: { action: DailyAction }) {
  return (
    <section className="tactical-panel rounded-sm border-accent/40 bg-accent/5 p-5 sm:p-6">
      <div className="label text-accent">Do this now</div>
      <h2 className="mt-2 text-lg leading-snug sm:text-xl text-text">{action.title}</h2>
      <p className="mt-2 text-sm leading-relaxed text-text-muted">{action.detail}</p>
      <a
        href={action.source.url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 inline-block font-mono text-[10px] uppercase tracking-wider text-text-faint hover:text-accent"
      >
        source: {action.source.title} ↗
      </a>
    </section>
  );
}

function SkillsCard({ audit }: { audit: SkillAudit }) {
  return (
    <Panel title={`Skills · level ${audit.target.level} target`} subtitle={audit.target.newAction}>
      <ul className="space-y-1.5">
        {audit.rows.map((r) => (
          <SkillRow key={r.key} row={r} />
        ))}
      </ul>
    </Panel>
  );
}

function SkillRow({ row }: { row: SkillAuditRow }) {
  const badge = badgeClass(row.status);
  const labelText = labelForStatus(row.status);
  return (
    <li className="flex items-center justify-between gap-3 rounded border border-border bg-surface/40 px-3 py-2">
      <div>
        <div className="text-sm text-text">{row.label}</div>
        <div className="font-mono text-[10.5px] text-text-faint">
          current {row.current} / target {row.target}
          {row.spToReach > 0 && ` · ${row.spToReach} SP to reach`}
        </div>
      </div>
      <span className={`shrink-0 rounded border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider ${badge}`}>
        {labelText}
      </span>
    </li>
  );
}

function labelForStatus(status: SkillAuditRow["status"]): string {
  if (status === "ok") return "On plan";
  if (status === "behind") return "Behind";
  return "Ahead";
}

function badgeClass(status: SkillAuditRow["status"]): string {
  if (status === "ok") return "border-ok/40 bg-ok/10 text-ok";
  if (status === "behind") return "border-warn/40 bg-warn/10 text-warn";
  return "border-loss/40 bg-loss/10 text-loss";
}

function FactoriesCard({ factories, factoryAction }: { factories: Factory[]; factoryAction: FactoryAction }) {
  return (
    <Panel
      title={`Factories · ${factories.length}`}
      subtitle={factoryActionHeadline(factoryAction)}
    >
      <ul className="space-y-1.5">
        {factories.length === 0 && (
          <li className="rounded border border-border bg-surface/40 p-3 text-xs text-text-muted">
            No factories yet. The dev guide says: convert your starter factory to concrete first, then build limestone, steel, iron in that order.
          </li>
        )}
        {[...factories]
          .sort((a, b) => a.automatedEngine - b.automatedEngine)
          .map((f) => (
            <FactoryRow key={f.id} factory={f} action={factoryAction} />
          ))}
        {factoryAction.kind === "build" && (
          <li className="rounded border border-accent/40 bg-accent/5 px-3 py-2">
            <div className="text-sm text-accent">+ Build: {factoryAction.itemCode}</div>
            <div className="font-mono text-[10.5px] text-text-faint">~{factoryAction.estimatedCost} coin in concrete</div>
          </li>
        )}
      </ul>
    </Panel>
  );
}

function factoryActionHeadline(action: FactoryAction): string {
  if (action.kind === "convert") return "Top action: convert your starter factory";
  if (action.kind === "upgrade") return "Top action: upgrade the lowest AE first";
  if (action.kind === "build") return "Top action: build the next factory";
  return "All factories at target";
}

function FactoryRow({ factory, action }: { factory: Factory; action: FactoryAction }) {
  const isTopUpgrade = action.kind === "upgrade" && action.id === factory.id;
  const isConvert = action.kind === "convert" && action.id === factory.id;
  const isTop = isTopUpgrade || isConvert;
  const targetAE = factoryAeTarget(factory);
  const atTarget = factory.automatedEngine >= targetAE;
  return (
    <li className={cn("rounded px-3 py-2 border", [
      { "border-accent/60 bg-accent/10": isTop },
      { "border-ok/30 bg-ok/5": !isTop && atTarget },
      { "border-border bg-surface/40": !isTop && !atTarget },
    ])}>
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-sm text-text">{factory.name}</span>
        <span className="font-mono text-[11px] text-text-muted">
          AE{factory.automatedEngine}{atTarget ? " ✓" : ` → ${targetAE}`}
        </span>
      </div>
      <div className="mt-0.5 font-mono text-[10.5px] text-text-faint">{factory.itemCode}</div>
      {isTopUpgrade && action.kind === "upgrade" && (
        <p className="mt-1.5 text-[11px] text-accent">→ {action.reason}</p>
      )}
      {isConvert && action.kind === "convert" && (
        <p className="mt-1.5 text-[11px] text-accent">
          → Convert to <span className="font-mono">{action.targetItem}</span>. {action.reason}
        </p>
      )}
    </li>
  );
}

function factoryAeTarget(_factory: Factory): number {
  return 4;
}

function CoinCard({ coin }: { coin: CoinPriority[] }) {
  return (
    <Panel title="Coin priorities" subtitle="Spend in this order">
      <ul className="space-y-1.5">
        {coin.map((c) => (
          <li key={c.rank} className="flex items-start gap-2 rounded border border-border bg-surface/40 px-3 py-2">
            <span className="mt-0.5 shrink-0 font-mono text-[10px] text-text-faint">#{c.rank}</span>
            <div>
              <div className="text-sm text-text">{c.spend}</div>
              <div className="mt-0.5 text-[11px] leading-relaxed text-text-muted">{c.why}</div>
            </div>
          </li>
        ))}
      </ul>
    </Panel>
  );
}

function UpNextCard({ current, upcoming }: { current: LevelTarget; upcoming: LevelTarget[] }) {
  return (
    <Panel title="Up next" subtitle="The 3 levels after this one">
      {upcoming.length === 0 ? (
        <p className="text-xs text-text-muted">
          You're past the prescriptive table. For level 16 and beyond, see the{" "}
          <a href={SOURCES.ecoDistribution.url} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
            Eco skill point distribution guide
          </a>
          .
        </p>
      ) : (
        <ul className="space-y-1.5">
          {upcoming.map((p) => (
            <li key={p.level} className="rounded border border-border bg-surface/40 px-3 py-2">
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-sm text-text">Level {p.level}</span>
                <span className="font-mono text-[10px] text-text-faint">
                  {totalSpCost(p, current)} SP to allocate
                </span>
              </div>
              <div className="mt-0.5 text-[11.5px] leading-relaxed text-text-muted">{p.newAction}</div>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}

function totalSpCost(target: LevelTarget, base: LevelTarget): number {
  const keys: EcoSkillKey[] = ["entrepreneurship", "energy", "production", "companies"];
  let total = 0;
  for (const k of keys) {
    total += spDelta(base[k], target[k]);
  }
  return total;
}

function SourcesCard() {
  return (
    <Panel title="Sources">
      <ul className="space-y-1 text-sm text-text-muted">
        {Object.values(SOURCES).map((s) => (
          <li key={s.id}>
            <a href={s.url} target="_blank" rel="noopener noreferrer" className="hover:text-accent hover:underline">
              {s.title}
            </a>
          </li>
        ))}
      </ul>
    </Panel>
  );
}
