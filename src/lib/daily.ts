const STORE_KEY = "warera-coach.daily.v1";

function utcDateKey(now = new Date()): string {
  return now.toISOString().slice(0, 10);
}

type Store = Record<string, string>;

function loadStore(): Store {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Store;
  } catch {
    return {};
  }
}

function saveStore(store: Store) {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(store));
  } catch {
    /* storage full or denied */
  }
}

export function isDoneToday(id: string): boolean {
  const store = loadStore();
  return store[id] === utcDateKey();
}

export function toggleDone(id: string, done: boolean) {
  const store = loadStore();
  if (done) {
    store[id] = utcDateKey();
  } else {
    delete store[id];
  }
  saveStore(store);
}

export function pruneOldEntries() {
  const today = utcDateKey();
  const store = loadStore();
  let touched = false;
  for (const key of Object.keys(store)) {
    if (store[key] !== today) {
      delete store[key];
      touched = true;
    }
  }
  if (touched) saveStore(store);
}
