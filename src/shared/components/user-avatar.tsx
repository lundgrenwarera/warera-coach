import { useState } from "react";
import { cn } from "@/shared/lib/utils";

const PLACEHOLDER = "https://app.warera.io/images/avatars/userAvatarPlaceholder.png?v=2";

export function UserAvatar({ src, className }: { src: string | null | undefined; className?: string }) {
  const [errored, setErrored] = useState(false);
  const url = !src || errored ? PLACEHOLDER : src;
  return (
    <img
      src={url}
      alt=""
      loading="lazy"
      onError={() => setErrored(true)}
      className={cn("bg-muted object-cover", className)}
    />
  );
}
