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

type Phase = { tier: number; maxCount: number };

const PHASES: Phase[] = [
  { tier: 3, maxCount: 3 },
  { tier: 4, maxCount: 6 },
  { tier: 5, maxCount: 6 },
];

function currentPhase(factories: Factory[]): Phase {
  for (const phase of PHASES) {
    const allAtTier = factories.every((f) => f.automatedEngine >= phase.tier);
    const filled = factories.length >= phase.maxCount;
    if (!allAtTier || !filled) return phase;
  }
  return PHASES[PHASES.length - 1];
}

export function nextFactoryAction(args: {
  factories: Factory[];
  companiesSkillLevel: number;
}): FactoryAction {
  if (args.factories.length === 1) {
    const sole = args.factories[0];
    if (!CANONICAL_CORE_SET.has(sole.itemCode)) {
      return {
        kind: "convert",
        id: sole.id,
        name: sole.name,
        currentItem: sole.itemCode,
        targetItem: STARTER_CONVERSION_TARGET,
        reason: `Your starter factory produces ${sole.itemCode}, which sits outside the canonical chain. Convert to ${STARTER_CONVERSION_TARGET}: you can self-produce it for free, then craft it into concrete (the build currency) for every future factory.`,
      };
    }
  }

  const phase = currentPhase(args.factories);
  const targetCount = Math.min(factoryTargetCount(args.companiesSkillLevel), phase.maxCount);

  const underBuilt = args.factories
    .filter((f) => f.automatedEngine < phase.tier)
    .sort((a, b) => a.automatedEngine - b.automatedEngine);
  if (underBuilt.length > 0 && args.factories.length >= targetCount) {
    const f = underBuilt[0];
    return {
      kind: "upgrade",
      id: f.id,
      name: f.name,
      itemCode: f.itemCode,
      currentAE: f.automatedEngine,
      targetAE: phase.tier,
      reason: phase.tier === 3
        ? `Push it to AE${phase.tier} before you build the next factory. Beginner's Guide 101 says AE3 first, build #${args.factories.length + 1}, then push together. Keeps your chain closing fast.`
        : `Push all factories to AE${phase.tier} before adding the next slot. Old factories compound longer; new ones start strong.`,
    };
  }

  if (underBuilt.length > 0 && args.factories.length < targetCount) {
    const lowest = underBuilt[0];
    if (lowest.automatedEngine < phase.tier - (phase.tier === 3 ? 1 : 0)) {
      return {
        kind: "upgrade",
        id: lowest.id,
        name: lowest.name,
        itemCode: lowest.itemCode,
        currentAE: lowest.automatedEngine,
        targetAE: phase.tier,
        reason: `Bring it up to AE${phase.tier} before you add another factory. Your chain isn't producing enough yet.`,
      };
    }
  }

  if (args.factories.length < targetCount) {
    const owned = new Set(args.factories.map((f) => f.itemCode));
    const next = CANONICAL_FACTORY_ORDER.find((c) => !owned.has(c)) ?? "bread";
    return {
      kind: "build",
      itemCode: next,
      reason: `Lowest factory already at AE${phase.tier - 1}+. Build ${next} now to close the chain; you'll push everyone to AE${phase.tier} together after.`,
      estimatedCost: 50 * (args.factories.length + 1),
    };
  }

  if (underBuilt.length > 0) {
    const f = underBuilt[0];
    return {
      kind: "upgrade",
      id: f.id,
      name: f.name,
      itemCode: f.itemCode,
      currentAE: f.automatedEngine,
      targetAE: phase.tier,
      reason: `All ${args.factories.length} slots filled. Push to AE${phase.tier} across the board, then revisit when company-limit unlocks more slots.`,
    };
  }

  return {
    kind: "wait",
    reason: `${args.factories.length} factories at AE${phase.tier}. Wait for the next level-up to lift the company-limit skill and unlock another factory slot.`,
  };
}
