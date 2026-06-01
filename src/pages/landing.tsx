import { Coins } from "lucide-react";
import { RecentList, UserSearch } from "@/features/search";

export function LandingPage() {
  return (
    <div className="mx-auto flex min-h-svh max-w-lg flex-col justify-center px-4 py-10">
      <div className="space-y-6">
        <div className="text-center">
          <div className="bg-primary/10 text-primary mx-auto mb-4 flex size-12 items-center justify-center rounded-xl">
            <Coins className="size-6" />
          </div>
          <div className="label text-primary">War Era</div>
          <h1 className="bracket-heading text-2xl">Coach</h1>
        </div>
        <UserSearch />
        <RecentList />
      </div>
    </div>
  );
}
