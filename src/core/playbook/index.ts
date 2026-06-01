import type { GameRules, PlayerProfile } from "@/api/warera/types";
import { factoryCapFor } from "@/api/warera/types";
import { type Advice, advise, type Goal, type Inventory, type Prices } from "@/core/engine/engine";
import { itemLabel } from "@/shared/lib/items";
import { getPlaybook, nextStep } from "./playbooks";
import { GUIDE } from "./reference";
import { RULES } from "./rules";
import type { AdvisorContext, PlaybookStep, Tip } from "./types";

const SEVERITY_RANK: Record<Tip["severity"], number> = { warn: 0, suggest: 1, info: 2 };

function evaluateTips(ctx: AdvisorContext): Tip[] {
  const tips = RULES.flatMap((r) => {
    const out = r.evaluate(ctx);
    if (!out) return [];
    return Array.isArray(out) ? out : [out];
  });
  return tips.sort((a, b) => {
    const s = SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity];
    if (s !== 0) return s;
    return (b.impact ?? 0) - (a.impact ?? 0);
  });
}

export interface AdvisorResult {
  facts: AdvisorContext["facts"];
  tips: Tip[];
  step: PlaybookStep;
}

function sellableValue(inventory: Inventory, prices: Prices, exclude: string): number {
  let v = 0;
  for (const [code, qty] of Object.entries(inventory)) {
    if (code === exclude) continue;
    v += qty * (prices[code] ?? 0);
  }
  return v;
}

function applyFactoryCap(
  step: PlaybookStep,
  facts: Advice,
  opts: { profile: PlayerProfile; game: GameRules; prices: Prices; inventory: Inventory },
): PlaybookStep {
  if (step.action !== "build") return step;
  const { profile, game, prices, inventory } = opts;
  const need = facts.goal?.needs[0];
  if (!need) return step;

  const cap = factoryCapFor(game, profile.skills.companies);
  const capped = profile.factories.length >= cap;

  if (need.gap <= 0) {
    if (capped) {
      return {
        ...step,
        action: "skill",
        description: `Materials ready, raise Companies skill to ${profile.skills.companies + 1} to unlock company #${cap + 1}.`,
      };
    }
    return step;
  }

  const hasMarket = (profile.level ?? 1) >= game.marketMinLevel;
  const price = prices[need.item];
  if (hasMarket && price !== undefined) {
    const gapCost = need.gap * price;
    if ((profile.money ?? 0) + sellableValue(inventory, prices, need.item) >= gapCost) {
      return {
        ...step,
        description: `Sell spare items and buy the ${Math.round(need.gap)} ${itemLabel(need.item)} you still need for company #${profile.factories.length + 1}.`,
      };
    }
  }

  return step;
}

export function runAdvisor(opts: {
  profile: PlayerProfile;
  game: GameRules;
  prices: Prices;
  inventory: Inventory;
  goal: Goal | null;
  playbookId: string;
  missionsDone: boolean;
}): AdvisorResult {
  const playbook = getPlaybook(opts.playbookId);
  const baseStep = nextStep(opts.profile, playbook);
  const goal = opts.goal ?? baseStep.goal;
  const facts = advise(opts.profile, opts.game, opts.prices, opts.inventory, goal);
  const step = applyFactoryCap(baseStep, facts, opts);
  const ctx: AdvisorContext = {
    profile: opts.profile,
    game: opts.game,
    prices: opts.prices,
    inventory: opts.inventory,
    facts,
    playbook,
    step,
    missionsDone: opts.missionsDone,
  };
  return { facts, tips: evaluateTips(ctx), step };
}

export { getPlaybook, nextStep, PLAYBOOKS } from "./playbooks";
export type { PlaybookStep, Rung, Tip } from "./types";
export { GUIDE };
