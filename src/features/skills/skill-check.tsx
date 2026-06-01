import { TriangleAlert } from "lucide-react";
import type { PlayerProfile } from "@/api/warera/types";
import { LinkedHeading } from "@/shared/components/linked-heading";
import { PanelHelp } from "@/shared/components/panel-help";
import { cn } from "@/shared/lib/utils";
import { auditSkills, type SkillAudit, type SkillAuditRow } from "./audit";
import { type EcoSkillKey, SP_PER_LEVEL, spCostFor } from "./levels";
import { spStatus } from "./status";

const TRACK = 10;
const GLYPH_SHADOW = "drop-shadow(0 1px 0 rgba(0,0,0,0.6))";
const ECO_KEYS = new Set<string>(["entrepreneurship", "energy", "production", "companies"]);

interface OffPlanSkill {
  code: string;
  level: number;
  sp: number;
}

function offPlanSkills(allSkills: Record<string, number>): OffPlanSkill[] {
  const out: OffPlanSkill[] = [];
  for (const [code, level] of Object.entries(allSkills)) {
    if (ECO_KEYS.has(code) || level <= 0) continue;
    out.push({ code, level, sp: spCostFor(level) });
  }
  return out.sort((a, b) => b.sp - a.sp);
}

interface SkillStyleDef {
  path: string;
  accent: string;
  from: string;
  to: string;
  desc: string;
}

const SKILL_STYLE: Record<EcoSkillKey, SkillStyleDef> = {
  entrepreneurship: {
    path: "M12,2A7,7 0 0,0 5,9C5,11.38 6.19,13.47 8,14.74V17A1,1 0 0,0 9,18H15A1,1 0 0,0 16,17V14.74C17.81,13.47 19,11.38 19,9A7,7 0 0,0 12,2M9,21A1,1 0 0,0 10,22H14A1,1 0 0,0 15,21V20H9V21Z",
    accent: "rgb(209,148,195)",
    from: "rgb(116,50,101)",
    to: "rgb(89,39,77)",
    desc: "Used to self-work in your own companies",
  },
  energy: {
    path: "M11 15H6L13 1V9H18L11 23V15Z",
    accent: "rgb(130,160,227)",
    from: "rgb(30,63,136)",
    to: "rgb(23,49,104)",
    desc: "Used to work",
  },
  production: {
    path: "M14.79,10.62L3.5,21.9L2.1,20.5L13.38,9.21L14.79,10.62M19.27,7.73L19.86,7.14L19.07,6.35L19.71,5.71L18.29,4.29L17.65,4.93L16.86,4.14L16.27,4.73C14.53,3.31 12.57,2.17 10.47,1.37L9.64,3.16C11.39,4.08 13,5.19 14.5,6.5L14,7L17,10L17.5,9.5C18.81,11 19.92,12.61 20.84,14.36L22.63,13.53C21.83,11.43 20.69,9.47 19.27,7.73Z",
    accent: "rgb(214,187,130)",
    from: "rgb(112,88,37)",
    to: "rgb(86,68,28)",
    desc: "Production points you generate each time you work",
  },
  companies: {
    path: "M4,18V20H8V18H4M4,14V16H14V14H4M10,18V20H14V18H10M16,14V16H20V14H16M16,18V20H20V18H16M2,22V8L7,12V8L12,12V8L17,12L18,2H21L22,12V22H2Z",
    accent: "rgb(214,187,130)",
    from: "rgb(112,88,37)",
    to: "rgb(86,68,28)",
    desc: "Amount of companies you can own",
  },
};

function SkillGlyph({ path, className, style }: { path: string; className?: string; style?: React.CSSProperties }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      width="1em"
      height="1em"
      aria-hidden="true"
      className={cn("inline-block", className)}
      style={style}
    >
      <path d={path} />
    </svg>
  );
}

type TileKind = "have" | "extra" | "need" | "empty";

function tileKind(lvl: number, current: number, target: number): TileKind {
  if (lvl <= current && lvl <= target) return "have";
  if (lvl <= current) return "extra";
  if (lvl <= target) return "need";
  return "empty";
}

function tileStyle(def: SkillStyleDef, kind: TileKind): React.CSSProperties {
  const gradient = `linear-gradient(45deg, ${def.from}, ${def.to})`;
  if (kind === "have") return { backgroundImage: gradient, borderColor: def.accent, color: def.accent };
  if (kind === "extra") return { backgroundImage: gradient, borderColor: def.accent, color: def.accent, opacity: 0.35 };
  if (kind === "need") return { borderColor: def.accent, color: def.accent, borderStyle: "dashed" };
  return { borderColor: "var(--border)" };
}

function Tiles({ def, current, target }: { def: SkillStyleDef; current: number; target: number }) {
  return (
    <div className="flex flex-wrap gap-0.5">
      {Array.from({ length: TRACK }, (_, i) => {
        const lvl = i + 1;
        const kind = tileKind(lvl, current, target);
        return (
          <span
            key={lvl}
            className="flex h-8 w-5 items-center justify-center rounded-[2px] border text-[17px]"
            style={tileStyle(def, kind)}
          >
            {kind !== "empty" && (
              <SkillGlyph
                path={def.path}
                style={{
                  filter: kind === "have" ? GLYPH_SHADOW : undefined,
                  opacity: kind === "need" ? 0.6 : undefined,
                }}
              />
            )}
          </span>
        );
      })}
    </div>
  );
}

