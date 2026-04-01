import { useEffect, useMemo, useRef, useState } from "react";

type FloorHighlight = { label: string; value: string };
type FloorTable = {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  zone?: string;
  shape?: "Round" | "Square" | "Rectangle";
  seats?: number;
  rotation?: number;
};
type FloorArea = { id: string; x: number; y: number; width: number; height: number; label: string };

type FloorOverviewCardProps = {
  highlights: FloorHighlight[];
  tables: FloorTable[];
  area?: FloorArea | null;
  canvasWidth?: number;
  canvasHeight?: number;
  floors?: { id: string; label: string }[];
  selectedFloorId?: string;
  onFloorSelect?: (id: string) => void;
};

const zoneStyle: Record<string, { text: string; bg: string; border: string }> = {
  Indoor: { text: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200" },
  Outdoor: { text: "text-blue-700", bg: "bg-blue-50", border: "border-blue-200" },
  Bar: { text: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200" },
  "Private Dining": { text: "text-violet-700", bg: "bg-violet-50", border: "border-violet-200" },
};

const shapeClass: Record<string, string> = {
  Round: "rounded-full",
  ROUND: "rounded-full",
  Square: "rounded-xl",
  SQUARE: "rounded-xl",
  Rectangle: "rounded-2xl",
  RECTANGLE: "rounded-2xl",
};

const FloorOverviewCard = ({
  highlights,
  tables,
  area,
  canvasWidth = 1200,
  canvasHeight = 700,
  floors = [],
  selectedFloorId = "",
  onFloorSelect,
}: FloorOverviewCardProps) => {
  const zones = Array.from(new Set(tables.map((table) => table.zone).filter(Boolean))) as string[];
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const [viewportWidth, setViewportWidth] = useState(0);

  useEffect(() => {
    const node = viewportRef.current;
    if (!node) return;

    const update = () => setViewportWidth(node.clientWidth);
    update();

    if (typeof ResizeObserver !== "undefined") {
      const observer = new ResizeObserver(() => update());
      observer.observe(node);
      return () => observer.disconnect();
    }

    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const scale = useMemo(() => {
    if (!viewportWidth || !canvasWidth) return 1;
    const fitScale = viewportWidth / canvasWidth;
    const minReadableScale = 0.55;
    return Math.min(1, Math.max(minReadableScale, fitScale));
  }, [viewportWidth, canvasWidth]);

  const scaledHeight = Math.round(canvasHeight * scale);

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="text-sm font-semibold text-slate-900">Visual floor plan</div>
      <p className="mt-1 text-xs text-slate-500">Live floor plan preview (read-only)</p>
      {floors.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {floors.map((floor) => (
            <button
              key={floor.id}
              type="button"
              onClick={() => onFloorSelect?.(floor.id)}
              className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                selectedFloorId === floor.id
                  ? "border-slate-900 bg-slate-900 text-white"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              {floor.label}
            </button>
          ))}
        </div>
      ) : null}

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {highlights.map((item) => (
          <div key={item.label} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <div className="text-xs text-slate-400">{item.label}</div>
            <div className="mt-1 text-sm font-semibold text-slate-700">{item.value}</div>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <div
          ref={viewportRef}
          className="w-full overflow-x-auto overflow-y-hidden rounded-xl border border-dashed border-slate-200 bg-[linear-gradient(90deg,rgba(148,163,184,0.12)_1px,transparent_1px),linear-gradient(180deg,rgba(148,163,184,0.12)_1px,transparent_1px)] bg-[size:22px_22px]"
          style={{ height: scaledHeight }}
        >
          <div
            className="relative"
            style={{
              width: canvasWidth,
              height: canvasHeight,
              transform: `scale(${scale})`,
              transformOrigin: "top left",
            }}
          >
          {area && (
            <div
              className="absolute rounded-[28px] border border-dashed border-emerald-300 bg-emerald-50/70"
              style={{
                left: area.x,
                top: area.y,
                width: area.width,
                height: area.height,
              }}
            >
              <span className="absolute left-2 top-2 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                {area.label}
              </span>
            </div>
          )}

          {tables.map((table) => (
            <div
              key={table.id}
              className={`absolute flex flex-col items-center justify-center border text-[11px] font-semibold text-slate-700 shadow-sm ${
                shapeClass[table.shape ?? "Rectangle"] ?? "rounded-2xl"
              } ${table.zone ? zoneStyle[table.zone]?.border ?? "border-slate-200" : "border-slate-200"} bg-white`}
              style={{
                left: table.x,
                top: table.y,
                width: table.w,
                height: table.h,
                transform: `rotate(${table.rotation ?? 0}deg)`,
              }}
            >
              {table.zone ? (
                <span
                  className={`absolute -top-5 rounded-full border px-2 py-0.5 text-[9px] font-bold ${
                    zoneStyle[table.zone]?.text ?? "text-slate-700"
                  } ${zoneStyle[table.zone]?.bg ?? "bg-slate-100"} ${zoneStyle[table.zone]?.border ?? "border-slate-200"}`}
                >
                  {table.zone}
                </span>
              ) : null}
              {table.label}
              {typeof table.seats === "number" ? (
                <span className="mt-0.5 text-[10px] text-slate-400">{table.seats}s</span>
              ) : null}
            </div>
          ))}
          </div>
        </div>

        {zones.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {zones.map((zone) => (
              <span
                key={zone}
                className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${
                  zoneStyle[zone]?.text ?? "text-slate-700"
                } ${zoneStyle[zone]?.bg ?? "bg-slate-100"} ${zoneStyle[zone]?.border ?? "border-slate-200"}`}
              >
                {zone}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default FloorOverviewCard;
