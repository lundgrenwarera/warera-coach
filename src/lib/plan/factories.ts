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

function aeTargetForCount(count: number): number {
  if (count <= 6) return 4;
  return 5;
}

export function nextFactoryAction(args: {
  factories: Factory[];
  companiesSkillLevel: number;
}): FactoryAction {
  const targetCount = factoryTargetCount(args.companiesSkillLevel);
  const aeTarget = aeTargetForCount(args.factories.length);

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

  const underBuilt = args.factories
    .filter((f) => f.automatedEngine < aeTarget)
    .sort((a, b) => a.automatedEngine - b.automatedEngine);
  if (underBuilt.length > 0) {
    const f = underBuilt[0];
    return {
      kind: "upgrade",
      id: f.id,
      name: f.name,
      itemCode: f.itemCode,
      currentAE: f.automatedEngine,
      targetAE: aeTarget,
      reason: `Push every factory's Automated Engine to ${aeTarget} before adding the next one. Compounding output beats a new factory at low engine levels.`,
    };
  }

  if (args.factories.length < targetCount) {
    const owned = new Set(args.factories.map((f) => f.itemCode));
    const next = CANONICAL_FACTORY_ORDER.find((c) => !owned.has(c)) ?? "bread";
    return {
      kind: "build",
      itemCode: next,
      reason: `Canonical order. Limestone → concrete and iron → steel close their input chains. Concrete is the factory-build currency; steel is the upgrade currency.`,
      estimatedCost: 50 * (args.factories.length + 1),
    };
  }

  return {
    kind: "wait",
    reason: `${args.factories.length} factories at AE${aeTarget}. Wait for the next level-up to lift the company-limit skill and unlock another factory slot.`,
  };
}
