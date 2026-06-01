import { GripVertical, Plus, RotateCcw, X } from "lucide-react";
import { type RefObject, useEffect, useMemo, useRef, useState } from "react";
import RGL, { type Layout, WidthProvider } from "react-grid-layout/legacy";
import { type DashboardWidget, useCoachStore } from "@/shared/lib/store";
import { useIsDesktop } from "@/shared/lib/use-is-desktop";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/ui/button";
import { DEFAULT_LAYOUT, WIDGETS, WIDGETS_BY_ID, type WidgetContext, type WidgetDef } from "./registry";

const GridLayout = WidthProvider(RGL);

const COLS = 12;
const MARGIN: [number, number] = [12, 12];
const MIN_ROW_HEIGHT = 14;
const BOTTOM_GAP = 56;

function useAvailableHeight(ref: RefObject<HTMLElement | null>, recomputeKey: unknown): number {
  const [height, setHeight] = useState(() => (typeof window !== "undefined" ? window.innerHeight - 280 : 600));
  // recomputeKey re-measures when surrounding chrome (the edit toolbar) toggles and shifts the grid's top.
  // biome-ignore lint/correctness/useExhaustiveDependencies: recomputeKey is an intentional re-measure trigger
  useEffect(() => {
    const update = () => {
      const top = ref.current ? ref.current.getBoundingClientRect().top : 280;
      setHeight(Math.max(320, window.innerHeight - top - BOTTOM_GAP));
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [ref, recomputeKey]);
  return height;
}

function strip(item: { i: string; x: number; y: number; w: number; h: number }): DashboardWidget {
  return { i: item.i, x: item.x, y: item.y, w: item.w, h: item.h };
}

function CellContent({
  def,
  ctx,
  editMode,
  onRemove,
}: {
  def: WidgetDef;
  ctx: WidgetContext;
  editMode: boolean;
  onRemove: (id: string) => void;
}) {
  return (
    <>
      {editMode && (
        <div className="widget-drag-handle bg-muted text-muted-foreground flex h-7 shrink-0 cursor-move items-center gap-1.5 rounded-t-xl px-2 text-xs">
          <GripVertical className="size-3.5" />
          <span className="font-medium">{def.title}</span>
          <button
            type="button"
            onClick={() => onRemove(def.id)}
            title={`Remove ${def.title}`}
            className="hover:bg-destructive/20 hover:text-destructive ml-auto rounded p-0.5 transition-colors"
          >
            <X className="size-3.5" />
            <span className="sr-only">Remove {def.title}</span>
          </button>
        </div>
      )}
      <div className="dashboard-cell-body min-h-0 flex-1 overflow-auto">{def.render(ctx)}</div>
    </>
  );
}

export function Dashboard({ ctx }: { ctx: WidgetContext }) {
  const stored = useCoachStore((s) => s.dashboardLayout);
  const setLayout = useCoachStore((s) => s.setDashboardLayout);
  const editMode = useCoachStore((s) => s.dashboardEditMode);
  const setEditMode = useCoachStore((s) => s.setDashboardEditMode);
  const isDesktop = useIsDesktop();
  const gridRef = useRef<HTMLDivElement>(null);
  const availableHeight = useAvailableHeight(gridRef, editMode);

  useEffect(() => {
    if (!isDesktop) setEditMode(false);
  }, [isDesktop, setEditMode]);

  const { visible, rglLayout, hidden, rows } = useMemo(() => {
    const base = stored ?? DEFAULT_LAYOUT;
    const shown = base.filter((item) => WIDGETS_BY_ID[item.i]);
    const layout: Layout = shown.map((item) => {
      const def = WIDGETS_BY_ID[item.i];
      return { ...item, minW: def.minW, minH: def.minH };
    });
    const hiddenDefs = WIDGETS.filter((w) => !shown.some((s) => s.i === w.id));
    const totalRows = Math.max(1, ...shown.map((item) => item.y + item.h));
    return { visible: shown, rglLayout: layout, hidden: hiddenDefs, rows: totalRows };
  }, [stored]);

  const rowHeight = Math.max(MIN_ROW_HEIGHT, Math.floor((availableHeight - (rows - 1) * MARGIN[1]) / rows));

  const persist = (layout: Layout) => setLayout(layout.map(strip));

  const removeWidget = (id: string) => setLayout(visible.filter((v) => v.i !== id).map(strip));

  const addWidget = (id: string) => {
    const def = WIDGETS_BY_ID[id];
    const maxY = visible.reduce((m, item) => Math.max(m, item.y + item.h), 0);
    setLayout([...visible.map(strip), { i: id, x: 0, y: maxY, w: def.layout.w, h: def.layout.h }]);
  };

  const resetLayout = () => setLayout(null);

  return (
    <div className="space-y-3">
      {isDesktop && editMode && (
        <div className="flex items-center justify-end gap-2">
          {hidden.length > 0 && (
            <div className="mr-auto flex flex-wrap items-center gap-1.5">
              <span className="text-muted-foreground text-xs">Add:</span>
              {hidden.map((w) => (
                <Button key={w.id} variant="outline" size="xs" onClick={() => addWidget(w.id)}>
                  <Plus />
                  {w.title}
                </Button>
              ))}
            </div>
          )}
          <Button variant="ghost" size="sm" onClick={resetLayout}>
            <RotateCcw />
            Reset
          </Button>
          <Button size="sm" onClick={() => setEditMode(false)}>
            Done
          </Button>
        </div>
      )}

      {isDesktop ? (
        <div ref={gridRef}>
          <GridLayout
            className={cn(editMode && "dashboard-editing")}
            layout={rglLayout}
            cols={COLS}
            rowHeight={rowHeight}
            margin={MARGIN}
            containerPadding={[0, 0]}
            isDraggable={editMode}
            isResizable={editMode}
            draggableHandle=".widget-drag-handle"
            resizeHandles={["se"]}
            compactType="vertical"
            onDragStop={(layout) => persist(layout)}
            onResizeStop={(layout) => persist(layout)}
          >
            {visible.map((item) => (
              <div
                key={item.i}
                className={cn("flex flex-col overflow-hidden rounded-xl", editMode && "ring-primary/40 ring-1")}
              >
                <CellContent def={WIDGETS_BY_ID[item.i]} ctx={ctx} editMode={editMode} onRemove={removeWidget} />
              </div>
            ))}
          </GridLayout>
        </div>
      ) : (
        <div className="space-y-4">
          {visible.map((item) => (
            <div key={item.i}>{WIDGETS_BY_ID[item.i].render(ctx)}</div>
          ))}
        </div>
      )}
    </div>
  );
}
