export const COMPANIES_BASE_CAP = 2;

export const CANONICAL_FACTORY_ORDER = [
  "limestone",
  "concrete",
  "iron",
  "steel",
  "grain",
  "bread",
] as const;

export const STARTER_CONVERSION_TARGET = "limestone";

const CANONICAL_CORE_SET = new Set<string>(["limestone", "concrete", "iron", "steel"]);

export type Factory = {
  id: string;
  name: string;
  itemCode: string;
  automatedEngine: number;
};

export type FactoryAction =
  | { kind: "convert"; id: string; name: string; currentItem: string; targetItem: string; reason: string }
  | { kind: "build"; itemCode: string; reason: string; estimatedCost: number }
  | { kind: "upgrade"; id: string; name: string; itemCode: string; currentAE: number; targetAE: number; reason: string }
  | { kind: "wait"; reason: string };

export function factoryTargetCount(companiesSkillLevel: number): number {
  return Math.min(6, COMPANIES_BASE_CAP + companiesSkillLevel);
}

/**
 * BuhDeuce build order (PERFECT ECONOMIC GUIDE):
 *   1. Build factory 1 → AE3
 *   2. Build factory 2 → AE3
 *   3. Build factory 3, then push companies 1-3 → AE4 together
 *   4. Build factory 4 → AE4
 *   5. Build factory 5 → AE4
 *   6. Build factory 6 → AE4
 *   7. Push companies 1-6 → AE5
 *   8. (war path) push companies 1-6 → AE6
 *
 * Each new factory uses the canonical chain: limestone → concrete → iron → steel,
 * then grain/bread for staying-eco.
 */
export function factoryTargetAE(factories: Factory[]): number {
  const count = factories.length;
  if (count === 0) return 3;

  const allAtLeast = (n: number) => factories.every((f) => f.automatedEngine >= n);

  if (count <= 2) return 3;

  if (count === 3) {
    if (!allAtLeast(3)) return 3;
    return 4;
  }

  if (count <= 6) {
    return 4;
  }

  if (!allAtLeast(5)) return 5;
  return 6;
}

export function nextFactoryAction(args: {
  factories: Factory[];
  companiesSkillLevel: number;
}): FactoryAction {
  const factories = args.factories;
  const count = factories.length;
  const factoryCap = factoryTargetCount(args.companiesSkillLevel);

  if (count === 0) {
    return {
      kind: "build",
      itemCode: CANONICAL_FACTORY_ORDER[0],
      reason: `Start of the eco plan. Limestone first — you can self-produce it for free and chain it into concrete, the build currency for every future factory.`,
      estimatedCost: 50,
    };
  }

  if (count === 1) {
    const sole = factories[0];
    if (!CANONICAL_CORE_SET.has(sole.itemCode)) {
      return {
        kind: "convert",
        id: sole.id,
        name: sole.name,
        currentItem: sole.itemCode,
        targetItem: STARTER_CONVERSION_TARGET,
        reason: `Your starter produces ${sole.itemCode}, outside the canonical chain. Convert to ${STARTER_CONVERSION_TARGET} — you can self-produce it for free, then craft it into concrete for every future factory.`,
      };
    }
  }

  const sortedByAE = [...factories].sort((a, b) => a.automatedEngine - b.automatedEngine);
  const lowest = sortedByAE[0];
  const lowestAE = lowest.automatedEngine;
  const allAtLeast = (n: number) => factories.every((f) => f.automatedEngine >= n);

  if (count <= 2) {
    if (lowestAE < 3) {
      return upgradeAction(lowest, 3, count, "preAE3");
    }
    return buildOrWait(factories, count, factoryCap, 3);
  }

  if (count === 3) {
    if (!allAtLeast(4)) {
      return upgradeAction(lowest, 4, count, "pushAE4");
    }
    return buildOrWait(factories, count, factoryCap, 4);
  }

  if (count <= 5) {
    if (lowestAE < 4) {
      return upgradeAction(lowest, 4, count, "individualAE4");
    }
    return buildOrWait(factories, count, factoryCap, 4);
  }

  if (count === 6) {
    if (lowestAE < 4) return upgradeAction(lowest, 4, count, "individualAE4");
    if (lowestAE < 5) return upgradeAction(lowest, 5, count, "pushAE5");
    if (lowestAE < 6) return upgradeAction(lowest, 6, count, "pushAE6");
    return {
      kind: "wait",
      reason: `All 6 factories at AE6. Eco core build complete — past the prescriptive plan. Staying eco? Build factories 7-10 next.`,
    };
  }

  if (lowestAE < 5) return upgradeAction(lowest, 5, count, "ecoAE5");
  if (lowestAE < 6) return upgradeAction(lowest, 6, count, "ecoAE6");
  return {
    kind: "wait",
    reason: `${count} factories at AE6+. Past the prescriptive plan — see the full-eco section of the guide for AE7 push.`,
  };
}