function SkillBadge({ row }: { row: SkillAuditRow }) {
  if (row.key === "companies") {
    return <span className="text-muted-foreground ml-auto shrink-0 text-xs">raise to add a company</span>;
  }
  if (row.status === "behind") {
    return <span className="text-destructive ml-auto shrink-0 text-xs font-medium">behind</span>;
  }
  if (row.status === "ok") {
    return <span className="text-chart-2 ml-auto shrink-0 text-xs font-medium">on track</span>;
  }
  return <span className="text-muted-foreground ml-auto shrink-0 text-xs">ahead</span>;
}

function SkillBlock({ row, def, value }: { row: SkillAuditRow; def: SkillStyleDef; value: number }) {
  return (
    <div>
      <div className="flex items-center gap-2">
        <SkillGlyph path={def.path} className="text-base" style={{ color: def.accent, filter: GLYPH_SHADOW }} />
        <span className="font-saira text-lg leading-none font-bold tabular-nums" style={{ color: def.accent }}>
          {Math.round(value)}
        </span>
        <span className="text-sm font-semibold">{row.label}</span>
        <SkillBadge row={row} />
      </div>
      <p className="text-muted-foreground mt-1 text-xs">{def.desc}</p>
      <div className="mt-2">
        <Tiles def={def} current={row.current} target={row.target} />
      </div>
    </div>
  );
}

function LegendTile({ kind, label }: { kind: TileKind; label: string }) {
  const def = SKILL_STYLE.production;
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className="flex h-7 w-[18px] items-center justify-center rounded-[2px] border text-[15px]"
        style={tileStyle(def, kind)}
      >
        {kind !== "empty" && (
          <SkillGlyph
            path={def.path}
            style={{ filter: kind === "have" ? GLYPH_SHADOW : undefined, opacity: kind === "need" ? 0.6 : undefined }}
          />
        )}
      </span>
      {label}
    </span>
  );
}

function SpChip({ audit }: { audit: SkillAudit }) {
  const status = spStatus(audit);
  if (!status.action) return null;
  return (
    <span className="border-chart-2/40 bg-chart-2/10 text-chart-2 rounded-full border px-2 py-0.5 text-xs font-medium">
      {status.text}
    </span>
  );
}

function Legend() {
  return (
    <div
      data-tour="skill-legend"
      className="text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px]"
    >
      <LegendTile kind="have" label="have" />
      <LegendTile kind="need" label="need" />
      <LegendTile kind="extra" label="ahead" />
    </div>
  );
}

function OffPlanWarning({ skills, wayOff }: { skills: OffPlanSkill[]; wayOff: boolean }) {
  const totalSP = skills.reduce((s, x) => s + x.sp, 0);
  return (
    <div className="border-destructive/30 bg-destructive/5 flex items-start gap-2 rounded-lg border p-2.5 text-xs leading-relaxed">
      <TriangleAlert className="text-destructive mt-0.5 size-3.5 shrink-0" />
      <span className="text-muted-foreground">
        <span className="text-destructive font-medium">{totalSP} skill points off-plan.</span>
        {wayOff ? " Consider resetting your skills." : ""}
      </span>
    </div>
  );
}

export function SkillCheck({ profile }: { profile: PlayerProfile }) {
  const level = profile.level ?? 1;
  const skillsHref = `https://app.warera.io/user/${profile.userId}/skills`;
  const audit = auditSkills({
    level,
    availableSP: profile.availableSkillPoints,
    totalSP: SP_PER_LEVEL * Math.max(0, level - 1),
    current: {
      entrepreneurship: profile.skills.entrepreneurship,
      energy: profile.skills.energy,
      production: profile.skills.production,
      companies: profile.skills.companies,
    },
  });
  const offPlan = offPlanSkills(profile.allSkills);
  const offPlanSP = offPlan.reduce((s, x) => s + x.sp, 0);
  const wayOff = offPlanSP >= 6 || offPlanSP >= audit.totalSP * 0.25;

  return (
    <section data-tour="skills" className="bg-card rounded-xl border p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2>
          <LinkedHeading title="Skills" href={skillsHref} dataTour="skills-title" />
        </h2>
        <div className="flex items-center gap-2">
          <SpChip audit={audit} />
          <PanelHelp title="Skills" sources={[{ label: "War Era Wiki: Skills", href: "https://warera.wiki/skills" }]}>
            <p>
              Skill points come from leveling up: you start with 4 and gain 4 each level. This panel plans the economic
              ones.
            </p>
            <p>
              <span className="text-foreground font-medium">Production</span> raises the PP you make each time you work.{" "}
              <span className="text-foreground font-medium">Energy</span> is a bar you spend working jobs for other
              companies, 10 per session.
            </p>
            <p>
              <span className="text-foreground font-medium">Entrepreneurship</span> is a bar that lets you self-work
              your own companies. <span className="text-foreground font-medium">Companies</span> raises how many you can
              own.
            </p>
            <p>
              Maxing every skill costs 715 points, so stay focused: pour into Production, Energy, Entrepreneurship and
              Companies early, and skip combat skills until your economy is stable.
            </p>
          </PanelHelp>
        </div>
      </div>

      <div className="mb-4 space-y-3">
        {offPlan.length > 0 && <OffPlanWarning skills={offPlan} wayOff={wayOff} />}
        <Legend />
      </div>

      <div className="space-y-4">
        {audit.rows.map((r) => (
          <SkillBlock key={r.key} row={r} def={SKILL_STYLE[r.key]} value={profile.skillValues[r.key]} />
        ))}
      </div>
    </section>
  );
}
