import { trpcGet } from "./client";
import { GameConfigSchema, type RawGameConfig } from "./schemas";
import type { AeLevel, CapLevel, GameRules, Recipe } from "./types";

function capLevels(levels: RawGameConfig["upgradesConfig"]["automatedEngine"]["levels"], stat: string): CapLevel[] {
  return Object.values(levels).map((l) => ({
    level: l.level,
    steelCost: l.steelCost ?? 0,
    constructionPointsCost: l.constructionPointsCost ?? 0,
    value: l.stats?.[stat] ?? 0,
  }));
}

function parseRules(g: RawGameConfig): GameRules {
  const items: Record<string, Recipe> = {};
  for (const [code, it] of Object.entries(g.items)) {
    if (it.type !== "raw" && it.type !== "product") continue;
    if (typeof it.productionPoints !== "number" || it.productionPoints <= 0) continue;
    items[code] = {
      code,
      type: it.type,
      productionPoints: it.productionPoints,
      needs: it.productionNeeds ?? {},
      tradable: Boolean(it.isTradable),
      rarity: it.rarity ?? "common",
    };
  }

  const ae: AeLevel[] = Object.values(g.upgradesConfig.automatedEngine.levels).map((l) => ({
    level: l.level,
    steelCost: l.steelCost ?? 0,
    constructionPointsCost: l.constructionPointsCost ?? 0,
    dailyProd: l.stats?.dailyProd ?? 0,
  }));

  const factoryCap: number[] = [];
  for (const [level, lvl] of Object.entries(g.skills?.companies?.levels ?? {})) {
    factoryCap[Number(level)] = lvl.value ?? Number(level) + 2;
  }

  return {
    items,
    ae,
    storage: g.upgradesConfig.storage ? capLevels(g.upgradesConfig.storage.levels, "maxProduction") : [],
    breakRoom: g.upgradesConfig.breakRoom ? capLevels(g.upgradesConfig.breakRoom.levels, "maxWorkers") : [],
    constructionCostIncreasePerCompany: g.company?.constructionCostIncreasePerCompany ?? 50,
    maxConstructionPoints: g.user?.maxConstructionPoints ?? 30,
    marketMinLevel: g.user?.marketMinLevel ?? 7,
    changeItemCost: g.company?.changeItemCost ?? 5,
    moveCost: g.company?.moveCost ?? 5,
    factoryCap,
  };
}

export async function fetchRules(): Promise<GameRules> {
  const raw = await trpcGet("gameConfig.getGameConfig");
  return parseRules(GameConfigSchema.parse(raw));
}
