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

const LEVEL_PLAN: LevelTarget[] = [
  {
    level: 1,
    entrepreneurship: 0,
    energy: 1,
    production: 2,
    companies: 0,
    newAction:
      "Production → 2, Energy → 1. Convert the starter company to limestone — it's free to self-produce and feeds the concrete chain.",
  },
  {
    level: 2,
    entrepreneurship: 0,
    energy: 2,
    production: 2,
    companies: 0,
    newAction: "Energy → 2. Bank 2 SP for level 3's Production + Energy double-up.",
  },
  {
    level: 3,
    entrepreneurship: 0,
    energy: 3,
    production: 3,
    companies: 0,
    newAction: "Production → 3, Energy → 3. Once you've stockpiled enough concrete, build company #2 as concrete.",
  },
  {
    level: 4,
    entrepreneurship: 0,
    energy: 3,
    production: 4,
    companies: 0,
    newAction: "Production → 4. Push companies 1-2 toward AE3 each.",
  },
  {
    level: 5,
    entrepreneurship: 0,
    energy: 3,
    production: 4,
    companies: 1,
    newAction: "Companies → 1 (company cap 3). Build company #3 as iron. Bank 3 SP toward Production 5 next level.",
  },
  {
    level: 6,
    entrepreneurship: 0,
    energy: 3,
    production: 5,
    companies: 1,
    newAction: "Production → 5 (uses banked + new SP).",
  },
  {
    level: 7,
    entrepreneurship: 1,
    energy: 4,
    production: 5,
    companies: 1,
    newAction: "Energy → 4, Entrepreneurship → 1. Self-work hours come online.",
  },
  {
    level: 8,
    entrepreneurship: 2,
    energy: 4,
    production: 5,
    companies: 1,
    newAction: "Entrepreneurship → 2. Bank 3 SP toward Production 6 next level.",
  },
  { level: 9, entrepreneurship: 2, energy: 4, production: 6, companies: 1, newAction: "Production → 6." },
  {
    level: 10,
    entrepreneurship: 2,
    energy: 5,
    production: 6,
    companies: 1,
    newAction:
      "Energy → 5. By now companies 1-3 should be at AE4 — start company #4 as steel once Companies skill allows.",
  },
  {
    level: 11,
    entrepreneurship: 2,
    energy: 5,
    production: 6,
    companies: 1,
    newAction: "Bank all 4 SP. Level 12 needs Production 7 in one shot (7 SP).",
  },
  {
    level: 12,
    entrepreneurship: 2,
    energy: 5,
    production: 7,
    companies: 1,
    newAction: "Production → 7. Top of the production curve.",
  },
  {
    level: 13,
    entrepreneurship: 2,
    energy: 5,
    production: 7,
    companies: 1,
    newAction: "Bank all 4 SP. Level 14 closes Energy → 6 + Companies → 2.",
  },
  {
    level: 14,
    entrepreneurship: 2,
    energy: 6,
    production: 7,
    companies: 2,
    newAction:
      "Energy → 6, Companies → 2 (company cap 4). Eco core skills locked in. Build company #4 = steel if not already.",
  },
  {
    level: 15,
    entrepreneurship: 2,
    energy: 6,
    production: 7,
    companies: 3,
    newAction:
      "Companies → 3 (company cap 5). Build company #5. End of the prescriptive plan — from level 16 push Companies → 4 for a 6th company, then drag the whole set to AE5/AE6.",
  },
];

export const PLAN_MAX_LEVEL = LEVEL_PLAN[LEVEL_PLAN.length - 1].level;

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
  return (
    cur.entrepreneurship === prev.entrepreneurship &&
    cur.energy === prev.energy &&
    cur.production === prev.production &&
    cur.companies === prev.companies
  );
}

export function labelForSkill(k: EcoSkillKey): string {
  if (k === "entrepreneurship") return "Entrepreneurship";
  if (k === "energy") return "Energy";
  if (k === "production") return "Production";
  return "Companies limit";
}
