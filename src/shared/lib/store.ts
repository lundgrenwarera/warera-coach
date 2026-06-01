import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface RecentEntry {
  username: string;
  userId: string;
  level: number | null;
  countryId: string | null;
  avatarUrl: string | null;
  lastAccessedAt: number;
}

export interface StoredInventory {
  items: Record<string, number>;
  importedAt: number | null;
}

export interface RoutineState {
  done: Record<string, string>;
}

export interface DashboardWidget {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

interface CoachState {
  recents: RecentEntry[];
  introSeen: boolean;
  tourSeen: boolean;
  inventoryOpened: boolean;
  inventories: Record<string, StoredInventory>;
  routines: Record<string, RoutineState>;
  dashboardLayout: DashboardWidget[] | null;
  dashboardEditMode: boolean;
  addRecent: (entry: Omit<RecentEntry, "lastAccessedAt">) => void;
  removeRecent: (username: string) => void;
  setIntroSeen: (seen: boolean) => void;
  setTourSeen: (seen: boolean) => void;
  setInventoryOpened: (opened: boolean) => void;
  setInventory: (key: string, inv: StoredInventory) => void;
  setRoutineDone: (key: string, taskId: string, marker: string | null) => void;
  setDashboardLayout: (layout: DashboardWidget[] | null) => void;
  setDashboardEditMode: (editing: boolean) => void;
}

export const EMPTY_ROUTINE: RoutineState = { done: {} };

const MAX_RECENT = 12;

export const useCoachStore = create<CoachState>()(
  persist(
    (set) => ({
      recents: [],
      introSeen: false,
      tourSeen: false,
      inventoryOpened: false,
      inventories: {},
      routines: {},
      dashboardLayout: null,
      dashboardEditMode: false,
      addRecent: (entry) =>
        set((s) => {
          if (!entry.username) return s;
          const rest = s.recents.filter((r) => r.username.toLowerCase() !== entry.username.toLowerCase());
          return { recents: [{ ...entry, lastAccessedAt: Date.now() }, ...rest].slice(0, MAX_RECENT) };
        }),
      removeRecent: (username) =>
        set((s) => ({ recents: s.recents.filter((r) => r.username.toLowerCase() !== username.toLowerCase()) })),
      setIntroSeen: (seen) => set({ introSeen: seen }),
      setTourSeen: (seen) => set({ tourSeen: seen }),
      setInventoryOpened: (opened) => set({ inventoryOpened: opened }),
      setInventory: (key, inv) => set((s) => ({ inventories: { ...s.inventories, [key]: inv } })),
      setRoutineDone: (key, taskId, marker) =>
        set((s) => {
          const done = { ...(s.routines[key] ?? EMPTY_ROUTINE).done };
          if (marker === null) delete done[taskId];
          else done[taskId] = marker;
          return { routines: { ...s.routines, [key]: { done } } };
        }),
      setDashboardLayout: (layout) => set({ dashboardLayout: layout }),
      setDashboardEditMode: (editing) => set({ dashboardEditMode: editing }),
    }),
    {
      name: "war-era-coach",
      partialize: (s) => ({
        recents: s.recents,
        introSeen: s.introSeen,
        tourSeen: s.tourSeen,
        inventoryOpened: s.inventoryOpened,
        inventories: s.inventories,
        routines: s.routines,
        dashboardLayout: s.dashboardLayout,
      }),
    },
  ),
);
