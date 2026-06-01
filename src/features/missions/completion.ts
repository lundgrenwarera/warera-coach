import type { MissionDates } from "@/api/warera/dates";
import type { RoutineState } from "@/shared/lib/store";
import { TASKS } from "./tasks";

export function missionsComplete(routine: RoutineState, dates: MissionDates | undefined): boolean {
  if (!dates) return false;
  const starterDone = TASKS.starter.every((t) => Boolean(routine.done[t.id]));
  const dailyDone = TASKS.daily.every((t) => routine.done[t.id] === dates.dailyResetAt);
  const weeklyDone = TASKS.weekly.every((t) => routine.done[t.id] === dates.weeklyResetAt);
  return starterDone && dailyDone && weeklyDone;
}