type UpgradePhase = "preAE3" | "pushAE4" | "individualAE4" | "pushAE5" | "pushAE6" | "ecoAE5" | "ecoAE6";

function upgradeAction(f: Factory, targetAE: number, count: number, phase: UpgradePhase): FactoryAction {
  const reason = upgradeReason(targetAE, count, phase);
  return {
    kind: "upgrade",
    id: f.id,
    name: f.name,
    itemCode: f.itemCode,
    currentAE: f.automatedEngine,
    targetAE,
    reason,
  };
}

function upgradeReason(_targetAE: number, count: number, phase: UpgradePhase): string {
  if (phase === "preAE3") {
    const nextSlot = count + 1;
    return `Push it to AE3 before you build factory #${nextSlot}. BuhDeuce's plan: each of the first three factories hits AE3 individually, then push 1-3 to AE4 together.`;
  }
  if (phase === "pushAE4") {
    return `All 3 factories built. Push the lowest to AE4 — drag the whole set 1-3 to AE4 together before building factory #4.`;
  }
  if (phase === "individualAE4") {
    const nextSlot = count + 1;
    if (count < 6) {
      return `Bring it to AE4 before building factory #${nextSlot}. From factory 4 onward, each new slot goes to AE4 individually before the next build.`;
    }
    return `Bring it to AE4 so all six factories are level. Next phase: push the whole set to AE5.`;
  }
  if (phase === "pushAE5") {
    return `All 6 factories at AE4. Push the lowest to AE5 — bring the whole set to AE5 together. If you're heading to war, AE6 after this.`;
  }
  if (phase === "pushAE6") {
    return `War-prep push: drag the set to AE6. AE6 is the ceiling before you start disabling factories for combat.`;
  }
  if (phase === "ecoAE5") {
    return `Staying-eco track: push toward AE5 across the full set before upgrading to AE6.`;
  }
  return `Staying-eco track: push toward AE6 — then build 11+12 and lift everyone to AE7.`;
}

function buildOrWait(
  factories: Factory[],
  count: number,
  factoryCap: number,
  prevPhaseAE: number,
): FactoryAction {
  if (count < factoryCap) {
    return buildAction(factories, count, prevPhaseAE);
  }
  return waitForCompaniesSkill(count + 1, factoryCap);
}

function buildAction(existing: Factory[], count: number, prevPhaseAE: number): FactoryAction {
  const owned = new Set(existing.map((f) => f.itemCode));
  const next = CANONICAL_FACTORY_ORDER.find((c) => !owned.has(c)) ?? "bread";
  const slot = count + 1;
  const upgradeNote = slot <= 3
    ? `Bring it to AE3 next, then build #${Math.min(slot + 1, 3)}.`
    : `Bring it to AE4 before the next build.`;
  return {
    kind: "build",
    itemCode: next,
    reason: `Slot #${slot}. Build ${next} — next in the canonical chain (limestone → concrete, iron → steel closes the dependency). ${upgradeNote} Previous factories already at AE${prevPhaseAE}+.`,
    estimatedCost: 50 * (count + 1),
  };
}

function waitForCompaniesSkill(nextSlot: number, currentCap: number): FactoryAction {
  return {
    kind: "wait",
    reason: `Factory cap is ${currentCap}. Spend SP on the Companies skill to unlock slot #${nextSlot}, then build the next factory.`,
  };
}
