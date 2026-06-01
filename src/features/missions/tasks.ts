export type Cadence = "starter" | "daily" | "weekly";

export interface MissionTask {
  id: string;
  title: string;
}

export const TASKS: Record<Cadence, MissionTask[]> = {
  starter: [{ id: "starter", title: "Complete your starter missions" }],
  daily: [
    { id: "daily-missions", title: "Complete daily missions" },
    { id: "daily-reward", title: "Claim free daily reward" },
  ],
  weekly: [{ id: "weekly-missions", title: "Complete weekly missions" }],
};
