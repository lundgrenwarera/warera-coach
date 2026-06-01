import { itemImg } from "@/shared/lib/item-meta";
import { itemLabel } from "@/shared/lib/items";
import { cn } from "@/shared/lib/utils";

export function Coin({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      width="1em"
      height="1em"
      aria-hidden="true"
      style={style}
      className={cn("inline-block shrink-0 align-[-0.12em]", className)}
    >
      <path d="M12 5C7.031 5 2 6.546 2 9.5S7.031 14 12 14c4.97 0 10-1.546 10-4.5S16.97 5 12 5zm-5 9.938v3c1.237.299 2.605.482 4 .541v-3a21.166 21.166 0 0 1-4-.541zm6 .54v3a20.994 20.994 0 0 0 4-.541v-3a20.994 20.994 0 0 1-4 .541zm6-1.181v3c1.801-.755 3-1.857 3-3.297v-3c0 1.44-1.199 2.542-3 3.297zm-14 3v-3C3.2 13.542 2 12.439 2 11v3c0 1.439 1.2 2.542 3 3.297z" />
    </svg>
  );
}

const MONEY_RE = /\$(\d[\d,]*(?:\.\d+)?)/g;

export function MoneyText({ children }: { children: string }) {
  const parts: React.ReactNode[] = [];
  let last = 0;
  let key = 0;
  for (const m of children.matchAll(MONEY_RE)) {
    const at = m.index ?? 0;
    if (at > last) parts.push(children.slice(last, at));
    parts.push(
      <span key={key++} className="inline-flex items-center gap-0.5 tabular-nums">
        <Coin className="text-chart-3" />
        {m[1]}
      </span>,
    );
    last = at + m[0].length;
  }
  if (last < children.length) parts.push(children.slice(last));
  return <>{parts}</>;
}

export function Money({ value, className }: { value: number | null | undefined; className?: string }) {
  if (value == null) return <span className={className}>—</span>;
  const n = Intl.NumberFormat("en", { maximumFractionDigits: Math.abs(value) < 100 ? 2 : 0 }).format(value);
  return (
    <span className={cn("inline-flex items-center gap-0.5 tabular-nums", className)}>
      <Coin className="text-chart-3" />
      {n}
    </span>
  );
}

export function ItemIcon({ code, size = 18 }: { code: string; size?: number }) {
  return (
    <img
      src={itemImg(code)}
      alt={itemLabel(code)}
      width={size}
      height={size}
      loading="lazy"
      className="inline-block shrink-0 rounded-sm align-middle"
    />
  );
}
