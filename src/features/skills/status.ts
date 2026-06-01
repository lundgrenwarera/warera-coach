import type { SkillAudit } from "./audit";

export interface SpStatus {
  text: string;
  action: boolean;
}

export function spStatus(audit: SkillAudit): SpStatus {
  const behind = audit.rows.find((r) => r.status === "behind");
  if (audit.availableSP > 0) {
    if (behind && audit.availableSP >= behind.spToReach) {
      return { text: `Spend ${behind.spToReach} SP on ${behind.label}`, action: true };
    }
    return { text: `${audit.availableSP} SP, save for next level`, action: false };
  }
  if (behind) return { text: "behind", action: false };
  return { text: "all SP spent", action: false };
}
