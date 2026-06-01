import { describe, expect, it } from "vitest";
import type { Factory, GameRules, PlayerProfile } from "@/api/warera/types";
import { nextStep, PLAYBOOKS } from "./index";
import { RULES } from "./rules";
import type { AdvisorContext } from "./types";

const pb = PLAYBOOKS[0];

function mkFactory(item: string, ae = 3, i = 0): Factory {
  return {
    id: `f${i}`,
    name: `Co ${i}`,
    item,
    ae,
    storage: 1,
    breakRoom: 1,
    stock: 0,
    workerCount: 0,
    workerPointsPerDay: 0,
    workerWageWeightedPoints: 0,
    estimatedValue: 0,
    region: null,
  };
}

function mkProfile(items: string[], level = 5): PlayerProfile {
  return {
    userId: "u",
    username: "t",
    avatarUrl: null,
    countryId: null,
    level,
    availableSkillPoints: 0,
    spentSkillPoints: 0,
    money: 0,
    pointsPerWork: 10,
    worksPerDay: 1,
    hasJob: false,
    skills: { production: 0, energy: 0, entrepreneurship: 0, companies: 5, management: 0 },
    skillValues: { production: 0, energy: 0, entrepreneurship: 0, companies: 0, management: 0 },
    allSkills: {},
    factories: items.map((it, i) => mkFactory(it, 3, i)),
  };
}

describe("nextStep — convert/build/upgrade", () => {
  it("converts a wrong-item starter company to limestone", () => {
    const s = nextStep(mkProfile(["bread"]), pb);
    expect(s.action).toBe("convert");
    expect(s.suggestedItem).toBe("limestone");
    expect(s.factoryId).toBe("f0");
  });

  it("builds limestone when there are no companies (no convert)", () => {
    const s = nextStep(mkProfile([]), pb);
    expect(s.action).toBe("build");
    expect(s.suggestedItem).toBe("limestone");
  });

  it("does not convert when the chain item is present — builds the next slot", () => {
    const s = nextStep(mkProfile(["limestone"]), pb);
    expect(s.action).toBe("build");
    expect(s.suggestedItem).toBe("concrete");
  });

  it("is order-independent (concrete before limestone does not trigger convert)", () => {
    const s = nextStep(mkProfile(["concrete", "limestone"]), pb);
    expect(s.action).not.toBe("convert");
  });

  it("converts an off-plan 2nd company to the missing chain item", () => {
    const s = nextStep(mkProfile(["limestone", "bread"]), pb);
    expect(s.action).toBe("convert");
    expect(s.suggestedItem).toBe("concrete");
    expect(s.factoryId).toBe("f1");
  });

  it("upgrades when the chain is present but AE is below the phase target", () => {
    const s = nextStep(mkProfile(["limestone", "concrete", "iron"]), pb);
    expect(s.action).toBe("upgrade");
  });
});

function mkCtx(level: number): AdvisorContext {
  return {
    profile: mkProfile(["limestone"], level),
    game: { marketMinLevel: 7, items: {} } as unknown as GameRules,
    prices: { ammo: 5 },
    inventory: { ammo: 10 },
    facts: { outputs: [], chain: [], arbitrage: [], work: [], investment: [], goal: null },
    playbook: pb,
    step: {
      satisfied: false,
      action: "build",
      description: "",
      suggestedItem: "limestone",
      factoryId: null,
      goal: { kind: "newFactory" },
    },
    missionsDone: false,
  };
}

function mkChainCtx(companyCount: number): AdvisorContext {
  return {
    ...mkCtx(10),
    profile: mkProfile(Array(companyCount).fill("concrete"), 10),
    facts: {
      outputs: [],
      chain: [
        { item: "concrete", advice: "sell", tradable: true, net: 4.8, valuePerDay: 7.84 },
      ] as unknown as AdvisorContext["facts"]["chain"],
      arbitrage: [],
      work: [],
      investment: [],
      goal: null,
    },
  };
}

describe("market gating (level 7)", () => {
  const missionsFirst = RULES.find((r) => r.id === "missions-first")!;
  const sellForCash = RULES.find((r) => r.id === "sell-for-cash")!;

  it("pushes missions-first below level 7 only", () => {
    expect(missionsFirst.evaluate(mkCtx(3))).toBeTruthy();
    expect(missionsFirst.evaluate(mkCtx(7))).toBeNull();
  });

  it("hides missions-first once all missions are completed", () => {
    expect(missionsFirst.evaluate({ ...mkCtx(3), missionsDone: true })).toBeNull();
  });

  it("shows get-a-job only when the player has no job", () => {
    const getAJob = RULES.find((r) => r.id === "get-a-job")!;
    const ctx = mkCtx(5);
    expect(getAJob.evaluate({ ...ctx, profile: { ...ctx.profile, hasJob: false } })).toBeTruthy();
    expect(getAJob.evaluate({ ...ctx, profile: { ...ctx.profile, hasJob: true } })).toBeNull();
  });

  it("suppresses sell-for-cash below level 7", () => {
    expect(sellForCash.evaluate(mkCtx(3))).toBeNull();
  });

  it("allows sell-for-cash at level 7+", () => {
    expect(sellForCash.evaluate(mkCtx(10))).toBeTruthy();
  });
});

describe("beginner gating — chain optimization hidden until 6-company core", () => {
  const surplus = RULES.find((r) => r.id === "surplus-raw")!;

  it("hides surplus/chain tips while still building (fewer than 6 companies)", () => {
    expect(surplus.evaluate(mkChainCtx(3))).toEqual([]);
  });

  it("surfaces them once the 6-company core is built", () => {
    const tips = surplus.evaluate(mkChainCtx(6));
    expect(Array.isArray(tips) && tips.length).toBeGreaterThan(0);
  });
});
