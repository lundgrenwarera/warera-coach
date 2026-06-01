import { ExternalLink } from "lucide-react";

export function LinkedHeading({ title, href, dataTour }: { title: string; href: string; dataTour?: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      data-tour={dataTour}
      className="group inline-flex items-center gap-1.5 transition-opacity hover:opacity-80"
    >
      <span className="bracket-heading text-sm">{title}</span>
      <ExternalLink className="text-muted-foreground/50 size-3 transition-colors group-hover:text-foreground" />
    </a>
  );
}
