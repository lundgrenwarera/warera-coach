import { isBankLevel, labelForSkill, nextSpJump, SP_PER_LEVEL } from "./levels";
import { SOURCES, type SourceRef } from "./sources";
import type { SkillAudit } from "./skills";
import type { FactoryAction } from "./factories";

export type DailyAction = {
  id: string;
  title: string;
  detail: string;
  source: SourceRef;
};

export function dailyChecklist(args: {
  audit: SkillAudit;
  factoryAction: FactoryAction;
}): DailyAction[] {
  const out: DailyAction[] = [];

  pushSkillAction(out, args.audit);
  pushFactoryAction(out, args.factoryAction);
  pushMissionsAndRituals(out, args.audit.level);

  return out;
}

function pushSkillAction(out: DailyAction[], audit: SkillAudit) {
  const behind = audit.rows.find((r) => r.status === "behind");
  if (behind && audit.availableSP >= behind.spToReach) {
    out.push({
      id: "spend-sp",
      title: `Spend ${behind.spToReach} SP: ${behind.label} → ${behind.target}`,
      detail: `You have ${audit.availableSP} SP available. The level ${audit.target.level} target wants ${behind.label} at ${behind.target}.`,
      source: SOURCES.buhDeuce,
    });
    return;
  }
  if (isBankLevel(audit.level) && audit.matches && audit.availableSP > 0) {
    out.push({
      id: "hold-sp",
      title: `Hold all ${audit.availableSP} points. Do not spend.`,
      detail: explainBank(audit.level, audit.availableSP),
      source: SOURCES.buhDeuce,
    });
    return;
  }
  if (audit.availableSP >= SP_PER_LEVEL && audit.matches) {
    out.push({
      id: "bank-sp",
      title: `Bank ${audit.availableSP} SP for the next level`,
      detail: explainBankNextLevel(audit.target.level, audit.level),
      source: SOURCES.buhDeuce,
    });
  }
}

function pushFactoryAction(out: DailyAction[], action: FactoryAction) {
  if (action.kind === "convert") {
    out.push({
      id: `convert-${action.id}`,
      title: `Convert ${action.name}: ${action.currentItem} → ${action.targetItem}`,
      detail: action.reason,
      source: SOURCES.buhDeuce,
    });
  } else if (action.kind === "upgrade") {
    out.push({
      id: `upgrade-${action.id}`,
      title: `Upgrade ${action.name}: AE${action.currentAE} → ${action.targetAE}`,
      detail: action.reason,
      source: SOURCES.buhDeuce,
    });
  } else if (action.kind === "build") {
    out.push({
      id: "build-factory",
      title: `Build factory: ${action.itemCode}`,
      detail: `${action.reason} Estimated cost: ~${action.estimatedCost} coin in concrete.`,
      source: SOURCES.buhDeuce,
    });
  }
}

function pushMissionsAndRituals(out: DailyAction[], level: number) {
  if (level < 10) {
    out.push({
      id: "starter-missions",
      title: "Burn through any starter missions you still have",
      detail: "There are 14 one-shot starter missions. Completing 10 of them triggers the biggest XP and coin lump-sum reward you can get. Do these before anything optional.",
      source: SOURCES.ultimateNew,
    });
  }
  if (level < 15) {
    out.push({
      id: "sell-starter-resources",
      title: "Sell starter bullets and food for cash",
      detail: "BuhDeuce: your damage is neglectful at this stage, so combat resources are dead weight. Liquidate them and pour the coin into the next factory build or AE upgrade.",
      source: SOURCES.buhDeuce,
    });
  }
  out.push({
    id: "daily-missions",
    title: "Clear 7+ daily missions today",
    detail: "Missions are your #1 leveling lever. The 7-mission threshold unlocks a coin and case bonus on top of per-mission XP. Re-roll the first one for free if it costs more than the reward.",
    source: SOURCES.ultimateNew,
  });
  out.push({
    id: "weekly-missions",
    title: "Knock out any weekly mission you can today",
    detail: "Weeklies cap at 2,000 XP per week. Finish them as early as possible so they don't roll over wasted. Same playbook as dailies: re-roll the unreasonable ones.",
    source: SOURCES.devGuide,
  });
  out.push({
    id: "daily-work",
    title: "Work 2-3 times today",
    detail: "Energy refills 10% per hour. Spend it on the highest-paying work offer you qualify for. Do not leave the bar capped. Wasted energy is wasted XP and coin.",
    source: SOURCES.ultimateNew,
  });
  out.push({
    id: "daily-case-loot",
    title: "Open the free daily case → scrap green/blue, sell purple+",
    detail: "BuhDeuce loot-box rule: open the box, scrap green and blue items for crafting scrap, sell purple and above to market for instant cash. Equipment isn't useful yet — cash now compounds.",
    source: SOURCES.buhDeuce,
  });
  out.push({
    id: "factory-placement",
    title: "Park each factory in the best bonus + safest region",
    detail: "BuhDeuce: set each company in the highest production-bonus region you can reach, and prefer the country capital for occupation safety. Output gain is permanent until you move it.",
    source: SOURCES.buhDeuce,
  });
  out.push({
    id: "storage-watch",
    title: "Upgrade any storage that's full before anything else",
    detail: "BuhDeuce: a full storage means a factory is wasting production. Storage upgrades jump the queue ahead of AE upgrades when output is capped.",
    source: SOURCES.buhDeuce,
  });
}

function explainBank(level: number, availableSP: number): string {
  const jump = nextSpJump(level);
  if (!jump) return `Level ${level} is a banking level. Save your points for the next allocation.`;
  return `Level ${level} is a banking level. Your ${availableSP} points stay on the bench. Level ${jump.atLevel} needs ${jump.cost} points in one shot to push ${labelForSkill(jump.skill)} → ${jump.toLevel}. Spending now means resetting later.`;
}

function explainBankNextLevel(targetLevel: number, currentLevel: number): string {
  const jump = nextSpJump(currentLevel);
  if (!jump) return `Build matches the level ${targetLevel} target.`;
  return `Build matches the level ${targetLevel} target. Save the points. Level ${jump.atLevel} wants ${labelForSkill(jump.skill)} → ${jump.toLevel} (costs ${jump.cost} SP).`;
}
