export type Prices = Record<string, number>;

export interface Recipe {
  code: string;
  type: "raw" | "product";
  productionPoints: number;
  needs: Record<string, number>;
  tradable: boolean;
  rarity: string;
}

export interface AeLevel {
  level: number;
  steelCost: number;
  constructionPointsCost: number;
  dailyProd: number;
}

export interface CapLevel {
  level: number;
  steelCost: number;
  constructionPointsCost: number;
  value: number;
}

export interface GameRules {
  items: Record<string, Recipe>;
  ae: AeLevel[];
  storage: CapLevel[];
  breakRoom: CapLevel[];
  constructionCostIncreasePerCompany: number;
  maxConstructionPoints: number;
  marketMinLevel: number;
  changeItemCost: number;
  moveCost: number;
  factoryCap: number[];
}

export function factoryCapFor(rules: GameRules, companiesSkill: number): number {
  return rules.factoryCap[companiesSkill] ?? companiesSkill + 2;
}

export interface FactoryRegion {
  name: string;
  terrain: string;
  countryCode: string | null;
  tax: number | null;
}

export interface Factory {
  id: string;
  name: string;
  item: string;
  ae: number;
  storage: number;
  breakRoom: number;
  stock: number;
  workerCount: number;
  workerPointsPerDay: number;
  workerWageWeightedPoints: number;
  estimatedValue: number;
  region: FactoryRegion | null;
}

export interface SkillLevels {
  production: number;
  energy: number;
  entrepreneurship: number;
  companies: number;
  management: number;
}

export interface PlayerProfile {
  userId: string;
  username: string;
  avatarUrl: string | null;
  countryId: string | null;
  level: number | null;
  availableSkillPoints: number;
  spentSkillPoints: number;
  money: number | null;
  pointsPerWork: number;
  worksPerDay: number;
  hasJob: boolean;
  skills: SkillLevels;
  skillValues: SkillLevels;
  allSkills: Record<string, number>;
  factories: Factory[];
}
