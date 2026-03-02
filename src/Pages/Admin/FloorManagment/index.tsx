import { useEffect, useMemo, useRef, useState } from "react";
import {
  FiGrid,
  FiMove,
  FiPlus,
  FiRotateCw,
  FiSquare,
} from "react-icons/fi";

const zones = ["Indoor", "Outdoor", "Bar", "Private Dining"] as const;
const shapes = ["Round", "Square", "Rectangle"] as const;

type Zone = (typeof zones)[number];

type Shape = (typeof shapes)[number];

type Table = {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  seats: number;
  spacing: number;
  zone: Zone;
  shape: Shape;
};

type DragState = {
  id: string;
  offsetX: number;
  offsetY: number;
};

const zoneBadge: Record<Zone, string> = {
  Indoor: "bg-emerald-50 text-emerald-700",
  Outdoor: "bg-sky-50 text-sky-700",
  Bar: "bg-amber-50 text-amber-700",
  "Private Dining": "bg-violet-50 text-violet-700",
};

const shapeStyles: Record<Shape, string> = {
  Round: "rounded-full",
  Square: "rounded-xl",
  Rectangle: "rounded-2xl",
};

const initialTables: Table[] = [
  {
    id: "t1",
    name: "Table 01",
    x: 80,
    y: 60,
    width: 90,
    height: 90,
    rotation: 0,
    seats: 4,
    spacing: 12,
    zone: "Indoor",
    shape: "Round",
  },
  {
    id: "t2",
    name: "Table 02",
    x: 220,
    y: 70,
    width: 120,
    height: 80,
    rotation: 10,
    seats: 6,
    spacing: 14,
    zone: "Indoor",
    shape: "Rectangle",
  },
  {
    id: "t3",
    name: "Bar 1",
    x: 420,
    y: 80,
    width: 140,
    height: 60,
    rotation: -5,
    seats: 5,
    spacing: 10,
    zone: "Bar",
    shape: "Rectangle",
  },
  {
    id: "t4",
    name: "Patio",
    x: 140,
    y: 210,
    width: 110,
    height: 110,
    rotation: 0,
    seats: 4,
    spacing: 16,
    zone: "Outdoor",
    shape: "Square",
  },
];

