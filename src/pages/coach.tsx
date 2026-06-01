import { HelpCircle, LayoutGrid } from "lucide-react";
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { usePrices, useProfile, useRules } from "@/api/warera/queries";
import { GUIDE } from "@/core/playbook";
import { Advisor } from "@/features/advisor";
import { InventoryDialog } from "@/features/inventory";
import { IntroModal, OverGuide, runTour } from "@/features/onboarding";
import { PLAN_MAX_LEVEL } from "@/features/skills";
import { CountryFlag } from "@/shared/components/flag";
import { ErrorBox, LoadingBox } from "@/shared/components/loading";
import { RefreshIndicator } from "@/shared/components/refresh-indicator";
import { TopBar } from "@/shared/components/top-bar";
import { UserAvatar } from "@/shared/components/user-avatar";
import { useCoachStore } from "@/shared/lib/store";
import { useIsDesktop } from "@/shared/lib/use-is-desktop";

export function CoachPage() {
  const { username = "" } = useParams();
  const addRecent = useCoachStore((s) => s.addRecent);
  const isDesktop = useIsDesktop();
  const editMode = useCoachStore((s) => s.dashboardEditMode);
  const setEditMode = useCoachStore((s) => s.setDashboardEditMode);

  const rules = useRules();
  const prices = usePrices();
  const profile = useProfile(username);

  const data = profile.data;
  useEffect(() => {
    if (!data) return;
    addRecent({
      username: data.username,
      userId: data.userId,
      level: data.level,
      countryId: data.countryId,
      avatarUrl: data.avatarUrl,
    });
  }, [data, addRecent]);

  const loading = profile.isLoading || rules.isLoading || prices.isLoading;
  const overGuide = data?.level != null && data.level > PLAN_MAX_LEVEL;

  const introSeen = useCoachStore((s) => s.introSeen);
  const tourSeen = useCoachStore((s) => s.tourSeen);
  const setTourSeen = useCoachStore((s) => s.setTourSeen);
  const setIntroSeen = useCoachStore((s) => s.setIntroSeen);
  const replayOnboarding = () => {
    setTourSeen(false);
    setIntroSeen(false);
  };
  const advisorReady = Boolean(data && !overGuide && rules.data && prices.data);

  useEffect(() => {
    if (!advisorReady || !introSeen || tourSeen) return;
    const id = setTimeout(() => runTour(() => setTourSeen(true)), 500);
    return () => clearTimeout(id);
  }, [advisorReady, introSeen, tourSeen, setTourSeen]);

  return (
    <>
      {data && !overGuide && <IntroModal level={data.level} />}
      <TopBar
        left={
          data && prices.data && !overGuide ? (
            <InventoryDialog userKey={data.username.toLowerCase()} userId={data.userId} prices={prices.data} />
          ) : null
        }
        right={
          <div className="flex items-center gap-4">
            {data && (
              <RefreshIndicator
                updatedAt={profile.dataUpdatedAt}
                isFetching={profile.isFetching || prices.isFetching}
                onRefresh={() => {
                  void profile.refetch();
                  void prices.refetch();
                }}
              />
            )}
            {data ? (
              <a
                href={`https://app.warera.io/user/${data.userId}`}
                target="_blank"
                rel="noreferrer"
                title="Open War Era profile"
                className="hover:bg-muted/50 flex items-center gap-2 rounded-lg px-1.5 py-1 transition-colors"
              >
                <UserAvatar src={data.avatarUrl} className="size-8 rounded-md" />
                <div className="leading-tight">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-semibold">{data.username}</span>
                    <CountryFlag countryId={data.countryId} />
                  </div>
                  {data.level != null && <span className="text-muted-foreground text-[11px]">Level {data.level}</span>}
                </div>
              </a>
            ) : (
              <span className="text-sm font-semibold">{username}</span>
            )}
            {data && !overGuide && isDesktop && !editMode && (
              <button
                type="button"
                onClick={() => setEditMode(true)}
                title="Customize layout"
                className="hover:bg-muted/50 text-muted-foreground hover:text-foreground rounded-lg p-2 transition-colors"
              >
                <LayoutGrid className="size-4" />
                <span className="sr-only">Customize layout</span>
              </button>
            )}
            {data && prices.data && !overGuide && (
              <button
                type="button"
                onClick={replayOnboarding}
                title="Replay onboarding"
                className="hover:bg-muted/50 text-muted-foreground hover:text-foreground rounded-lg p-2 transition-colors"
              >
                <HelpCircle className="size-4" />
                <span className="sr-only">Replay onboarding</span>
              </button>
            )}
          </div>
        }
      />
      <div className="mx-auto max-w-7xl space-y-4 px-4 py-6">
        {loading && <LoadingBox label="Fetching your War Era data…" />}
        {!loading && profile.isError && <ErrorBox message="Couldn't reach War Era. Try again in a moment." />}
        {!loading && !profile.isError && data === null && <ErrorBox message={`No player named “${username}” found.`} />}
        {data && overGuide && <OverGuide username={data.username} level={data.level!} avatarUrl={data.avatarUrl} />}
        {data && !overGuide && rules.data && prices.data && (
          <Advisor profile={data} rules={rules.data} prices={prices.data} />
        )}
        <footer className="text-muted-foreground pt-2 pb-4 text-center text-xs">
          Based on the{" "}
          <a href={GUIDE.url} target="_blank" rel="noreferrer" className="text-foreground hover:underline">
            {GUIDE.title}
          </a>{" "}
          by {GUIDE.author}
        </footer>
      </div>
    </>
  );
}
