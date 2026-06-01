import { z } from "zod";

const RawItem = z.object({
  type: z.string().optional(),
  productionPoints: z.number().optional(),
  productionNeeds: z.record(z.string(), z.number()).optional(),
  isTradable: z.boolean().optional(),
  rarity: z.string().optional(),
});

const RawUpgradeLevel = z.object({
  level: z.number(),
  steelCost: z.number().optional(),
  constructionPointsCost: z.number().optional(),
  stats: z.record(z.string(), z.number()).optional(),
});

export const GameConfigSchema = z.object({
  items: z.record(z.string(), RawItem),
  upgradesConfig: z.object({
    automatedEngine: z.object({ levels: z.record(z.string(), RawUpgradeLevel) }),
    storage: z.object({ levels: z.record(z.string(), RawUpgradeLevel) }).optional(),
    breakRoom: z.object({ levels: z.record(z.string(), RawUpgradeLevel) }).optional(),
  }),
  company: z
    .object({
      constructionCostIncreasePerCompany: z.number().optional(),
      changeItemCost: z.number().optional(),
      moveCost: z.number().optional(),
    })
    .optional(),
  user: z.object({ maxConstructionPoints: z.number().optional(), marketMinLevel: z.number().optional() }).optional(),
  skills: z
    .object({
      companies: z.object({ levels: z.record(z.string(), z.object({ value: z.number().optional() })) }).optional(),
    })
    .optional(),
});

export const PricesSchema = z.record(z.string(), z.number());

const RawSkill = z.object({
  level: z.number().optional(),
  total: z.number().nullish(),
  value: z.number().nullish(),
  hourlyBarRegen: z.number().optional(),
});

export const UserSchema = z.object({
  _id: z.string(),
  username: z.string().optional(),
  avatarUrl: z.string().optional(),
  country: z.string().optional(),
  company: z.string().nullish(),
  leveling: z
    .object({
      level: z.number().optional(),
      availableSkillPoints: z.number().optional(),
      spentSkillPoints: z.number().optional(),
    })
    .optional(),
  skills: z.record(z.string(), RawSkill).optional(),
  stats: z
    .object({
      wealth: z.object({ money: z.number().optional() }).optional(),
    })
    .optional(),
});

export const SearchSchema = z.object({ userIds: z.array(z.string()).optional() });

export const CountrySchema = z.object({
  _id: z.string(),
  name: z.string().optional(),
  code: z.string().optional(),
  taxes: z.object({ income: z.number().optional() }).nullish(),
});

export const RegionSchema = z.object({
  _id: z.string(),
  name: z.string().optional(),
  biome: z.string().optional(),
  countryCode: z.string().optional(),
  country: z.string().optional(),
});

const CompanyListItem = z.union([z.string(), z.object({ _id: z.string().optional() })]);
export const CompanyListSchema = z.object({ items: z.array(CompanyListItem).optional() });

export const CompanySchema = z.object({
  _id: z.string(),
  name: z.string().optional(),
  itemCode: z.string(),
  activeUpgradeLevels: z
    .object({
      automatedEngine: z.number().optional(),
      storage: z.number().optional(),
      breakRoom: z.number().optional(),
    })
    .optional(),
  production: z.number().optional(),
  workerCount: z.number().optional(),
  region: z.string().optional(),
  estimatedValue: z.number().optional(),
});

export type RawUser = z.infer<typeof UserSchema>;
export type RawCompany = z.infer<typeof CompanySchema>;
export type RawRegion = z.infer<typeof RegionSchema>;
export type RawGameConfig = z.infer<typeof GameConfigSchema>;
