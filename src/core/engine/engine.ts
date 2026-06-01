import type { GameRules, PlayerProfile, Prices, Recipe } from "@/api/warera/types";

export type { Prices } from "@/api/warera/types";
export type Inventory = Record<string, number>;

export interface Goal {
  kind: "newFactory" | "aeUpgrade";
  factoryId?: string;
  targetLevel?: number;
}

interface FactoryOutput {
  id: string;
  name: string;
  item: string;
  ae: number;
  passivePerDay: number;
  workerPerDay: number;
  autoPerDay: number;
  inputDemand: Record<string, number>;
}

interface ChainRow {
  item: string;
  produced: number;
  consumed: number;
  net: number;
  tradable: boolean;
  pricePer: number | null;
  valuePerDay: number | null;
  advice: "sell" | "buy" | "balanced";
}

interface ArbRow {
  item: string;
  makeCost: number | null;
  sellPrice: number | null;
  margin: number | null;
  marginPct: number | null;
  verdict: "process" | "sell-raw" | "unknown";
}

interface WorkRow {
  factoryId: string;
  name: string;
  item: string;
  unitsPerDay: number;
  valuePerDay: number | null;
}

interface InvestRow {
  label: string;
  factoryId: string | null;
  factoryName: string;
  targetAe: number;
  item: string | null;
  steelCost: number;
  cashCost: number | null;
  gainUnitsPerDay: number;
  gainPerDay: number | null;
  paybackDays: number | null;
}

interface GoalNeed {
  item: string;
  need: number;
  have: number;
  gap: number;
  produces: boolean;
  netPerDay: number | null;
  daysToAccumulate: number | null;
  buyCost: number | null;
}

export interface GoalPlan {
  title: string;
  material: string | null;
  constructionPointsGate: number;
  needs: GoalNeed[];
  cashToBuy: number | null;
  fundable: boolean;
  sellSuggestions: { item: string; qty: number; value: number }[];
}

function outputPerDay(rules: GameRules, profile: PlayerProfile): FactoryOutput[] {
  return profile.factories.map((f) => {
    const recipe = rules.items[f.item];
    const points = recipe?.productionPoints ?? 1;
    const aeLevel = rules.ae.find((a) => a.level === f.ae);
    const passivePts = aeLevel?.dailyProd ?? 0;
    const passivePerDay = passivePts / points;
    const workerPerDay = f.workerPointsPerDay / points;
    const autoPerDay = passivePerDay + workerPerDay;
    const inputDemand: Record<string, number> = {};
    if (recipe) {
      for (const [k, v] of Object.entries(recipe.needs)) inputDemand[k] = v * autoPerDay;
    }
    return { id: f.id, name: f.name, item: f.item, ae: f.ae, passivePerDay, workerPerDay, autoPerDay, inputDemand };
  });
}

interface Flows {
  produced: Record<string, number>;
  consumed: Record<string, number>;
}

function flows(outputs: FactoryOutput[]): Flows {
  const produced: Record<string, number> = {};
  const consumed: Record<string, number> = {};
  for (const o of outputs) {
    produced[o.item] = (produced[o.item] ?? 0) + o.autoPerDay;
    for (const [k, v] of Object.entries(o.inputDemand)) consumed[k] = (consumed[k] ?? 0) + v;
  }
  return { produced, consumed };
}

function chainBalance(f: Flows, rules: GameRules, prices: Prices): ChainRow[] {
  const { produced, consumed } = f;
  const items = new Set([...Object.keys(produced), ...Object.keys(consumed)]);
  const rows: ChainRow[] = [];
  for (const item of items) {
    const p = produced[item] ?? 0;
    const c = consumed[item] ?? 0;
    const net = p - c;
    const recipe: Recipe | undefined = rules.items[item];
    const price = prices[item] ?? null;
    let advice: ChainRow["advice"] = "balanced";
    if (net > 0.05) advice = "sell";
    else if (net < -0.05) advice = "buy";
    rows.push({
      item,
      produced: p,
      consumed: c,
      net,
      tradable: recipe?.tradable ?? false,
      pricePer: price,
      valuePerDay: price === null ? null : Math.abs(net) * price,
      advice,
    });
  }
  return rows.sort((a, b) => (b.valuePerDay ?? 0) - (a.valuePerDay ?? 0));
}

