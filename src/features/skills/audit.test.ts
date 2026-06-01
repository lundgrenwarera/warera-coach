import { describe, expect, it } from "vitest";
import { auditSkills } from "./audit";

describe("auditSkills", () => {
  it("flags a skill below target as behind with the SP to reach it", () => {
    const a = auditSkills({
      level: 5,
      availableSP: 0,
      totalSP: 16,
      current: { entrepreneurship: 0, energy: 3, production: 2, companies: 1 },
    });
    const prod = a.rows.find((r) => r.key === "production")!;
    expect(prod.status).toBe("behind");
    expect(prod.target).toBe(4);
    expect(prod.spToReach).toBe(7); // spCostFor(4) - spCostFor(2) = 10 - 3
    expect(a.matches).toBe(false);
  });

  it("flags a skill above target as ahead", () => {
    const a = auditSkills({
      level: 1,
      availableSP: 0,
      totalSP: 0,
      current: { entrepreneurship: 0, energy: 5, production: 2, companies: 0 },
    });
    expect(a.rows.find((r) => r.key === "energy")?.status).toBe("ahead");
  });

  it("matches the plan when nothing is behind", () => {
    const a = auditSkills({
      level: 1,
      availableSP: 0,
      totalSP: 0,
      current: { entrepreneurship: 0, energy: 1, production: 2, companies: 0 },
    });
    expect(a.matches).toBe(true);
    expect(a.rows.every((r) => r.spToReach === 0)).toBe(true);
  });
});
