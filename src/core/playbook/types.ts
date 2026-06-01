import type { GameRules, PlayerProfile } from "@/api/warera/types";
import type { Advice, Goal, Inventory, Prices } from "@/core/engine/engine";

type TipCategory =
  | "build-order"
  | "skill-order"
  | "missions"
  | "work"
  | "sell"
  | "loot"
  | "hiring"
  | "storage"
  | "reinvest"
  | "chain"
  | "arbitrage";

type Severity = "info" | "suggest" | "warn";

export interface Rung {
  companies: number;
  ae: number;
}

export interface Playbook {
  id: string;
  name: string;
  source: string;
  description: string;
  starterOrder: string[];
  ladder: Rung[];
}

export interface PlaybookStep {
  satisfied: boolean;
  action: "build" | "upgrade" | "convert" | "skill" | "done";
  description: string;
  suggestedItem: string | null;
  factoryId: string | null;
  goal: Goal | null;
}

export interface AdvisorContext {
  profile: PlayerProfile;
  game: GameRules;
  prices: Prices;
  inventory: Inventory;
  facts: Advice;
  playbook: Playbook;
  step: PlaybookStep;
  missionsDone: boolean;
}

interface TipItem {
  code: string;
  qty: number;
  value: number;
}

export interface Tip {
  id: string;
  category: TipCategory;
  source: string;
  severity: Severity;
  title: string;
  detail: string;
  impact: number | null;
  items?: TipItem[];
}

export interface Rule {
  id: string;
  category: TipCategory;
  source: string;
  evaluate: (ctx: AdvisorContext) => Tip | Tip[] | null;
}
