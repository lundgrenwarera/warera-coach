import { useMemo } from "react";
import { useDates } from "@/api/warera/queries";
import type { GameRules, PlayerProfile, Prices } from "@/api/warera/types";
import { PLAYBOOKS, runAdvisor } from "@/core/playbook";
import { Dashboard, type WidgetContext } from "@/features/dashboard";
import { missionsComplete } from "@/features/missions";
import { EMPTY_ROUTINE, useCoachStore } from "@/shared/lib/store";

const EMPTY: Record<string, number> = {};

export function Advisor({ profile, rules, prices }: { profile: PlayerProfile; rules: GameRules; prices: Prices }) {
  const userKey = profile.username.toLowerCase();
  const inventory = useCoachStore((s) => s.inventories[userKey]?.items) ?? EMPTY;
  const routine = useCoachStore((s) => s.routines[userKey]) ?? EMPTY_ROUTINE;
  const dates = useDates();
  const missionsDone = missionsComplete(routine, dates.data);

  const { facts, tips, step } = useMemo(
    () =>
      runAdvisor({ profile, game: rules, prices, inventory, goal: null, playbookId: PLAYBOOKS[0].id, missionsDone }),
    [profile, rules, prices, inventory, missionsDone],
  );

  const ctx: WidgetContext = { profile, rules, step, goal: facts.goal, tips, userKey };

  return <Dashboard ctx={ctx} />;
}
