import { useQueryClient } from "@tanstack/react-query";
import { Check } from "lucide-react";
import { useDates } from "@/api/warera/queries";
import { LinkedHeading } from "@/shared/components/linked-heading";
import { PanelHelp } from "@/shared/components/panel-help";
import { EMPTY_ROUTINE, type RoutineState, useCoachStore } from "@/shared/lib/store";
import { cn } from "@/shared/lib/utils";
import { type MissionTask, TASKS } from "./tasks";
import { useCountdown } from "./use-countdown";

const DAY_MS = 24 * 60 * 60 * 1000;
const WEEK_MS = 7 * DAY_MS;
const ONE_TIME = "done";
const MISSIONS_URL = "https://app.warera.io/missions";

function urgencyColor(remainingFraction: number): string {
  const f = Math.min(1, Math.max(0, remainingFraction));
  const hue = 142 * f;
  return `hsl(${hue.toFixed(0)} 58% 60%)`;
}

function Checkbox({ checked, onToggle, label }: { checked: boolean; onToggle: () => void; label: string }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      onClick={onToggle}
      className={cn(
        "flex size-[18px] shrink-0 items-center justify-center rounded-md border transition-colors",
        checked ? "border-chart-2 bg-chart-2 text-background" : "border-border hover:border-chart-2/60",
      )}
    >
      {checked && <Check className="size-3" strokeWidth={3} />}
    </button>
  );
}

function TaskRow({ task, checked, onToggle }: { task: MissionTask; checked: boolean; onToggle: () => void }) {
  return (
    <li className="flex items-center gap-2.5">
      <Checkbox checked={checked} label={task.title} onToggle={onToggle} />
      <button
        type="button"
        onClick={onToggle}
        className={cn(
          "hover:text-foreground text-left text-sm leading-snug transition-colors",
          checked && "text-muted-foreground line-through",
        )}
      >
        {task.title}
      </button>
    </li>
  );
}

function Group({ children }: { children: React.ReactNode }) {
  return <div className="py-3.5 first:pt-0 last:pb-0">{children}</div>;
}

function TimedGroup({
  label,
  tasks,
  resetAt,
  periodMs,
  routine,
  onToggle,
}: {
  label: string;
  tasks: MissionTask[];
  resetAt: string | null;
  periodMs: number;
  routine: RoutineState;
  onToggle: (taskId: string, marker: string | null) => void;
}) {
  const queryClient = useQueryClient();
  const {
    remaining,
    elapsed,
    label: timeLabel,
  } = useCountdown(resetAt, () => {
    void queryClient.invalidateQueries({ queryKey: ["dates"] });
  });

  const remainingFraction = resetAt ? Math.min(1, remaining / periodMs) : 1;
  const progress = 1 - remainingFraction;
  const color = urgencyColor(remainingFraction);

  return (
    <Group>
      <div className="mb-1.5 flex items-baseline justify-between gap-2">
        <span className="label">{label}</span>
        {timeLabel && (
          <span className="text-xs tabular-nums" style={{ color }}>
            resets in {timeLabel}
          </span>
        )}
      </div>
      <div className="bg-muted/60 mb-2.5 h-1 w-full overflow-hidden rounded-full">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${progress * 100}%`, backgroundColor: color }}
        />
      </div>
      <ul className="space-y-2">
        {tasks.map((task) => {
          const checked = resetAt !== null && routine.done[task.id] === resetAt && !elapsed;
          return (
            <TaskRow
              key={task.id}
              task={task}
              checked={checked}
              onToggle={() => onToggle(task.id, checked ? null : resetAt)}
            />
          );
        })}
      </ul>
    </Group>
  );
}

export function Missions({ userKey }: { userKey: string }) {
  const dates = useDates();
  const routine = useCoachStore((s) => s.routines[userKey]) ?? EMPTY_ROUTINE;
  const setRoutineDone = useCoachStore((s) => s.setRoutineDone);
  const onToggle = (taskId: string, marker: string | null) => setRoutineDone(userKey, taskId, marker);

  const starter = TASKS.starter[0];
  const starterDone = Boolean(routine.done[starter.id]);

  return (
    <section data-tour="missions" className="bg-card rounded-xl border p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2>
          <LinkedHeading title="Missions" href={MISSIONS_URL} dataTour="missions-title" />
        </h2>
        <PanelHelp
          title="Missions"
          sources={[{ label: "War Era Wiki: Experience", href: "https://warera.wiki/experience-xp" }]}
        >
          <p>
            Missions are the only way to earn XP, and XP is what levels you up. Each level grants skill points and
            unlocks new features, so clear missions before anything else.
          </p>
          <p>
            <span className="text-foreground font-medium">Starter</span> missions give the most XP and can only be done
            once. Finish them first.
          </p>
          <p>
            <span className="text-foreground font-medium">Daily</span> missions reset every day; complete 7 to claim the
            daily reward of XP, coin and a case.
          </p>
          <p>
            <span className="text-foreground font-medium">Weekly</span> missions give more XP each but are harder.
          </p>
        </PanelHelp>
      </div>

      <div className="divide-border/50 flex flex-col divide-y">
        {!starterDone && (
          <Group>
            <div className="mb-1.5 flex items-center justify-between gap-2">
              <span className="label">Starter</span>
              <span className="text-muted-foreground text-xs">one time</span>
            </div>
            <ul>
              <TaskRow task={starter} checked={false} onToggle={() => onToggle(starter.id, ONE_TIME)} />
            </ul>
          </Group>
        )}
        <TimedGroup
          label="Daily"
          tasks={TASKS.daily}
          resetAt={dates.data?.dailyResetAt ?? null}
          periodMs={DAY_MS}
          routine={routine}
          onToggle={onToggle}
        />
        <TimedGroup
          label="Weekly"
          tasks={TASKS.weekly}
          resetAt={dates.data?.weeklyResetAt ?? null}
          periodMs={WEEK_MS}
          routine={routine}
          onToggle={onToggle}
        />
      </div>
    </section>
  );
}
