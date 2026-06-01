import { itemLabel } from "@/shared/lib/items";
import type { AdvisorContext, Rule, Tip } from "./types";

const SOURCE = "BuhDeuce Economic Guide";
const KEEP_FOR_BUILD = new Set(["concrete", "limestone", "iron", "steel"]);

function hasMarket(ctx: AdvisorContext): boolean {
  return (ctx.profile.level ?? 1) >= ctx.game.marketMinLevel;
}

export const RULES: Rule[] = [
  {
    id: "missions-first",
    category: "missions",
    source: SOURCE,
    evaluate(ctx) {
      if (hasMarket(ctx)) return null;
      if (ctx.missionsDone) return null;
      return {
        id: "missions-first",
        category: "missions",
        source: SOURCE,
        severity: "warn",
        title: "Complete missions",
        detail: "Finish your starter missions, dailies and weeklies.",
        impact: null,
      };
    },
  },
  {
    id: "get-a-job",
    category: "work",
    source: SOURCE,
    evaluate(ctx) {
      if (ctx.profile.hasJob) return null;
      return {
        id: "get-a-job",
        category: "work",
        source: SOURCE,
        severity: "warn",
        title: "Get a job",
        detail:
          "Find the highest-paying job you qualify for and spend your Energy there. Switch whenever a better wage appears.",
        impact: null,
      };
    },
  },
  {
    id: "sell-for-cash",
    category: "sell",
    source: SOURCE,
    evaluate(ctx) {
      if (!hasMarket(ctx)) return null;
      if (ctx.profile.factories.length >= 6) return null;
      const items = Object.entries(ctx.inventory)
        .filter(([code, qty]) => qty > 0 && !KEEP_FOR_BUILD.has(code) && (ctx.prices[code] ?? 0) > 0)
        .map(([code, qty]) => ({ code, qty, value: qty * (ctx.prices[code] ?? 0) }))
        .sort((a, b) => b.value - a.value);
      if (items.length === 0) return null;

      const total = items.reduce((s, i) => s + i.value, 0);
      const base = {
        id: "sell-for-cash",
        category: "sell" as const,
        source: SOURCE,
        severity: "suggest" as const,
        impact: total,
        items,
      };

      const need = ctx.facts.goal?.needs[0];
      const buildable = ctx.step.action === "build" || ctx.step.action === "upgrade";
      if (buildable && need && need.gap > 0) {
        const gapCost = need.gap * (ctx.prices[need.item] ?? Infinity);
        if ((ctx.profile.money ?? 0) + total >= gapCost) {
          return {
            ...base,
            title: `Sell these to unlock ${ctx.facts.goal?.title}`,
            detail: `Selling them covers the ${Math.round(need.gap)} ${itemLabel(need.item)} you still need (≈ $${gapCost.toFixed(0)}).`,
          };
        }
      }
      return {
        ...base,
        title: `Sell these for cash · ≈ $${total.toFixed(0)}`,
        detail:
          "Sell everything except your construction chain (limestone, concrete, iron, steel); reinvest into companies and AE upgrades.",
      };
    },
  },
  {
    id: "storage-pressure",
    category: "storage",
    source: SOURCE,
    evaluate(ctx) {
      const tips: Tip[] = [];
      for (const f of ctx.profile.factories) {
        const cap = ctx.game.storage.find((s) => s.level === f.storage)?.value;
        if (cap && cap > 0 && f.stock >= cap * 0.9) {
          tips.push({
            id: `storage:${f.id}`,
            category: "storage",
            source: SOURCE,
            severity: "warn",
            title: `${f.name} storage is ${Math.round((f.stock / cap) * 100)}% full`,
            detail: "Upgrade storage before output overflows.",
            impact: null,
          });
        }
      }
      return tips;
    },
  },
  {
    id: "reinvest-idle-cash",
    category: "reinvest",
    source: SOURCE,
    evaluate(ctx) {
      if (!hasMarket(ctx)) return null;
      const cash = ctx.profile.money ?? 0;
      const cheapestUpgrade = ctx.facts.investment.find((i) => i.cashCost !== null);
      if (!cheapestUpgrade || cheapestUpgrade.cashCost === null) return null;
      if (cash < cheapestUpgrade.cashCost) return null;
      return {
        id: "reinvest-idle-cash",
        category: "reinvest",
        source: SOURCE,
        severity: "suggest",
        title: `You can afford ${cheapestUpgrade.label} now`,
        detail: `$${cash.toFixed(0)} on hand covers this upgrade (≈ $${cheapestUpgrade.cashCost.toFixed(0)}, +$${(cheapestUpgrade.gainPerDay ?? 0).toFixed(2)}/day).`,
        impact: cheapestUpgrade.gainPerDay,
      };
    },
  },
  {
    id: "surplus-raw",
    category: "chain",
    source: SOURCE,
    evaluate(ctx) {
      if (!hasMarket(ctx) || ctx.profile.factories.length < 6) return [];
      const protect = new Set<string>();
      for (const n of ctx.facts.goal?.needs ?? []) {
        if (n.gap > 0) protect.add(n.item);
      }
      const nextItem = ctx.step.suggestedItem;
      if (nextItem) {
        for (const k of Object.keys(ctx.game.items[nextItem]?.needs ?? {})) protect.add(k);
      }
      return ctx.facts.chain
        .filter((r) => r.advice === "sell" && r.tradable && (r.valuePerDay ?? 0) > 0 && !protect.has(r.item))
        .slice(0, 3)
        .map((r) => ({
          id: `surplus:${r.item}`,
          category: "chain" as const,
          source: SOURCE,
          severity: "suggest" as const,
          title: `Surplus ${itemLabel(r.item)}: +${r.net.toFixed(1)}/day`,
          detail: `Sell the excess (≈ $${(r.valuePerDay ?? 0).toFixed(2)}/day) or add capacity that uses it.`,
          impact: r.valuePerDay,
        }));
    },
  },
  {
    id: "input-deficit",
    category: "chain",
    source: SOURCE,
    evaluate(ctx) {
      if (!hasMarket(ctx) || ctx.profile.factories.length < 6) return [];
      return ctx.facts.chain
        .filter((r) => r.advice === "buy" && (r.valuePerDay ?? 0) > 0)
        .slice(0, 3)
        .map((r) => ({
          id: `deficit:${r.item}`,
          category: "chain" as const,
          source: SOURCE,
          severity: "info" as const,
          title: `Input gap: ${itemLabel(r.item)} short ${Math.abs(r.net).toFixed(1)}/day`,
          detail: `Buy it (≈ $${(r.valuePerDay ?? 0).toFixed(2)}/day) or build a ${itemLabel(r.item)} company.`,
          impact: r.valuePerDay,
        }));
    },
  },
  {
    id: "negative-margin-process",
    category: "arbitrage",
    source: SOURCE,
    evaluate(ctx) {
      if (!hasMarket(ctx) || ctx.profile.factories.length < 6) return [];
      const made = new Set(ctx.profile.factories.map((f) => f.item));
      return ctx.facts.arbitrage
        .filter((a) => made.has(a.item) && a.verdict === "sell-raw" && a.margin !== null)
        .map((a) => ({
          id: `neg-margin:${a.item}`,
          category: "arbitrage" as const,
          source: SOURCE,
          severity: "warn" as const,
          title: `${itemLabel(a.item)} loses money to craft right now`,
          detail: `Sell the raw inputs instead of crafting until prices recover.`,
          impact: a.margin,
        }));
    },
  },
];
