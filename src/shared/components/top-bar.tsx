import { Link } from "react-router-dom";

export function TopBar({ left, right }: { left?: React.ReactNode; right?: React.ReactNode }) {
  return (
    <header className="border-border bg-background/95 sticky top-0 z-10 border-b backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3">
        <div className="flex items-center gap-3">
          <Link to="/" className="leading-none">
            <div className="label text-primary">War Era</div>
            <div className="bracket-heading text-foreground text-sm">Coach</div>
          </Link>
          {left}
        </div>
        {right}
      </div>
    </header>
  );
}
