import { describe, expect, it } from "vitest";
import type { SkillAudit, SkillAuditRow } from "./audit";
import { spStatus } from "./status";

function mkAudit(availableSP: number, behindSp: number): SkillAudit {
  const rows: SkillAuditRow[] = [
    {
      key: "production",
      label: "Production",
      current: 0,
      target: 2,
      spToReach: behindSp,
      status: behindSp > 0 ? "behind" : "ok",
    },
    { key: "energy", label: "Energy", current: 2, target: 2, spToReach: 0, status: "ok" },
  ];
  return {
    level: 2,
    availableSP,
    totalSP: 4,
    target: { level: 2, entrepreneurship: 0, energy: 2, production: 2, companies: 0, newAction: "" },
    rows,
    matches: behindSp === 0,
  };
}

describe("spStatus — no 'all SP spent' vs 'behind' contradiction", () => {
  it("says 'behind' (not 'all SP spent') when behind with no SP left", () => {
    expect(spStatus(mkAudit(0, 3)).text).toBe("behind");
  });

  it("'all SP spent' only when fully on track with no SP left", () => {
    expect(spStatus(mkAudit(0, 0)).text).toBe("all SP spent");
  });

  it("prompts to spend when SP is available and a behind skill is affordable", () => {
    const s = spStatus(mkAudit(5, 3));
    expect(s.action).toBe(true);
    expect(s.text).toContain("Spend 3 SP");
  });
});
