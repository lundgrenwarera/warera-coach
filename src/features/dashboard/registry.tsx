import type { GameRules, PlayerProfile } from "@/api/warera/types";
import type { GoalPlan } from "@/core/engine/engine";
import type { PlaybookStep, Tip } from "@/core/playbook";
import { MilestoneBar } from "@/features/advisor/next-milestone";
import { Factories } from "@/features/companies";
import { Missions } from "@/features/missions";
import { Recommendations } from "@/features/recommendations";
import { SkillCheck } from "@/features/skills";
import type { DashboardWidget } from "@/shared/lib/store";

export interface WidgetContext {
  profile: PlayerProfile;
  rules: GameRules;
  step: PlaybookStep;
  goal: GoalPlan | null;
  tips: Tip[];
  userKey: string;
}

export interface WidgetDef {
  id: string;
  title: string;
  layout: Omit<DashboardWidget, "i">;
  minW: number;
  minH: number;
  render: (ctx: WidgetContext) => React.ReactNode;
}

export const WIDGETS: WidgetDef[] = [
  {
    id: "milestone",
    title: "Next milestone",
    layout: { x: 0, y: 0, w: 12, h: 1 },
    minW: 4,
    minH: 1,
    render: (ctx) => <MilestoneBar step={ctx.step} goal={ctx.goal} />,
  },
  {
    id: "missions",
    title: "Missions",
    layout: { x: 0, y: 1, w: 3, h: 7 },
    minW: 2,
    minH: 3,
    render: (ctx) => <Missions userKey={ctx.userKey} />,
  },
  {
    id: "recommendations",
    title: "Recommendations",
    layout: { x: 0, y: 8, w: 3, h: 7 },
    minW: 2,
    minH: 3,
    render: (ctx) => <Recommendations tips={ctx.tips} />,
  },
  {
    id: "companies",
    title: "Companies",
    layout: { x: 3, y: 1, w: 5, h: 14 },
    minW: 3,
    minH: 5,
    render: (ctx) => <Factories profile={ctx.profile} rules={ctx.rules} step={ctx.step} />,
  },
  {
    id: "skills",
    title: "Skills",
    layout: { x: 8, y: 1, w: 4, h: 14 },
    minW: 3,
    minH: 5,
    render: (ctx) => <SkillCheck profile={ctx.profile} />,
  },
];

export const WIDGETS_BY_ID: Record<string, WidgetDef> = Object.fromEntries(WIDGETS.map((w) => [w.id, w]));

export const DEFAULT_LAYOUT: DashboardWidget[] = WIDGETS.map((w) => ({ i: w.id, ...w.layout }));
