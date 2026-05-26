const BASE = "/warera-coach";

export function readUsernameFromUrl(): string | null {
  const params = new URLSearchParams(location.search);
  const redirect = params.get("redirect");
  if (redirect) {
    history.replaceState(null, "", `${BASE}/${redirect}`);
    return redirect;
  }
  const after = location.pathname.replace(BASE, "").replace(/^\/+/, "").replace(/\/+$/, "");
  return after || null;
}

export function setUsernameInUrl(username: string) {
  history.pushState(null, "", `${BASE}/${encodeURIComponent(username)}`);
}

export function clearUsernameFromUrl() {
  history.pushState(null, "", `${BASE}/`);
}
