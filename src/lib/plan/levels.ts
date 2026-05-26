export type EcoSkillKey = "entrepreneurship" | "energy" | "production" | "companies";

export type LevelTarget = {
  level: number;
  entrepreneurship: number;
  energy: number;
  production: number;
  companies: number;
  newAction: string;
};

export const SP_PER_LEVEL = 4;

export const LEVEL_PLAN: LevelTarget[] = [
  { level: 1,  entrepreneurship: 0, energy: 0, production: 1, companies: 0, newAction: "Production → 1. Convert your starter factory to limestone as your very first move." },
  { level: 2,  entrepreneurship: 0, energy: 1, production: 2, companies: 0, newAction: "Energy → 1, Production → 2. Keep limestone producing; stockpile output." },
  { level: 3,  entrepreneurship: 0, energy: 2, production: 3, companies: 0, newAction: "Energy → 2, Production → 3. Once you have ~50 concrete value (10 limestone = 1 concrete), build factory #2 as concrete." },
  { level: 4,  entrepreneurship: 1, energy: 2, production: 4, companies: 0, newAction: "Entrepreneurship → 1, Production → 4. Both factories should be running." },
  { level: 5,  entrepreneurship: 2, energy: 3, production: 4, companies: 0, newAction: "Eco foundation set: Ent 2, Energy 3, Production 4." },
  { level: 6,  entrepreneurship: 2, energy: 4, production: 4, companies: 0, newAction: "Energy → 4. More wage hours per day." },
  { level: 7,  entrepreneurship: 2, energy: 5, production: 4, companies: 0, newAction: "Energy → 5." },
  { level: 8,  entrepreneurship: 2, energy: 5, production: 4, companies: 0, newAction: "Bank the 4 SP. Level 9 needs them for the energy jump." },
  { level: 9,  entrepreneurship: 2, energy: 6, production: 4, companies: 0, newAction: "Energy → 6 (banked + new = 8 SP, 2 left over)." },
  { level: 10, entrepreneurship: 3, energy: 6, production: 4, companies: 1, newAction: "Entrepreneurship → 3, Companies → 1 (factory cap = 3)." },
  { level: 11, entrepreneurship: 4, energy: 6, production: 4, companies: 1, newAction: "Entrepreneurship → 4. Cap your self-work intake." },
  { level: 12, entrepreneurship: 4, energy: 6, production: 4, companies: 1, newAction: "Bank 4 SP for the level 13 energy push." },
  { level: 13, entrepreneurship: 4, energy: 7, production: 4, companies: 1, newAction: "Energy → 7." },
  { level: 14, entrepreneurship: 4, energy: 7, production: 5, companies: 1, newAction: "Production → 5." },
  { level: 15, entrepreneurship: 4, energy: 7, production: 5, companies: 2, newAction: "Companies → 2 (factory cap = 4). End of the prescriptive plan." },
];

export function targetForLevel(level: number): LevelTarget {
  if (level < LEVEL_PLAN[0].level) return LEVEL_PLAN[0];
  for (let i = LEVEL_PLAN.length - 1; i >= 0; i--) {
    if (LEVEL_PLAN[i].level <= level) return LEVEL_PLAN[i];
  }
  return LEVEL_PLAN[0];
}

export function spCostFor(skillLevel: number): number {
  if (skillLevel <= 0) return 0;
  return (skillLevel * (skillLevel + 1)) / 2;
}

export function spDelta(fromLevel: number, toLevel: number): number {
  if (toLevel <= fromLevel) return 0;
  return spCostFor(toLevel) - spCostFor(fromLevel);
}

export function isBankLevel(level: number): boolean {
  if (level <= LEVEL_PLAN[0].level) return false;
  const cur = targetForLevel(level);
  const prev = targetForLevel(level - 1);
  return cur.entrepreneurship === prev.entrepreneurship
    && cur.energy === prev.energy
    && cur.production === prev.production
    && cur.companies === prev.companies;
}

export type NextSpJump = {
  atLevel: number;
  skill: EcoSkillKey;
  toLevel: number;
  cost: number;
};

export function nextSpJump(level: number): NextSpJump | null {
  const cur = targetForLevel(level);
  const lastLevel = LEVEL_PLAN[LEVEL_PLAN.length - 1].level;
  const keys: EcoSkillKey[] = ["entrepreneurship", "energy", "production", "companies"];
  for (let l = level + 1; l <= lastLevel; l++) {
    const t = targetForLevel(l);
    for (const k of keys) {
      if (t[k] > cur[k]) {
        return { atLevel: l, skill: k, toLevel: t[k], cost: spDelta(cur[k], t[k]) };
      }
    }
  }
  return null;
}

export function labelForSkill(k: EcoSkillKey): string {
  if (k === "entrepreneurship") return "Entrepreneurship";
  if (k === "energy") return "Energy";
  if (k === "production") return "Production";
  return "Companies limit";
}