function arbitrage(rules: GameRules, prices: Prices): ArbRow[] {
  const rows: ArbRow[] = [];
  for (const recipe of Object.values(rules.items)) {
    if (recipe.type !== "product") continue;
    const sellPrice = prices[recipe.code] ?? null;
    let makeCost: number | null = 0;
    for (const [k, v] of Object.entries(recipe.needs)) {
      const ip = prices[k];
      if (ip === undefined) {
        makeCost = null;
        break;
      }
      makeCost += ip * v;
    }
    let margin: number | null = null;
    let marginPct: number | null = null;
    let verdict: ArbRow["verdict"] = "unknown";
    if (makeCost !== null && sellPrice !== null) {
      margin = sellPrice - makeCost;
      marginPct = makeCost > 0 ? (margin / makeCost) * 100 : null;
      verdict = margin >= 0 ? "process" : "sell-raw";
    }
    rows.push({ item: recipe.code, makeCost, sellPrice, margin, marginPct, verdict });
  }
  return rows.sort((a, b) => (b.margin ?? -Infinity) - (a.margin ?? -Infinity));
}

function bestWork(profile: PlayerProfile, rules: GameRules, prices: Prices): WorkRow[] {
  const manualPts = profile.pointsPerWork * profile.worksPerDay;
  const rows: WorkRow[] = [];
  for (const f of profile.factories) {
    const recipe = rules.items[f.item];
    const points = recipe?.productionPoints ?? 1;
    const unitsPerDay = manualPts / points;
    let valuePerDay: number | null = null;
    const sell = prices[f.item];
    if (sell !== undefined && recipe) {
      let inputCost = 0;
      let known = true;
      for (const [k, v] of Object.entries(recipe.needs)) {
        const ip = prices[k];
        if (ip === undefined) {
          known = false;
          break;
        }
        inputCost += ip * v;
      }
      if (known) valuePerDay = unitsPerDay * (sell - inputCost);
    }
    rows.push({ factoryId: f.id, name: f.name, item: f.item, unitsPerDay, valuePerDay });
  }
  return rows.sort((a, b) => (b.valuePerDay ?? -Infinity) - (a.valuePerDay ?? -Infinity));
}

function bestInvestment(profile: PlayerProfile, rules: GameRules, prices: Prices): InvestRow[] {
  const rows: InvestRow[] = [];
  const steelPrice = prices.steel ?? null;
  for (const f of profile.factories) {
    const recipe = rules.items[f.item];
    const points = recipe?.productionPoints ?? 1;
    const cur = rules.ae.find((a) => a.level === f.ae);
    const next = rules.ae.find((a) => a.level === f.ae + 1);
    if (!cur || !next) continue;
    const gainUnitsPerDay = (next.dailyProd - cur.dailyProd) / points;
    const sell = prices[f.item];
    let margin: number | null = null;
    if (sell !== undefined && recipe) {
      let inputCost = 0;
      let known = true;
      for (const [k, v] of Object.entries(recipe.needs)) {
        const ip = prices[k];
        if (ip === undefined) {
          known = false;
          break;
        }
        inputCost += ip * v;
      }
      if (known) margin = sell - inputCost;
    }
    const gainPerDay = margin === null ? null : gainUnitsPerDay * margin;
    const cashCost = steelPrice === null ? null : next.steelCost * steelPrice;
    const paybackDays = gainPerDay && gainPerDay > 0 && cashCost !== null ? cashCost / gainPerDay : null;
    rows.push({
      label: `${f.name} → Automated Engine ${next.level}`,
      factoryId: f.id,
      factoryName: f.name,
      targetAe: next.level,
      item: f.item,
      steelCost: next.steelCost,
      cashCost,
      gainUnitsPerDay,
      gainPerDay,
      paybackDays,
    });
  }
  return rows.sort((a, b) => {
    if (a.paybackDays === null) return 1;
    if (b.paybackDays === null) return -1;
    return a.paybackDays - b.paybackDays;
  });
}

