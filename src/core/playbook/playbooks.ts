import type { PlayerProfile } from "@/api/warera/types";
import { itemLabel } from "@/shared/lib/items";
import type { Playbook, PlaybookStep } from "./types";

const STARTER_ORDER = ["limestone", "concrete", "iron", "steel"];

export const PLAYBOOKS: Playbook[] = [
  {
    id: "buhdeuce-eco",
    name: "BuhDeuce · Full Economy",
    source: "BuhDeuce Economic Guide",
    description: "Scale to 12 companies at AE7. Build fast, reinvest every dollar.",
    starterOrder: STARTER_ORDER,
    ladder: [
      { companies: 1, ae: 3 },
      { companies: 2, ae: 3 },
      { companies: 3, ae: 3 },
      { companies: 3, ae: 4 },
      { companies: 4, ae: 4 },
      { companies: 5, ae: 4 },
      { companies: 6, ae: 4 },
      { companies: 6, ae: 5 },
      { companies: 6, ae: 6 },
      { companies: 10, ae: 5 },
      { companies: 10, ae: 6 },
      { companies: 12, ae: 6 },
      { companies: 12, ae: 7 },
    ],
  },
  {
    id: "buhdeuce-war",
    name: "BuhDeuce · War Prep",
    source: "BuhDeuce Economic Guide",
    description: "Six self-sufficient companies at AE6, then fight.",
    starterOrder: STARTER_ORDER,
    ladder: [
      { companies: 1, ae: 3 },
      { companies: 2, ae: 3 },
      { companies: 3, ae: 3 },
      { companies: 3, ae: 4 },
      { companies: 4, ae: 4 },
      { companies: 5, ae: 4 },
      { companies: 6, ae: 4 },
      { companies: 6, ae: 5 },
      { companies: 6, ae: 6 },
    ],
  },
];

export function getPlaybook(id: string): Playbook {
  return PLAYBOOKS.find((p) => p.id === id) ?? PLAYBOOKS[0];
}

export function nextStep(profile: PlayerProfile, playbook: Playbook): PlaybookStep {
  const count = profile.factories.length;

  const expected = playbook.starterOrder.slice(0, Math.max(count, 1));
  const have = profile.factories.map((f) => f.item);
  const missing = expected.find((item) => !have.includes(item));
  if (missing) {
    const offPlan = profile.factories.find((f) => !expected.includes(f.item));
    if (offPlan) {
      return {
        satisfied: false,
        action: "convert",
        description: `Convert ${offPlan.name} from ${itemLabel(offPlan.item)} to ${itemLabel(missing)}.`,
        suggestedItem: missing,
        factoryId: offPlan.id,
        goal: null,
      };
    }
  }

  for (const rung of playbook.ladder) {
    if (count < rung.companies) {
      const n = count + 1;
      const suggestedItem = playbook.starterOrder[n - 1] ?? null;
      return {
        satisfied: false,
        action: "build",
        description: suggestedItem ? `Build company #${n} producing ${suggestedItem}.` : `Build company #${n}.`,
        suggestedItem,
        factoryId: null,
        goal: { kind: "newFactory" },
      };
    }
    const behind = profile.factories.filter((f) => f.ae < rung.ae).sort((a, b) => a.ae - b.ae);
    if (behind.length > 0) {
      const f = behind[0];
      return {
        satisfied: false,
        action: "upgrade",
        description: `Upgrade ${f.name} to Automated Engine ${rung.ae}.`,
        suggestedItem: f.item,
        factoryId: f.id,
        goal: { kind: "aeUpgrade", factoryId: f.id, targetLevel: rung.ae },
      };
    }
  }
  return {
    satisfied: true,
    action: "done",
    description: `${playbook.name} complete.`,
    suggestedItem: null,
    factoryId: null,
    goal: null,
  };
}
