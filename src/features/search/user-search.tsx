import { Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUserSearch } from "@/api/warera/queries";
import { CountryLabel } from "@/shared/components/flag";
import { UserAvatar } from "@/shared/components/user-avatar";
import { Input } from "@/ui/input";

export function UserSearch() {
  const navigate = useNavigate();
  const [value, setValue] = useState("");
  const [debounced, setDebounced] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value.trim()), 250);
    return () => clearTimeout(id);
  }, [value]);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const search = useUserSearch(debounced);
  const results = search.data ?? [];

  const go = (username: string) => navigate(`/${encodeURIComponent(username)}`);
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const showDropdown = open && debounced.length >= 2;

  return (
    <div ref={containerRef} className="relative">
      <form onSubmit={submit}>
        <div className="relative">
          <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            placeholder="Search your War Era username…"
            className="pl-9"
            autoFocus
          />
        </div>
      </form>

      {showDropdown && (
        <div className="bg-popover absolute z-20 mt-1.5 w-full overflow-hidden rounded-xl border shadow-xl">
          {search.isFetching && results.length === 0 && (
            <div className="text-muted-foreground p-3 text-sm">Searching…</div>
          )}
          {!search.isFetching && results.length === 0 && (
            <div className="text-muted-foreground p-3 text-sm">No players found.</div>
          )}
          {results.map((r) => (
            <button
              key={r.userId}
              type="button"
              onClick={() => go(r.username)}
              className="hover:bg-accent flex w-full items-center gap-3 p-2.5 text-left transition-colors"
            >
              <UserAvatar src={r.avatarUrl} className="size-9 shrink-0 rounded-lg" />
              <div className="min-w-0">
                <div className="truncate text-sm font-medium">{r.username}</div>
                <div className="text-muted-foreground flex items-center gap-1.5 truncate text-xs">
                  {r.level != null && <span>Level {r.level}</span>}
                  <CountryLabel countryId={r.countryId} />
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
