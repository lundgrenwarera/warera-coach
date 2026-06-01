import { z } from "zod";
import { trpcGet } from "./client";

const DatesSchema = z.object({
  dailyMissionRegenAt: z.string(),
  weeklyMissionRegenAt: z.string(),
});

export interface MissionDates {
  dailyResetAt: string;
  weeklyResetAt: string;
}

export async function fetchDates(): Promise<MissionDates> {
  const raw = DatesSchema.parse(await trpcGet("gameConfig.getDates"));
  return { dailyResetAt: raw.dailyMissionRegenAt, weeklyResetAt: raw.weeklyMissionRegenAt };
}
