import type { EcoSkillKey, LevelTarget } from "./levels";
import { labelForSkill, spDelta, targetForLevel } from "./levels";

export type SkillStatus = "ok" | "behind" | "ahead";

export type SkillAuditRow = {
  key: EcoSkillKey;
  label: string;
  current: number;
  target: number;
  spToReach: number;
  status: SkillStatus;
};

export type SkillAudit = {
  level: number;
  availableSP: number;
  totalSP: number;
  target: LevelTarget;
  rows: SkillAuditRow[];
  matches: boolean;
};

const ECO_SKILL_KEYS: EcoSkillKey[] = ["entrepreneurship", "energy", "production", "companies"];

function statusFor(current: number, target: number): SkillStatus {
  if (current === target) return "ok";
  if (current < target) return "behind";
  return "ahead";
}

export function auditSkills(args: {
  level: number;
  availableSP: number;
  totalSP: number;
  current: Record<EcoSkillKey, number>;
}): SkillAudit {
  const target = targetForLevel(args.level);
  const rows = ECO_SKILL_KEYS.map((k) => {
    const cur = args.current[k] ?? 0;
    const tgt = target[k];
    return {
      key: k,
      label: labelForSkill(k),
      current: cur,
      target: tgt,
      spToReach: spDelta(cur, tgt),
      status: statusFor(cur, tgt),
    } satisfies SkillAuditRow;
  });
  return {
    level: args.level,
    availableSP: args.availableSP,
    totalSP: args.totalSP,
    target,
    rows,
    matches: rows.every((r) => r.status !== "behind"),
  };
}