function goalPlan(
  goal: Goal,
  profile: PlayerProfile,
  rules: GameRules,
  prices: Prices,
  inventory: Inventory,
  f: Flows,
): GoalPlan {
  const needMap: Record<string, number> = {};
  let constructionPointsGate = 0;
  let material: string | null;
  let title: string;

  if (goal.kind === "newFactory") {
    material = "concrete";
    needMap.concrete = rules.constructionCostIncreasePerCompany * (profile.factories.length + 1);
    title = `Build company #${profile.factories.length + 1}`;
  } else {
    material = "steel";
    const fac = profile.factories.find((x) => x.id === goal.factoryId);
    const target = goal.targetLevel ?? (fac ? fac.ae + 1 : 1);
    title = fac ? `${fac.name} → AE${target}` : `Upgrade → AE${target}`;
    if (fac) {
      let steel = 0;
      for (const lvl of rules.ae) {
        if (lvl.level > fac.ae && lvl.level <= target) {
          steel += lvl.steelCost;
          constructionPointsGate += lvl.constructionPointsCost;
        }
      }
      if (steel > 0) needMap.steel = steel;
    }
  }

  const producedItems = new Set(profile.factories.map((x) => x.item));
  const needs: GoalNeed[] = Object.entries(needMap).map(([item, need]) => {
    const have = inventory[item] ?? 0;
    const gap = Math.max(0, need - have);
    const produces = producedItems.has(item);
    const net = (f.produced[item] ?? 0) - (f.consumed[item] ?? 0);
    const netPerDay = produces ? net : null;
    const daysToAccumulate = produces && netPerDay && netPerDay > 0 ? gap / netPerDay : null;
    const price = prices[item];
    const buyCost = produces || price === undefined ? null : gap * price;
    return { item, need, have, gap, produces, netPerDay, daysToAccumulate, buyCost };
  });

  const buyCosts = needs.filter((n) => !n.produces).map((n) => n.buyCost);
  const cashToBuy = buyCosts.some((c) => c === null) ? null : buyCosts.reduce((s: number, c) => s + (c ?? 0), 0);

  const neededItems = new Set(Object.keys(needMap));
  const sellSuggestions =
    cashToBuy && cashToBuy > 0
      ? Object.entries(inventory)
          .filter(([item, qty]) => qty > 0 && !neededItems.has(item) && prices[item] !== undefined)
          .map(([item, qty]) => ({ item, qty, value: qty * (prices[item] ?? 0) }))
          .sort((a, b) => b.value - a.value)
      : [];

  const sellableTotal = sellSuggestions.reduce((s, x) => s + x.value, 0);
  const cash = profile.money ?? 0;
  const fundable = cashToBuy === null ? false : cash + sellableTotal >= cashToBuy;

  return { title, material, constructionPointsGate, needs, cashToBuy, fundable, sellSuggestions };
}

export interface Advice {
  outputs: FactoryOutput[];
  chain: ChainRow[];
  arbitrage: ArbRow[];
  work: WorkRow[];
  investment: InvestRow[];
  goal: GoalPlan | null;
}

export function advise(
  profile: PlayerProfile,
  rules: GameRules,
  prices: Prices,
  inventory: Inventory,
  goal: Goal | null,
): Advice {
  const outputs = outputPerDay(rules, profile);
  const f = flows(outputs);
  return {
    outputs,
    chain: chainBalance(f, rules, prices),
    arbitrage: arbitrage(rules, prices),
    work: bestWork(profile, rules, prices),
    investment: bestInvestment(profile, rules, prices),
    goal: goal ? goalPlan(goal, profile, rules, prices, inventory, f) : null,
  };
}
