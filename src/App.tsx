import { useCallback, useEffect, useState } from "react";
import { ThemeToggle } from "./components/ThemeToggle";
import { UsernameForm } from "./components/UsernameForm";
import { PlanReport, type ReportData } from "./components/PlanReport";
import { pruneOldEntries } from "./lib/daily";
import { clearUsernameFromUrl, readUsernameFromUrl, setUsernameInUrl } from "./lib/routing";
import { ApiError, fetchCompanies, fetchUser, searchUserByName, type WareraUser, type Company } from "./lib/warera-api";
import {
  auditSkills, coinPlan, dailyChecklist, nextFactoryAction,
  type EcoSkillKey, type Factory,
} from "./lib/plan";

type Status =
  | { kind: "idle" }
  | { kind: "loading"; username: string }
  | { kind: "error"; message: string }
  | { kind: "ready"; data: ReportData };

export function App() {
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  const lookup = useCallback(async (username: string, opts?: { updateUrl?: boolean }) => {
    setStatus({ kind: "loading", username });
    if (opts?.updateUrl !== false) setUsernameInUrl(username);
    try {
      const userId = await searchUserByName(username);
      if (!userId) {
        setStatus({ kind: "error", message: `No user named "${username}". Check the spelling and try again.` });
        return;
      }
      const [user, companies] = await Promise.all([
        fetchUser(userId),
        fetchCompanies(userId).catch(() => [] as Company[]),
      ]);
      setStatus({ kind: "ready", data: buildReport(user, companies) });
    } catch (e) {
      setStatus({ kind: "error", message: friendlyError(e) });
    }
  }, []);

  useEffect(() => {
    pruneOldEntries();
    const fromUrl = readUsernameFromUrl();
    if (fromUrl) lookup(fromUrl, { updateUrl: false });
  }, [lookup]);

  function reset() {
    setStatus({ kind: "idle" });
    clearUsernameFromUrl();
  }

  function refresh() {
    if (status.kind === "ready") {
      lookup(status.data.username, { updateUrl: false });
    } else if (status.kind === "loading") {
      lookup(status.username, { updateUrl: false });
    }
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <TopBar />
      <main className="flex-1">
        {status.kind === "idle" && <UsernameForm onSubmit={lookup} busy={false} />}
        {status.kind === "loading" && <UsernameForm onSubmit={lookup} busy={true} />}
        {status.kind === "error" && (
          <div className="mx-auto max-w-xl px-4 py-10">
            <ErrorBox message={status.message} onRetry={reset} />
          </div>
        )}
        {status.kind === "ready" && <PlanReport data={status.data} onReset={reset} onRefresh={refresh} />}
      </main>
      <footer className="mt-auto border-t border-border px-4 py-5 text-center text-[11px] text-text-faint">
        <a href="https://github.com/lundgrenwarera/warera-coach" target="_blank" rel="noopener noreferrer" className="hover:text-accent">
          open source on github
        </a>
        {" · "}
        not affiliated with War Era
      </footer>
    </div>
  );
}

function TopBar() {
  return (
    <header className="sticky top-0 z-10 border-b border-border bg-bg/95 backdrop-blur">
      <div className="mx-auto flex max-w-4xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <div>
          <div className="label text-accent">War Era</div>
          <div className="bracket-heading text-sm text-text">Coach</div>
        </div>
        <ThemeToggle />
      </div>
    </header>
  );
}

function friendlyError(e: unknown): string {
  if (e instanceof ApiError) {
    if (e.status === 503 || e.status === 502 || e.status === 504) {
      return "The War Era API is down right now. Try again in a few minutes.";
    }
    if (e.status === 429) {
      return "Rate-limited by the War Era API. Wait a minute and try again.";
    }
    if (e.status === 404) {
      return "User not found. Check the spelling and try again.";
    }
    return `War Era API returned ${e.status}. Try again, or report it if it keeps happening.`;
  }
  if (e instanceof TypeError && e.message.includes("fetch")) {
    return "Couldn't reach the War Era API. Check your connection or try again in a minute.";
  }
  return (e as Error).message ?? "Unknown error.";
}

function ErrorBox({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="tactical-panel rounded-sm p-5">
      <div className="label text-loss">Lookup failed</div>
      <p className="mt-2 text-sm text-text">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-4 rounded border border-accent bg-accent/10 px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider text-accent hover:bg-accent/20"
      >
        ← Try again
      </button>
    </div>
  );
}

function buildReport(user: WareraUser, companies: Company[]): ReportData {
  const level = user.leveling?.level ?? 0;
  const availableSP = user.leveling?.availableSkillPoints ?? 0;
  const totalSP = user.leveling?.totalSkillPoints ?? level * 4;
  const skills = user.skills ?? {};
  const skillLevel = (k: string): number => skills[k]?.level ?? 0;

  const current: Record<EcoSkillKey, number> = {
    entrepreneurship: skillLevel("entrepreneurship"),
    energy: skillLevel("energy"),
    production: skillLevel("production"),
    companies: skillLevel("companies"),
  };
  const audit = auditSkills({ level, availableSP, totalSP, current });

  const factories: Factory[] = companies.map((c) => ({
    id: c._id,
    name: c.name ?? c.itemCode,
    itemCode: c.itemCode,
    automatedEngine: c.activeUpgradeLevels?.automatedEngine ?? 1,
  }));

  const factoryAction = nextFactoryAction({
    factories,
    companiesSkillLevel: current.companies,
  });

  const daily = dailyChecklist({ audit, factoryAction });
  const coin = coinPlan({ factoryAction, level });

  return {
    username: user.username,
    audit,
    factories,
    factoryAction,
    daily,
    coin,
  };
}