const FloorManagment = () => {
  const [tables, setTables] = useState<Table[]>(initialTables);
  const [selectedId, setSelectedId] = useState<string>(initialTables[0].id);
  const [dragging, setDragging] = useState<DragState | null>(null);
  const [snapToGrid, setSnapToGrid] = useState(true);
  const canvasRef = useRef<HTMLDivElement | null>(null);

  const selectedTable = useMemo(
    () => tables.find((table) => table.id === selectedId) ?? tables[0],
    [tables, selectedId]
  );

  const updateTable = (id: string, patch: Partial<Table>) => {
    setTables((prev) =>
      prev.map((table) => (table.id === id ? { ...table, ...patch } : table))
    );
  };

  const handlePointerDown = (
    event: React.PointerEvent<HTMLButtonElement>,
    id: string
  ) => {
    event.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const table = tables.find((item) => item.id === id);
    if (!table) return;
    const rect = canvas.getBoundingClientRect();
    setSelectedId(id);
    setDragging({
      id,
      offsetX: event.clientX - rect.left - table.x,
      offsetY: event.clientY - rect.top - table.y,
    });
  };

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      if (!dragging) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const table = tables.find((item) => item.id === dragging.id);
      if (!table) return;
      let nextX = event.clientX - rect.left - dragging.offsetX;
      let nextY = event.clientY - rect.top - dragging.offsetY;

      if (snapToGrid) {
        const grid = 10;
        nextX = Math.round(nextX / grid) * grid;
        nextY = Math.round(nextY / grid) * grid;
      }

      const maxX = rect.width - table.width;
      const maxY = rect.height - table.height;

      updateTable(dragging.id, {
        x: Math.min(Math.max(0, nextX), maxX),
        y: Math.min(Math.max(0, nextY), maxY),
      });
    };

    const handlePointerUp = () => {
      setDragging(null);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [dragging, snapToGrid, tables]);

  const addTable = () => {
    const nextId = `t${tables.length + 1}`;
    const newTable: Table = {
      id: nextId,
      name: `Table ${String(tables.length + 1).padStart(2, "0")}`,
      x: 60,
      y: 60,
      width: 90,
      height: 90,
      rotation: 0,
      seats: 4,
      spacing: 12,
      zone: "Indoor",
      shape: "Round",
    };
    setTables((prev) => [newTable, ...prev]);
    setSelectedId(newTable.id);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Floor Plan
          </div>
          <div className="text-2xl font-semibold text-slate-900">
            Floor Managment
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={addTable}
            className="flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-slate-800"
          >
            <FiPlus />
            Add Table
          </button>
          <label className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600">
            <input
              type="checkbox"
              checked={snapToGrid}
              onChange={(event) => setSnapToGrid(event.target.checked)}
              className="h-3.5 w-3.5 rounded border-slate-300"
            />
            Snap to grid
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.2fr_2fr]">
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-slate-900">Tables</div>
              <FiGrid className="text-slate-400" />
            </div>
            <div className="mt-3 space-y-2">
              {tables.map((table) => (
                <button
                  key={table.id}
                  type="button"
                  onClick={() => setSelectedId(table.id)}
                  className={`w-full rounded-xl border px-3 py-2 text-left text-xs transition ${
                    table.id === selectedId
                      ? "border-slate-900 bg-slate-50"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-800">
                      {table.name}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        zoneBadge[table.zone]
                      }`}
                    >
                      {table.zone}
                    </span>
                  </div>
                  <div className="mt-1 text-[11px] text-slate-500">
                    {table.shape} · {table.seats} seats
                  </div>
                </button>
              ))}
            </div>
          </div>

          {selectedTable && (
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold text-slate-900">
                  Table Attributes
                </div>
                <FiSquare className="text-slate-400" />
              </div>
              <div className="mt-4 grid grid-cols-1 gap-3">
                <label className="text-xs font-semibold text-slate-500">
                  Table name
                  <input
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700"
                    value={selectedTable.name}
                    onChange={(event) =>
                      updateTable(selectedTable.id, { name: event.target.value })
                    }
                  />
                </label>
                <label className="text-xs font-semibold text-slate-500">
                  Zone classification
                  <select
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700"
                    value={selectedTable.zone}
                    onChange={(event) =>
                      updateTable(selectedTable.id, {
                        zone: event.target.value as Zone,
                      })
                    }
                  >
                    {zones.map((zone) => (
                      <option key={zone} value={zone}>
                        {zone}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="text-xs font-semibold text-slate-500">
                  Shape
                  <select
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700"
                    value={selectedTable.shape}
                    onChange={(event) =>
                      updateTable(selectedTable.id, {
                        shape: event.target.value as Shape,
                      })
                    }
                  >
                    {shapes.map((shape) => (
                      <option key={shape} value={shape}>
                        {shape}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="text-xs font-semibold text-slate-500">
                    Width
                    <input
                      type="number"
                      min={40}
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700"
                      value={selectedTable.width}
                      onChange={(event) =>
                        updateTable(selectedTable.id, {
                          width: Number(event.target.value),
                        })
                      }
                    />
                  </label>
                  <label className="text-xs font-semibold text-slate-500">
                    Height
                    <input
                      type="number"
                      min={40}
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700"
                      value={selectedTable.height}
                      onChange={(event) =>
                        updateTable(selectedTable.id, {
                          height: Number(event.target.value),
                        })
                      }
                    />
                  </label>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <label className="text-xs font-semibold text-slate-500">
                    Seating capacity
                    <input
                      type="number"
                      min={1}
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700"
                      value={selectedTable.seats}
                      onChange={(event) =>
                        updateTable(selectedTable.id, {
                          seats: Number(event.target.value),
                        })
                      }
                    />
                  </label>
                  <label className="text-xs font-semibold text-slate-500">
                    Spacing rule (px)
                    <input
                      type="number"
                      min={0}
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700"
                      value={selectedTable.spacing}
                      onChange={(event) =>
                        updateTable(selectedTable.id, {
                          spacing: Number(event.target.value),
                        })
                      }
                    />
                  </label>
                </div>
                <label className="text-xs font-semibold text-slate-500">
                  Orientation
                  <div className="mt-1 flex items-center gap-2">
                    <input
                      type="range"
                      min={-180}
                      max={180}
                      value={selectedTable.rotation}
                      onChange={(event) =>
                        updateTable(selectedTable.id, {
                          rotation: Number(event.target.value),
                        })
                      }
                      className="w-full"
                    />
                    <span className="rounded-full border border-slate-200 bg-white px-2 py-1 text-xs text-slate-600">
                      {selectedTable.rotation}°
                    </span>
                  </div>
                </label>
              </div>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-slate-900">
                Visual Floor Plan
              </div>
              <div className="text-xs text-slate-500">
                Drag and drop tables to adjust layout.
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <FiMove />
              Drag mode
            </div>
          </div>
          <div
            ref={canvasRef}
            className="relative mt-4 h-[520px] overflow-hidden rounded-2xl border border-dashed border-slate-200 bg-[linear-gradient(90deg,rgba(148,163,184,0.12)_1px,transparent_1px),linear-gradient(180deg,rgba(148,163,184,0.12)_1px,transparent_1px)] bg-[size:24px_24px]"
          >
            {tables.map((table) => {
              const isSelected = table.id === selectedId;
              return (
                <button
                  key={table.id}
                  type="button"
                  onPointerDown={(event) => handlePointerDown(event, table.id)}
                  className={`absolute flex items-center justify-center text-[11px] font-semibold shadow-sm transition ${
                    shapeStyles[table.shape]
                  } ${
                    isSelected
                      ? "border-2 border-slate-900 bg-slate-900 text-white"
                      : "border border-slate-200 bg-white text-slate-700 hover:border-slate-400"
                  }`}
                  style={{
                    left: table.x,
                    top: table.y,
                    width: table.width,
                    height: table.height,
                    transform: `rotate(${table.rotation}deg)`,
                  }}
                >
                  <div className="flex flex-col items-center">
                    <span>{table.name}</span>
                    <span className="text-[10px] text-slate-300">
                      {table.seats} seats
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
          <div className="mt-4 text-xs text-slate-500">
            Use spacing rules to keep tables within service distance guidelines.
          </div>
        </div>
      </div>
    </div>
  );
};

export default FloorManagment;
