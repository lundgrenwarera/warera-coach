import { X } from "lucide-react";
import { Link } from "react-router-dom";
import { CountryFlag } from "@/shared/components/flag";
import { UserAvatar } from "@/shared/components/user-avatar";
import { type RecentEntry, useCoachStore } from "@/shared/lib/store";

function RecentCard({ entry }: { entry: RecentEntry }) {
  const removeRecent = useCoachStore((s) => s.removeRecent);

  return (
    <div className="group relative">
      <Link
        to={`/${encodeURIComponent(entry.username)}`}
        className="bg-card hover:border-primary/50 flex items-center gap-3 rounded-xl border p-2.5 transition-colors"
      >
        <UserAvatar src={entry.avatarUrl} className="size-10 shrink-0 rounded-lg" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <span className="truncate text-sm font-semibold">{entry.username}</span>
            <CountryFlag countryId={entry.countryId} className="shrink-0" />
          </div>
          {entry.level != null && <div className="text-muted-foreground text-xs">Level {entry.level}</div>}
        </div>
      </Link>
      <button
        type="button"
        onClick={() => removeRecent(entry.username)}
        aria-label={`Remove ${entry.username}`}
        className="text-muted-foreground hover:text-foreground absolute top-1.5 right-1.5 rounded-md p-1 opacity-0 transition-opacity group-hover:opacity-100"
      >
        <X className="size-3.5" />
      </button>
    </div>
  );
}

export function RecentList() {
  const recents = useCoachStore((s) => s.recents);
  if (recents.length === 0) return null;
  return (
    <div className="space-y-2">
      <p className="label">Recent</p>
      <div className="grid gap-2 sm:grid-cols-2">
        {recents.map((r) => (
          <RecentCard key={r.username} entry={r} />
        ))}
      </div>
    </div>
  );
}
