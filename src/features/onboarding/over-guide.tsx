import { Link } from "react-router-dom";
import { PLAN_MAX_LEVEL } from "@/features/skills";
import { UserAvatar } from "@/shared/components/user-avatar";

export function OverGuide({
  username,
  level,
  avatarUrl,
}: {
  username: string;
  level: number;
  avatarUrl: string | null;
}) {
  return (
    <div className="bg-card mx-auto mt-8 max-w-md rounded-xl border p-6 text-center">
      <UserAvatar src={avatarUrl} className="mx-auto size-14 rounded-lg" />
      <p className="mt-3 text-base font-semibold">
        {username} · Level {level}
      </p>
      <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
        This coach is built for new players. Its guide covers levels 1 to {PLAN_MAX_LEVEL}, and you&rsquo;re past it.
      </p>
      <Link
        to="/"
        className="bg-primary text-primary-foreground mt-4 inline-block rounded-lg px-3 py-1.5 text-sm font-medium"
      >
        Go back
      </Link>
    </div>
  );
}
