import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { toast } from "sonner";
import { getJson, postJson, putJson, deleteJson } from "@/lib/api";
import { useBranchContext } from "@/context/BranchContext";

// ── types ────────────────────────────────────────────────────────────────────
type Zone = "Indoor" | "Outdoor" | "Bar" | "Private Dining";
type Shape = "Round" | "Square" | "Rectangle";

const mapShape = (s: string): Shape => {
  const up = s?.toUpperCase() || "";
  if (up === "ROUND") return "Round";
  if (up === "SQUARE") return "Square";
  if (up === "RECTANGLE") return "Rectangle";
  return "Round"; // fallback
};

const mapAreaTypeToBackend = (t: AreaType): string => {
  return t.toUpperCase().replace(/\s+/g, "_");
};

const mapBackendToAreaType = (s: string): AreaType => {
  const up = s?.toUpperCase() || "";
  if (up === "RESTAURANT_AREA") return "Restaurant Area";
  if (up === "HOTEL_AREA")      return "Hotel Area";
  if (up === "LOUNGE_AREA")     return "Lounge Area";
  if (up === "SERVICE_AREA")    return "Service Area";
  if (up === "ENTRANCE_ZONE")   return "Entrance Zone";
  return "Restaurant Area";
};

type AreaType = "Restaurant Area" | "Hotel Area" | "Lounge Area" | "Service Area" | "Entrance Zone";

interface Table {
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
}

interface FloorArea {
  id: string;
  label: string;
  type: AreaType;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  cornerRadius: number;
}

interface FloorLayout {
  tables: Table[];
  areas: FloorArea[];
  selectedTableId: string;
  selectedAreaId: string;
}

interface FloorMeta {
  id: string;
  label: string;
}

interface DragState {
  kind: "table" | "area";
  id: string;
  pointerId: number;
  offsetX: number;
  offsetY: number;
}

interface AreaDraft {
  label: string;
  type: AreaType;
  width: number;
  height: number;
  zIndex: number;
  cornerRadius: number;
}

// FloorManagementSettings removed as it's no longer used

// FloorManagementDbPayload removed as it's no longer used

// ── constants ────────────────────────────────────────────────────────────────
const zones: Zone[] = ["Indoor", "Outdoor", "Bar", "Private Dining"];
const shapes: Shape[] = ["Round", "Square", "Rectangle"];
const areaTypes: AreaType[] = ["Restaurant Area", "Hotel Area", "Lounge Area", "Service Area", "Entrance Zone"];

const CANVAS_WIDTH = 1600;
const CANVAS_HEIGHT = 560;

const shapeRadius: Record<Shape, string> = {
  Round:     "100%",
  Square:    "12px",
  Rectangle: "16px",
};

const zoneBadge: Record<Zone, { bg: string; text: string; dot: string }> = {
  Indoor:          { bg: "#ecfdf5", text: "#059669", dot: "#10b981" },
  Outdoor:         { bg: "#eff6ff", text: "#2563eb", dot: "#3b82f6" },
  Bar:             { bg: "#fffbeb", text: "#d97706", dot: "#f59e0b" },
  "Private Dining":{ bg: "#f5f3ff", text: "#7c3aed", dot: "#8b5cf6" },
};

const areaTone: Record<AreaType, { border: string; bg: string; text: string }> = {
  "Restaurant Area": { border: "#6ee7b7", bg: "rgba(236,253,245,0.6)", text: "#065f46" },
  "Hotel Area":      { border: "#c4b5fd", bg: "rgba(245,243,255,0.6)", text: "#4c1d95" },
  "Lounge Area":     { border: "#93c5fd", bg: "rgba(239,246,255,0.6)", text: "#1e3a8a" },
  "Service Area":    { border: "#fcd34d", bg: "rgba(255,251,235,0.6)", text: "#92400e" },
  "Entrance Zone":   { border: "#fca5a5", bg: "rgba(254,242,242,0.6)", text: "#991b1b" },
};

const initialTables: Table[] = [
  { id: "temp-1", name: "Table 01", x: 80,  y: 60,  width: 90,  height: 90,  rotation: 0,  seats: 4, spacing: 12, zone: "Indoor",  shape: "Round" },
  { id: "temp-2", name: "Table 02", x: 220, y: 70,  width: 120, height: 80,  rotation: 10, seats: 6, spacing: 14, zone: "Indoor",  shape: "Rectangle" },
  { id: "temp-3", name: "Bar 1",    x: 420, y: 80,  width: 140, height: 60,  rotation: 355, seats: 5, spacing: 10, zone: "Bar",     shape: "Rectangle" },
  { id: "temp-4", name: "Patio",    x: 140, y: 210, width: 110, height: 110, rotation: 0,  seats: 4, spacing: 16, zone: "Outdoor", shape: "Square" },
];

const initialAreas: FloorArea[] = [
  { id: "a1", label: "Restaurant Area", type: "Restaurant Area", x: 24, y: 24, width: 1040, height: 480, zIndex: 1, cornerRadius: 24 },
];

const DEFAULT_FLOORS: FloorMeta[] = [{ id: "f1", label: "Ground Floor" }];
const DEFAULT_AREA_DRAFT: AreaDraft = { label: "", type: "Restaurant Area", width: 320, height: 180, zIndex: 1, cornerRadius: 24 };

const createDefaultLayout = (): FloorLayout => ({
  tables: initialTables.map(t => ({ ...t })),
  areas:  initialAreas.map(a => ({ ...a })),
  selectedTableId: initialTables[0]?.id ?? "",
  selectedAreaId:  initialAreas[0]?.id ?? "",
});

const clampNumber = (v: number, lo: number, hi: number) => Math.min(Math.max(v, lo), hi);

// ── primitives ───────────────────────────────────────────────────────────────
const Label = ({ children }: { children: ReactNode }) => (
  <span style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#64748b", marginBottom: 4, letterSpacing: "0.04em", textTransform: "uppercase" }}>
    {children}
  </span>
);

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  style?: CSSProperties;
}
const Input = ({ style, ...props }: InputProps) => (
  <input
    style={{
      width: "100%", boxSizing: "border-box",
      border: "1.5px solid #e2e8f0", borderRadius: 10,
      background: "#f8fafc", padding: "7px 12px",
      fontSize: 13, color: "#1e293b", outline: "none",
      fontFamily: "inherit", ...style,
    }}
    {...props}
  />
);

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  children: ReactNode;
  style?: CSSProperties;
}
const Select = ({ children, style, ...props }: SelectProps) => (
  <div style={{ position: "relative" }}>
    <select
      style={{
        width: "100%", appearance: "none",
        border: "1.5px solid #e2e8f0", borderRadius: 10,
        background: "#f8fafc", padding: "7px 32px 7px 12px",
        fontSize: 13, color: "#1e293b", outline: "none",
        fontFamily: "inherit", cursor: "pointer", ...style,
      }}
      {...props}
    >
      {children}
    </select>
    <svg style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth={2.5}>
      <path d="M6 9l6 6 6-6" />
    </svg>
  </div>
);

type BtnVariant = "ghost" | "solid" | "danger" | "sky" | "indigo";
interface BtnProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: BtnVariant;
  active?: boolean;
  style?: CSSProperties;
}
const Btn = ({ children, variant = "ghost", active, style, ...props }: BtnProps) => {
  const base: CSSProperties = {
    display: "inline-flex", alignItems: "center", gap: 6,
    borderRadius: 999, border: "1.5px solid transparent",
    padding: "6px 14px", fontSize: 12, fontWeight: 600,
    cursor: "pointer", transition: "all 0.15s", fontFamily: "inherit",
    whiteSpace: "nowrap",
  };
  const variants: Record<BtnVariant, CSSProperties> = {
    solid:  { background: "#0f172a", color: "#fff", borderColor: "#0f172a" },
    ghost:  active ? { background: "#0f172a", color: "#fff", borderColor: "#0f172a" }
                   : { background: "#fff", color: "#475569", borderColor: "#e2e8f0" },
    danger: { background: "#fff1f2", color: "#be123c", borderColor: "#fecdd3" },
    sky:    active ? { background: "#e0f2fe", color: "#0369a1", borderColor: "#bae6fd" }
                   : { background: "#fff", color: "#475569", borderColor: "#e2e8f0" },
    indigo: active ? { background: "#eef2ff", color: "#4338ca", borderColor: "#c7d2fe" }
                   : { background: "#fff", color: "#475569", borderColor: "#e2e8f0" },
  };
  return (
    <button style={{ ...base, ...variants[variant], ...style }} {...props}>
      {children}
    </button>
  );
};

const Card = ({ children, className, style }: { children: ReactNode; className?: string; style?: CSSProperties }) => (
  <div className={className} style={{ background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: 18, padding: 16, boxShadow: "0 1px 4px rgba(0,0,0,0.04)", ...style }}>
    {children}
  </div>
);

const SectionTitle = ({ children }: { children: ReactNode }) => (
  <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", marginBottom: 12 }}>{children}</div>
);

// ── icons ────────────────────────────────────────────────────────────────────
const Icon = ({ d, size = 14 }: { d: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const Icons = {
  Plus:         () => <Icon d="M12 5v14M5 12h14" />,
  Trash:        () => <Icon d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />,
  Edit:         () => <Icon d="M12 20h9M16.5 3.5a2.1 2.1 0 113 3L7 19l-4 1 1-4 12.5-12.5z" />,
  Grid:         () => <Icon d="M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z" />,
  Move:         () => <Icon d="M5 9l-3 3 3 3M9 5l3-3 3 3M15 19l-3 3-3-3M19 9l3 3-3 3M2 12h20M12 2v20" />,
  ChevronLeft:  () => <Icon d="M15 18l-6-6 6-6" />,
  ChevronRight: () => <Icon d="M9 18l6-6-6-6" />,
  ChevronUp:    () => <Icon d="M18 15l-6-6-6 6" />,
  ChevronDown:  () => <Icon d="M6 9l6 6 6-6" />,
  Layers:       () => <Icon d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />,
  Table:        () => <Icon d="M3 3h18v18H3zM3 9h18M3 15h18M9 3v18M15 3v18" />,
  Zap:          () => <Icon d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />,
};

// ── main component ────────────────────────────────────────────────────────────
export default function FloorManagement() {
  const { selectedBranchId, branches } = useBranchContext();
  const [floors, setFloors]               = useState<FloorMeta[]>(DEFAULT_FLOORS);
  const [activeFloorId, setActiveFloorId] = useState<string>("f1");
  const [floorLayouts, setFloorLayouts]   = useState<Record<string, FloorLayout>>({ f1: createDefaultLayout() });
  const [sidebarTab, setSidebarTab]       = useState<"tables" | "areas">("tables");
  const [sidebarOpen, setSidebarOpen]     = useState<boolean>(true);
  const [snapToGrid, setSnapToGrid]       = useState<boolean>(true);
  const [tablesListOpen, setTablesListOpen] = useState<boolean>(true);
  const [editingFloorId, setEditingFloorId] = useState<string | null>(null);
  const [editingFloorLabel, setEditingFloorLabel] = useState<string>("");
  const [dragging, setDragging]           = useState<DragState | null>(null);
  const [deleteModal, setDeleteModal]     = useState<boolean>(false);
  const [areaDraft, setAreaDraft]         = useState<AreaDraft>(DEFAULT_AREA_DRAFT);
  const [isLoading, setIsLoading]         = useState<boolean>(false);
  const [quickAddModal, setQuickAddModal]   = useState<boolean>(false);
  const [quickAddCount, setQuickAddCount]   = useState<number>(5);
  const [quickAddZone, setQuickAddZone]     = useState<Zone>("Indoor");
  const [quickAddFloorId, setQuickAddFloorId] = useState<string>("f1");
  const [manageTablesModal, setManageTablesModal] = useState<boolean>(false);
  const [manageTablesFloorId, setManageTablesFloorId] = useState<string>("f1");
  const canvasRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!selectedBranchId) return;

    let cancelled = false;
    const loadFloors = async () => {
      setIsLoading(true);
      try {
        const response = await getJson<any[]>(`/floor-plans?branchId=${selectedBranchId}`);
        if (cancelled) return;

        let rawFloors = response.data;
        
        // AUTO-PROVISION: If no floors exist, create a default "Main Floor" on the backend
        if (!rawFloors || rawFloors.length === 0) {
          try {
            const createResponse = await postJson<any>("/floor-plans", {
              branchId: selectedBranchId,
              name: "Main Floor",
              description: "Default layout",
              canvasWidth: 800,
              canvasHeight: 600,
              isActive: true,
            });
            rawFloors = [createResponse.data];
          } catch (createErr) {
            console.error("Failed to auto-create floor plan", createErr);
            // Fallback to local-only if backend creation fails (not ideal)
            setFloors(DEFAULT_FLOORS);
            setFloorLayouts({ f1: createDefaultLayout() });
            setActiveFloorId("f1");
            return;
          }
        }

        const nextFloors: FloorMeta[] = rawFloors.map((fp: any) => ({
          id: fp.id,
          label: fp.name,
        }));

        const nextLayouts: Record<string, FloorLayout> = {};
        rawFloors.forEach((fp: any) => {
          nextLayouts[fp.id] = {
            tables: (fp.tables || []).map((t: any) => ({
              id: t.id,
              name: t.name || t.tableNumber,
              x: t.positionX ?? 0,
              y: t.positionY ?? 0,
              width: t.width ?? 90,
              height: t.height ?? 90,
              rotation: t.rotation ?? 0,
              seats: t.capacity ?? 4,
              spacing: t.spacing ?? 12,
              zone: t.zone?.name ?? "Indoor",
              shape: mapShape(t.shape),
            })),
            areas: (fp.zones || []).map((z: any) => ({
              id: z.id,
              label: z.name,
              type: mapBackendToAreaType(z.type),
              x: z.positionX ?? 0,
              y: z.positionY ?? 0,
              width: z.width ?? 320,
              height: z.height ?? 180,
              zIndex: z.zIndex ?? 1,
              cornerRadius: z.cornerRadius ?? 24,
            })),
            selectedTableId: fp.tables?.[0]?.id ?? "",
            selectedAreaId: fp.zones?.[0]?.id ?? "",
          };
        });

        setFloors(nextFloors);
        setFloorLayouts(nextLayouts);
        setActiveFloorId(nextFloors[0].id);
      } catch (error) {
        console.error("Failed to load floors", error);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    void loadFloors();
    return () => { cancelled = true; };
  }, [selectedBranchId]);

  const layout          = floorLayouts[activeFloorId] ?? createDefaultLayout();
  const tables          = layout.tables;
  const areas           = layout.areas;
  const selectedTableId = layout.selectedTableId;
  const selectedAreaId  = layout.selectedAreaId;
  const activeFloor     = floors.find(f => f.id === activeFloorId);

  // ── updaters ──
  const patchLayout = useCallback((patch: Partial<FloorLayout>) =>
    setFloorLayouts(prev => ({ ...prev, [activeFloorId]: { ...(prev[activeFloorId] ?? createDefaultLayout()), ...patch } }))
  , [activeFloorId]);

  const setTables = useCallback((fn: Table[] | ((prev: Table[]) => Table[])) => {
    setFloorLayouts(prev => {
      const cur  = prev[activeFloorId] ?? createDefaultLayout();
      const next = typeof fn === "function" ? fn(cur.tables) : fn;
      return { ...prev, [activeFloorId]: { ...cur, tables: next, selectedTableId: next.some(t => t.id === cur.selectedTableId) ? cur.selectedTableId : next[0]?.id ?? "" } };
    });
  }, [activeFloorId]);

  const setAreas = useCallback((fn: FloorArea[] | ((prev: FloorArea[]) => FloorArea[])) => {
    setFloorLayouts(prev => {
      const cur  = prev[activeFloorId] ?? createDefaultLayout();
      const next = typeof fn === "function" ? fn(cur.areas) : fn;
      return { ...prev, [activeFloorId]: { ...cur, areas: next, selectedAreaId: next.some(a => a.id === cur.selectedAreaId) ? cur.selectedAreaId : next[0]?.id ?? "" } };
    });
  }, [activeFloorId]);

  const setSelectedTableId = useCallback((id: string) => patchLayout({ selectedTableId: id }), [patchLayout]);
  const setSelectedAreaId  = useCallback((id: string) => patchLayout({ selectedAreaId: id }), [patchLayout]);

  const selectedTable = useMemo(() => tables.find(t => t.id === selectedTableId) ?? tables[0], [tables, selectedTableId]);
  const selectedArea  = useMemo(() => areas.find(a => a.id === selectedAreaId)   ?? areas[0],  [areas,  selectedAreaId]);

  const clampTable = useCallback((t: Table): Table => {
    const c  = canvasRef.current;
    const cw = c?.clientWidth  || CANVAS_WIDTH;
    const ch = c?.clientHeight || CANVAS_HEIGHT;
    const w  = clampNumber(t.width,  40, cw);
    const h  = clampNumber(t.height, 40, ch);
    return { ...t, width: w, height: h, x: clampNumber(t.x, 0, cw - w), y: clampNumber(t.y, 0, ch - h) };
  }, []);

  const clampArea = useCallback((a: FloorArea): FloorArea => {
    const c      = canvasRef.current;
    const cw     = c?.clientWidth  || CANVAS_WIDTH;
    const ch     = c?.clientHeight || CANVAS_HEIGHT;
    const w      = clampNumber(a.width,  20, cw);
    const h      = clampNumber(a.height, 20, ch);
    const maxCr  = Math.floor(Math.min(w, h) / 2);
    return { ...a, width: w, height: h, cornerRadius: clampNumber(a.cornerRadius, 0, maxCr), x: clampNumber(a.x, 0, cw - w), y: clampNumber(a.y, 0, ch - h) };
  }, []);

  const [deletedTableIds, setDeletedTableIds] = useState<string[]>([]);
  const [deletedAreaIds, setDeletedAreaIds] = useState<string[]>([]);

  const updateTable = useCallback((id: string, patch: Partial<Table>) =>
    setTables(prev => prev.map(t => t.id === id ? { ...t, ...patch } : t))
  , [setTables]);

  const addTable = () => {
    const newId = `temp-t-${Date.now()}`;
    const normalized: Table = {
      id: newId, 
      name: `Table ${String(tables.length + 1).padStart(2, "0")}`, 
      x: 60, y: 60,
      width: 90, height: 90, rotation: 0, seats: 4,
      spacing: 12, zone: "Indoor", shape: "Round"
    };
    setTables(prev => [normalized, ...prev]);
    setSelectedTableId(normalized.id);
    setSidebarTab("tables");
    toast.info("Table added locally. Save layout to persist.");
  };

  const addArea = () => {
    const newId = `temp-a-${Date.now()}`;
    const a: FloorArea = {
      id: newId, 
      label: areaDraft.label.trim() || areaDraft.type, 
      type: "Restaurant Area",
      x: 24, y: 24,
      width: 320, height: 180,
      zIndex: 1, cornerRadius: 24,
    };
    setAreas(prev => [...prev, clampArea(a)]);
    setAreaDraft(p => ({ ...p, label: "" }));
    setSelectedAreaId(a.id);
    toast.info("Zone added locally. Save layout to persist.");
  };

  const quickAddTables = () => {
    const count = Math.max(1, Math.min(50, quickAddCount)); // Limit 1-50 tables
    const newTables: Table[] = [];
    
    // Grid layout: calculate rows and columns
    const cols = Math.ceil(Math.sqrt(count));
    const rows = Math.ceil(count / cols);
    const spacing = 20; // Space between tables
    const tableWidth = 90;
    const tableHeight = 90;
    const startX = 80;
    const startY = 60;
    
    let index = 0;
    for (let r = 0; r < rows && index < count; r++) {
      for (let c = 0; c < cols && index < count; c++) {
        const newId = `temp-t-${Date.now()}-${index}`;
        const table: Table = {
          id: newId,
          name: `Table ${String(index + 1).padStart(2, "0")}`,
          x: startX + c * (tableWidth + spacing),
          y: startY + r * (tableHeight + spacing),
          width: tableWidth,
          height: tableHeight,
          rotation: 0,
          seats: 4,
          spacing: 12,
          zone: quickAddZone,
          shape: "Round"
        };
        newTables.push(table);
        index++;
      }
    }
    
    // Add tables to the selected floor ONLY
    const targetFloorId = quickAddFloorId;
    setFloorLayouts(prev => {
      const floorLayout = prev[targetFloorId] || { tables: [], areas: [], selectedTableId: "", selectedAreaId: "" };
      return {
        ...prev,
        [targetFloorId]: {
          ...floorLayout,
          tables: [...newTables, ...floorLayout.tables]
        }
      };
    });
    
    setQuickAddModal(false);
    toast.success(`Added ${count} tables to floor. Save to persist.`);
  };

  const deleteTableLocal = (id: string) => {
    const isUuid = (id: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    if (isUuid(id)) {
      setDeletedTableIds(prev => [...prev, id]);
    }
    setTables(prev => prev.filter(t => t.id !== id));
    toast.info("Table removed locally.");
  };

  const deleteAreaLocal = (id: string) => {
    const isUuid = (id: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    if (isUuid(id)) {
      setDeletedAreaIds(prev => [...prev, id]);
    }
    setAreas(prev => prev.filter(a => a.id !== id));
    toast.info("Zone removed locally.");
  };

  const addFloor = async () => {
    if (!selectedBranchId) return;
    const toastId = toast.loading("Adding floor...");
    try {
      const response = await postJson<any>("/floor-plans", {
        branchId: selectedBranchId,
        name: `Floor ${floors.length + 1}`,
        description: "",
      });
      const fp = response.data;
      setFloors(prev => [...prev, { id: fp.id, label: fp.name }]);
      setFloorLayouts(prev => ({ ...prev, [fp.id]: { tables: [], areas: [], selectedTableId: "", selectedAreaId: "" } }));
      setActiveFloorId(fp.id);
      toast.success("Floor plan added.", { id: toastId });
    } catch (error: any) {
      console.error("Failed to add floor", error);
      toast.error(error.message || "Failed to add floor.", { id: toastId });
    }
  };

  const deleteFloor = async () => {
    if (floors.length <= 1 || !activeFloorId) return;
    const toastId = toast.loading("Deleting floor...");
    try {
      await deleteJson(`/floor-plans/${activeFloorId}`);
      const rest = floors.filter(f => f.id !== activeFloorId);
      setFloors(rest);
      setFloorLayouts(prev => { const n = { ...prev }; delete n[activeFloorId]; return n; });
      setActiveFloorId(rest[0]?.id ?? "");
      setDeleteModal(false);
      toast.success("Floor plan deleted.", { id: toastId });
    } catch (error: any) {
      console.error("Failed to delete floor", error);
      toast.error(error.message || "Failed to delete floor.", { id: toastId });
    }
  };

  const startRenameFloor = (id: string) => {
    const current = floors.find(f => f.id === id);
    if (!current) return;
    setActiveFloorId(id);
    setEditingFloorId(id);
    setEditingFloorLabel(current.label);
  };

  const saveRenameFloor = async () => {
    if (!editingFloorId) return;
    const next = editingFloorLabel.trim();
    if (!next) return;
    const toastId = toast.loading("Renaming floor...");
    try {
      await putJson(`/floor-plans/${editingFloorId}`, { name: next });
      setFloors(prev => prev.map(f => (f.id === editingFloorId ? { ...f, label: next } : f)));
      setEditingFloorId(null);
      setEditingFloorLabel("");
      toast.success("Floor renamed.", { id: toastId });
    } catch (error: any) {
      console.error("Failed to rename floor", error);
      toast.error(error.message || "Failed to rename floor.", { id: toastId });
    }
  };

  const handleSaveLayout = async () => {
    if (!activeFloorId || activeFloorId === "f1") {
      toast.error("Please wait for floor plan initialization or create one.");
      return;
    }
    const toastId = toast.loading("Saving layout...");
    try {
      const isUuid = (id: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
      
      const newTables = tables.filter(t => !isUuid(t.id));
      const existingTables = tables.filter(t => isUuid(t.id));

      const newAreas = areas.filter(a => !isUuid(a.id));
      const existingAreas = areas.filter(a => isUuid(a.id));

      // 1. Delete removed items
      for (const id of deletedTableIds) {
        await deleteJson(`/floor-plans/tables/${id}`);
      }
      for (const id of deletedAreaIds) {
        await deleteJson(`/floor-plans/zones/${id}`);
      }

      // 2. Areas (Zones)
      for (const na of newAreas) {
        await postJson("/floor-plans/zones", {
          floorPlanId: activeFloorId,
          name: na.label,
          type: mapAreaTypeToBackend(na.type),
          positionX: Math.round(na.x),
          positionY: Math.round(na.y),
          width: na.width,
          height: na.height,
          zIndex: na.zIndex,
          cornerRadius: na.cornerRadius,
        });
      }
      for (const ea of existingAreas) {
        await putJson(`/floor-plans/zones/${ea.id}`, {
          name: ea.label,
          type: mapAreaTypeToBackend(ea.type),
          positionX: Math.round(ea.x),
          positionY: Math.round(ea.y),
          width: ea.width,
          height: ea.height,
          zIndex: ea.zIndex,
          cornerRadius: ea.cornerRadius,
        });
      }

      // 3. Tables sequentially (Creation)
      for (const nt of newTables) {
        await postJson("/floor-plans/tables", {
          floorPlanId: activeFloorId,
          tableNumber: nt.name,
          name: nt.name,
          positionX: Math.round(nt.x),
          positionY: Math.round(nt.y),
          width: nt.width,
          height: nt.height,
          rotation: Math.round(((nt.rotation % 360) + 360) % 360),
          capacity: nt.seats,
          spacing: nt.spacing,
          shape: nt.shape.toUpperCase(),
          label: nt.name,
        });
      }

      // 4. Bulk update existing table positions
      if (existingTables.length > 0) {
        await putJson("/floor-plans/tables/bulk/positions", {
          tables: existingTables.map(t => ({
            id: t.id,
            name: t.name,
            positionX: Math.round(t.x),
            positionY: Math.round(t.y),
            width: t.width,
            height: t.height,
            rotation: Math.round(((t.rotation % 360) + 360) % 360),
            capacity: t.seats,
            spacing: t.spacing,
            shape: t.shape.toUpperCase(),
            label: t.name,
          }))
        });
      }

      // 5. Refresh layout to get new UUIDs and avoid "temp-" IDs
      const response = await getJson<any[]>(`/floor-plans?branchId=${selectedBranchId}`);
      const rawFloors = response.data;
      const currentFp = rawFloors.find((fp: any) => fp.id === activeFloorId);
      if (currentFp) {
        patchLayout({
          tables: (currentFp.tables || []).map((t: any) => ({
            id: t.id,
            name: t.name || t.tableNumber,
            x: t.positionX ?? 0,
            y: t.positionY ?? 0,
            width: t.width ?? 90,
            height: t.height ?? 90,
            rotation: t.rotation ?? 0,
            seats: t.capacity ?? 4,
            spacing: t.spacing ?? 12,
            zone: t.zone?.name ?? "Indoor",
            shape: mapShape(t.shape),
          })),
          areas: (currentFp.zones || []).map((z: any) => ({
            id: z.id,
            label: z.name,
            type: mapBackendToAreaType(z.type),
            x: z.positionX ?? 0,
            y: z.positionY ?? 0,
            width: z.width ?? 320,
            height: z.height ?? 180,
            zIndex: z.zIndex ?? 1,
            cornerRadius: z.cornerRadius ?? 24,
          })),
        });
      }

      setDeletedTableIds([]);
      setDeletedAreaIds([]);
      toast.success("Layout saved successfully!", { id: toastId });
    } catch (error: any) {
      console.error("Failed to save layout", error);
      toast.error(error.message || "Failed to save layout.", { id: toastId });
    }
  };

  const cancelRenameFloor = () => {
    setEditingFloorId(null);
    setEditingFloorLabel("");
  };

  // ── drag ──
  const startDrag = (e: React.PointerEvent<HTMLButtonElement>, kind: "table" | "area", id: string) => {
    e.preventDefault();
    const c = canvasRef.current;
    if (!c) return;
    const item = kind === "table" ? tables.find(t => t.id === id) : areas.find(a => a.id === id);
    if (!item) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    const rect = c.getBoundingClientRect();
    if (kind === "table") { setSelectedTableId(id); setSidebarTab("tables"); }
    else                  { setSelectedAreaId(id);  setSidebarTab("areas"); }
    setDragging({ kind, id, pointerId: e.pointerId, offsetX: e.clientX - rect.left - item.x, offsetY: e.clientY - rect.top - item.y });
  };

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (!dragging || e.pointerId !== dragging.pointerId) return;
      const c = canvasRef.current;
      if (!c) return;
      const rect = c.getBoundingClientRect();
      const grid = 10;
      let nx = e.clientX - rect.left - dragging.offsetX;
      let ny = e.clientY - rect.top  - dragging.offsetY;
      if (snapToGrid) { nx = Math.round(nx / grid) * grid; ny = Math.round(ny / grid) * grid; }
      if (dragging.kind === "table") {
        const t = tables.find(t => t.id === dragging.id);
        if (!t) return;
        updateTable(dragging.id, { x: clampNumber(nx, 0, rect.width - t.width), y: clampNumber(ny, 0, rect.height - t.height) });
      } else {
        const a = areas.find(a => a.id === dragging.id);
        if (!a) return;
        setAreas(prev => prev.map(item => item.id === dragging.id
          ? clampArea({ ...item, x: clampNumber(nx, 0, rect.width - Math.min(item.width, rect.width)), y: clampNumber(ny, 0, rect.height - Math.min(item.height, rect.height)) })
          : item
        ));
      }
    };
    const onUp = (e: PointerEvent) => { if (dragging && e.pointerId === dragging.pointerId) setDragging(null); };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup",   onUp);
    return () => { window.removeEventListener("pointermove", onMove); window.removeEventListener("pointerup", onUp); };
  }, [areas, clampArea, dragging, setAreas, snapToGrid, tables, updateTable]);

  useEffect(() => {
    const fit = () => {
      if (!canvasRef.current) return;
      setTables(prev => prev.map(clampTable));
      setAreas(prev  => prev.map(clampArea));
    };
    const frame = requestAnimationFrame(fit);
    window.addEventListener("resize", fit);
    return () => { cancelAnimationFrame(frame); window.removeEventListener("resize", fit); };
  }, [clampArea, clampTable, setAreas, setTables]);

  // ── sub-forms ──
  const renderTableForm = (t: Table) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div>
        <Label>Table name</Label>
        <Input value={t.name} onChange={e => updateTable(t.id, { name: e.target.value })} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <div>
          <Label>Zone</Label>
          <Select value={t.zone} onChange={e => updateTable(t.id, { zone: e.target.value as Zone })}>
            {zones.map(z => <option key={z}>{z}</option>)}
          </Select>
        </div>
        <div>
          <Label>Shape</Label>
          <Select value={t.shape} onChange={e => updateTable(t.id, { shape: e.target.value as Shape })}>
            {shapes.map(s => <option key={s}>{s}</option>)}
          </Select>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <div><Label>Width</Label><Input  type="number" min={40} value={t.width}  onChange={e => updateTable(t.id, { width:  +e.target.value })} /></div>
        <div><Label>Height</Label><Input type="number" min={40} value={t.height} onChange={e => updateTable(t.id, { height: +e.target.value })} /></div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <div><Label>Seats</Label><Input        type="number" min={1} value={t.seats}   onChange={e => updateTable(t.id, { seats:   +e.target.value })} /></div>
        <div><Label>Spacing (px)</Label><Input type="number" min={0} value={t.spacing} onChange={e => updateTable(t.id, { spacing: +e.target.value })} /></div>
      </div>
      <div>
        <Label>Rotation: {t.rotation}°</Label>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <button onClick={() => updateTable(t.id, { rotation: ((t.rotation - 5) + 360) % 360 })} style={{ width: 28, height: 28, borderRadius: "50%", border: "1.5px solid #e2e8f0", background: "#fff", cursor: "pointer", fontWeight: 700, color: "#475569", display: "flex", alignItems: "center", justifyContent: "center" }}>-</button>
          <input type="range" min={0} max={359} value={t.rotation} onChange={e => updateTable(t.id, { rotation: +e.target.value })} style={{ flex: 1, accentColor: "#0f172a" }} />
          <button onClick={() => updateTable(t.id, { rotation: (t.rotation + 5) % 360 })} style={{ width: 28, height: 28, borderRadius: "50%", border: "1.5px solid #e2e8f0", background: "#fff", cursor: "pointer", fontWeight: 700, color: "#475569", display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
        </div>
      </div>
    </div>
  );

  const renderAreaForm = (a: FloorArea | AreaDraft, isEdit: boolean) => {
    const val = isEdit ? (a as FloorArea) : areaDraft;
    const set = isEdit
      ? (patch: Partial<FloorArea>) => setAreas(prev => prev.map(item => item.id === (a as FloorArea).id ? { ...item, ...patch } : item))
      : (patch: Partial<AreaDraft>)  => setAreaDraft(p => ({ ...p, ...patch }));
    const blur = isEdit ? () => setAreas(prev => prev.map(item => item.id === (a as FloorArea).id ? clampArea(item) : item)) : undefined;

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <div>
          <Label>Label</Label>
          <Input placeholder="e.g. Hotel Area" value={val.label} onChange={e => set({ label: e.target.value })} />
        </div>
        <div>
          <Label>Type</Label>
          <Select value={val.type} onChange={e => set({ type: e.target.value as AreaType })}>
            {areaTypes.map(t => <option key={t}>{t}</option>)}
          </Select>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div><Label>Width</Label><Input  type="number" min={20} value={val.width}  onChange={e => set({ width:  +e.target.value })} onBlur={blur} /></div>
          <div><Label>Height</Label><Input type="number" min={20} value={val.height} onChange={e => set({ height: +e.target.value })} onBlur={blur} /></div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div><Label>Layer (z)</Label><Input     type="number" min={0} value={val.zIndex}       onChange={e => set({ zIndex:       +e.target.value })} /></div>
          <div><Label>Corner radius</Label><Input type="number" min={0} value={val.cornerRadius} onChange={e => set({ cornerRadius: +e.target.value })} onBlur={blur} /></div>
        </div>
        {!isEdit && (
          <Btn variant="solid" onClick={addArea} style={{ justifyContent: "center", marginTop: 4 }}>
            <Icons.Plus /> Add area
          </Btn>
        )}
      </div>
    );
  };

  // ── render ──────────────────────────────────────────────────────────────────
  return (
    <div className="fm-page" style={{ fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif", background: "#f1f5f9", minHeight: "100%", height: "auto", overflowX: "hidden", overflowY: "auto", padding: "20px 20px 32px" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        input:focus, select:focus { border-color: #94a3b8 !important; box-shadow: 0 0 0 3px rgba(148,163,184,0.15); }
        button:disabled { opacity: 0.45; cursor: not-allowed !important; }
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 99px; }
        input[type=range] { height: 4px; }

        .fm-workspace { display: grid; gap: 16px; align-items: stretch; }
        .fm-workspace-open { grid-template-columns: 300px minmax(0, 1620px); justify-content: flex-start; }
        .fm-workspace-closed { grid-template-columns: minmax(0, 1620px); justify-content: flex-start; }
        .fm-topbar-left { min-width: 0; }
        .fm-floor-actions { min-width: 0; }
        .fm-toolbar-tabs, .fm-toolbar-actions { min-width: 0; }
        .fm-sidebar { display: flex; flex-direction: column; gap: 12px; min-width: 0; overflow-y: auto; max-height: 660px; padding-right: 4px; }
        .fm-canvas-card { min-width: 0; display: flex; flex-direction: column; height: auto; }
        .fm-canvas-inner { position: relative; min-height: 560px; width: 1600px; min-width: 1600px; max-width: 1600px; height: 560px; touch-action: none; user-select: none; }

        @media (max-width: 1024px) {
          .fm-workspace { grid-template-columns: 1fr !important; justify-content: stretch !important; }
          .fm-sidebar { max-height: none; overflow: visible; padding-right: 0; }
        }

        @media (max-width: 768px) {
          .fm-page { padding: 12px 10px 16px !important; overflow-y: auto !important; }
          .fm-topbar-card { padding: 12px !important; }
          .fm-topbar-row { align-items: flex-start !important; }
          .fm-topbar-left { flex-direction: column; align-items: flex-start !important; gap: 8px !important; width: 100%; }
          .fm-topbar-divider { display: none; }
          .fm-topbar-meta, .fm-topbar-stats, .fm-floor-actions { width: 100%; }

          .fm-toolbar-card { padding: 10px 12px !important; }
          .fm-toolbar-row { align-items: stretch !important; }
          .fm-toolbar-tabs, .fm-toolbar-actions { width: 100%; flex-wrap: wrap; }
          .fm-toolbar-tabs > button { flex: 1 1 calc(50% - 6px); justify-content: center; }
          .fm-toolbar-actions > button { flex: 1 1 calc(50% - 6px); justify-content: center; }
          .fm-toolbar-actions > button:last-child { flex-basis: 100%; }

          .fm-canvas-card { height: auto; min-height: 420px; }
          .fm-canvas-inner { width: 1600px; min-width: 1600px; max-width: 1600px; min-height: 560px; height: 560px; }
        }
      `}</style>
      
      {isLoading && (
        <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,0.7)", backdropFilter: "blur(2px)" }}>
           <div style={{ fontSize: 14, fontWeight: 600, color: "#0f172a" }}>Loading floor plans...</div>
        </div>
      )}

      {!selectedBranchId ? (
        <Card className="fm-topbar-card" style={{ padding: "40px 20px", textAlign: "center", marginBottom: 12 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: "#0f172a", marginBottom: 8 }}>Select a Branch</h2>
          <p style={{ fontSize: 14, color: "#64748b", margin: 0 }}>Please select a specific branch from the sidebar to manage floor plans.</p>
        </Card>
      ) : (
        <>
          {/* ── TOP BAR: header + floor selector merged ── */}
          <Card className="fm-topbar-card" style={{ marginBottom: 12, padding: "14px 20px" }}>
        <div className="fm-topbar-row" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div className="fm-topbar-left" style={{ display: "flex", alignItems: "center", gap: 16, flexShrink: 0 }}>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 1 }}>Restaurant Management</div>
              <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#0f172a", letterSpacing: "-0.4px", lineHeight: 1.2 }}>Floor Management</h1>
            </div>
            <div className="fm-topbar-divider" style={{ width: 1, height: 32, background: "#e2e8f0", flexShrink: 0 }} />
            <div className="fm-topbar-meta" style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 0 2px #dcfce7" }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: "#374151" }}>
                {branches.find((b) => b.id === selectedBranchId)?.name} &gt; {activeFloor?.label}
              </span>
            </div>
            <div className="fm-topbar-stats" style={{ fontSize: 12, color: "#94a3b8", fontWeight: 500 }}>
              {tables.length} tables · {areas.length} areas
              <span style={{ marginLeft: 12, color: "#0f172a", fontWeight: 600 }}>
                Branch: {Object.values(floorLayouts).reduce((sum, layout) => sum + layout.tables.length, 0)} tables · {floors.length} floors
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Btn 
                variant="solid"
                onClick={() => { setManageTablesFloorId(activeFloorId); setManageTablesModal(true); }}
                title="Manage tables for all floors"
              >
                <Icons.Table /> Manage Tables
              </Btn>
            </div>
          </div>
          <div className="fm-floor-actions" style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: "#cbd5e1", letterSpacing: "0.08em", textTransform: "uppercase", marginRight: 2 }}>Floors</span>
            {floors.map(f => (
              editingFloorId === f.id ? (
                <input
                  key={f.id}
                  value={editingFloorLabel}
                  autoFocus
                  onChange={e => setEditingFloorLabel(e.target.value)}
                  onBlur={saveRenameFloor}
                  onKeyDown={e => {
                    if (e.key === "Enter") saveRenameFloor();
                    if (e.key === "Escape") cancelRenameFloor();
                  }}
                  style={{
                    border: "1.5px solid #0f172a",
                    borderRadius: 999,
                    padding: "4px 13px",
                    fontSize: 12,
                    fontWeight: 600,
                    fontFamily: "inherit",
                    background: "#fff",
                    color: "#0f172a",
                    minWidth: 90,
                    outline: "none",
                  }}
                />
              ) : (
                <button key={f.id} onClick={() => setActiveFloorId(f.id)} onDoubleClick={() => startRenameFloor(f.id)} style={{
                  border: "1.5px solid", borderRadius: 999, padding: "4px 13px", fontSize: 12, fontWeight: 600,
                  cursor: "pointer", transition: "all 0.15s", fontFamily: "inherit",
                  borderColor: f.id === activeFloorId ? "#0f172a" : "#e2e8f0",
                  background:  f.id === activeFloorId ? "#0f172a" : "#fff",
                  color:       f.id === activeFloorId ? "#fff"    : "#64748b",
                }}>{f.label}</button>
              )
            ))}
            <Btn onClick={addFloor}><Icons.Plus /> Add</Btn>
            <Btn
              onMouseDown={e => {
                if (editingFloorId === activeFloorId) {
                  e.preventDefault();
                }
              }}
              onClick={() => {
                if (!activeFloor) return;
                if (editingFloorId === activeFloorId) {
                  saveRenameFloor();
                  return;
                }
                startRenameFloor(activeFloorId);
              }}
              disabled={!activeFloor}
            >
              <Icons.Edit /> {editingFloorId === activeFloorId ? "Save" : "Rename"}
            </Btn>
            <Btn variant="danger" onClick={() => floors.length > 1 && setDeleteModal(true)} disabled={floors.length <= 1}>
              <Icons.Trash /> Delete
            </Btn>
          </div>
        </div>
      </Card>

      {/* ── TOOLBAR ── */}
      <Card className="fm-toolbar-card" style={{ marginBottom: 16, padding: "10px 16px" }}>
        <div className="fm-toolbar-row" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
          <div className="fm-toolbar-tabs" style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Btn active={sidebarTab === "tables"} onClick={() => { setSidebarTab("tables"); setSidebarOpen(true); }}>
              <Icons.Table /> Tables
            </Btn>
            <Btn active={sidebarTab === "areas"} onClick={() => { setSidebarTab("areas"); setSidebarOpen(true); }}>
              <Icons.Layers /> Areas
            </Btn>
          </div>
          <div className="fm-toolbar-actions" style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Btn variant="sky" active={snapToGrid} onClick={() => setSnapToGrid(p => !p)}>
              <Icons.Grid /> Snap {snapToGrid ? "On" : "Off"}
            </Btn>
            <Btn variant="indigo" active={!sidebarOpen} onClick={() => setSidebarOpen(p => !p)}>
              {sidebarOpen ? <Icons.ChevronLeft /> : <Icons.ChevronRight />}
              {sidebarOpen ? "Hide panel" : "Show panel"}
            </Btn>
            <Btn variant="solid" onClick={handleSaveLayout} style={{ background: "#22c55e", borderColor: "#22c55e" }}>Save Layout</Btn>
            <Btn variant="solid" onClick={addTable}><Icons.Plus /> Add table</Btn>
            <Btn variant="solid" onClick={() => { setQuickAddFloorId(activeFloorId); setQuickAddModal(true); }}><Icons.Zap /> Quick Add</Btn>
          </div>
        </div>
      </Card>

      {/* ── WORKSPACE ── */}
      <div className={`fm-workspace ${sidebarOpen ? "fm-workspace-open" : "fm-workspace-closed"}`}>

        {/* ── sidebar ── */}
        {sidebarOpen && (
          <div className="fm-sidebar">

            {sidebarTab === "tables" && (
              <>
                {selectedTable && (
                  <Card>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                      <SectionTitle>Edit table</SectionTitle>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ fontSize: 11, fontWeight: 600, color: zoneBadge[selectedTable.zone].text, background: zoneBadge[selectedTable.zone].bg, borderRadius: 999, padding: "2px 8px" }}>
                          {selectedTable.zone}
                        </span>
                        <button
                          onClick={() => deleteTableLocal(selectedTable.id)}
                          style={{ width: 26, height: 26, borderRadius: "50%", border: "1.5px solid #fecdd3", background: "#fff1f2", cursor: "pointer", color: "#be123c", display: "flex", alignItems: "center", justifyContent: "center" }}
                          title="Delete table"
                        >
                          <Icons.Trash />
                        </button>
                      </div>
                    </div>
                    {renderTableForm(selectedTable)}
                  </Card>
                )}
                <Card>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: tablesListOpen ? 10 : 0 }}>
                    <SectionTitle>All tables <span style={{ color: "#94a3b8", fontWeight: 500 }}>({tables.length})</span></SectionTitle>
                    <Btn onClick={() => setTablesListOpen(prev => !prev)} style={{ padding: "4px 10px" }}>
                      {tablesListOpen ? <Icons.ChevronUp /> : <Icons.ChevronDown />}
                      {tablesListOpen ? "Hide" : "Show"}
                    </Btn>
                  </div>
                  {tablesListOpen && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 260, overflowY: "auto", paddingRight: 2 }}>
                      {tables.length === 0 && <div style={{ fontSize: 12, color: "#94a3b8", textAlign: "center", padding: "16px 0" }}>No tables yet</div>}
                      {tables.map(t => {
                        const zb  = zoneBadge[t.zone];
                        const sel = t.id === selectedTableId;
                        return (
                          <button key={t.id} onClick={() => setSelectedTableId(t.id)} style={{
                            display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: 12,
                            border: `1.5px solid ${sel ? "#0f172a" : "#e2e8f0"}`,
                            background: sel ? "#f8fafc" : "#fff", cursor: "pointer", textAlign: "left", transition: "all 0.12s",
                          }}>
                            <div style={{ width: 32, height: 32, borderRadius: t.shape === "Round" ? "50%" : t.shape === "Square" ? 8 : 6, background: sel ? "#0f172a" : "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                              <span style={{ fontSize: 9, fontWeight: 700, color: sel ? "#fff" : "#64748b" }}>{t.seats}s</span>
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: 13, fontWeight: 600, color: "#0f172a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.name}</div>
                              <div style={{ fontSize: 11, color: "#64748b" }}>{t.shape} · {t.seats} seats</div>
                            </div>
                            <span style={{ fontSize: 10, fontWeight: 700, color: zb.text, background: zb.bg, borderRadius: 999, padding: "2px 7px", flexShrink: 0 }}>{t.zone}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </Card>
              </>
            )}

            {sidebarTab === "areas" && (
              <>
                <Card>
                  <SectionTitle>Add new area</SectionTitle>
                  {renderAreaForm(areaDraft, false)}
                </Card>
                {selectedArea && (
                  <Card>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                      <SectionTitle>Edit area</SectionTitle>
                      <button
                        onClick={() => deleteAreaLocal(selectedArea.id)}
                        style={{ width: 26, height: 26, borderRadius: "50%", border: "1.5px solid #fecdd3", background: "#fff1f2", cursor: "pointer", color: "#be123c", display: "flex", alignItems: "center", justifyContent: "center" }}
                        title="Delete area"
                      >
                        <Icons.Trash />
                      </button>
                    </div>
                    {renderAreaForm(selectedArea, true)}
                  </Card>
                )}
                <Card>
                  <SectionTitle>All areas <span style={{ color: "#94a3b8", fontWeight: 500 }}>({areas.length})</span></SectionTitle>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 200, overflowY: "auto", paddingRight: 2 }}>
                    {areas.length === 0 && <div style={{ fontSize: 12, color: "#94a3b8", textAlign: "center", padding: "16px 0" }}>No areas yet</div>}
                    {areas.map(a => {
                      const tone = areaTone[a.type];
                      const sel  = a.id === selectedAreaId;
                      return (
                        <button key={a.id} onClick={() => setSelectedAreaId(a.id)} style={{
                          display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: 12,
                          border: `1.5px solid ${sel ? "#0f172a" : tone.border}`,
                          background: sel ? "#f8fafc" : tone.bg, cursor: "pointer", textAlign: "left", transition: "all 0.12s",
                        }}>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 13, fontWeight: 600, color: tone.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{a.label}</div>
                            <div style={{ fontSize: 11, color: "#64748b" }}>{a.type} · Layer {a.zIndex}</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </Card>
              </>
            )}
          </div>
        )}

        {/* ── canvas ── */}
        <Card className="fm-canvas-card" style={{ padding: 16 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>Visual Floor Plan</div>
              <div style={{ fontSize: 12, color: "#64748b", marginTop: 1 }}>Drag tables and areas to arrange the layout for {activeFloor?.label}</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#94a3b8", fontSize: 12, fontWeight: 600, flexWrap: "wrap" }}>
              {!sidebarOpen && (
                <Btn variant="indigo" onClick={() => setSidebarOpen(true)}>
                  <Icons.ChevronRight /> Show panel
                </Btn>
              )}
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <Icons.Move /> Drag to move
              </span>
            </div>
          </div>

          <div style={{ width: "100%", height: CANVAS_HEIGHT, borderRadius: 16, border: "1.5px dashed #e2e8f0", overflowX: "auto", overflowY: "hidden", background: "#fafafa" }}>
            <div
              className="fm-canvas-inner"
              ref={canvasRef}
              style={{
                backgroundImage: "linear-gradient(rgba(148,163,184,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.1) 1px, transparent 1px)",
                backgroundSize: "24px 24px",
              }}
            >
              {areas.slice().sort((a, b) => a.zIndex - b.zIndex).map(area => {
                const tone = areaTone[area.type];
                const sel  = area.id === selectedAreaId;
                return (
                  <button
                    key={area.id}
                    onPointerDown={e => startDrag(e, "area", area.id)}
                    style={{
                      position: "absolute", left: area.x, top: area.y, width: area.width, height: area.height,
                      zIndex: area.zIndex, borderRadius: area.cornerRadius,
                      border: `1.5px dashed ${tone.border}`, background: tone.bg,
                      cursor: "grab", touchAction: "none",
                      outline: sel ? "2.5px solid #94a3b8" : "none", outlineOffset: 2,
                      transition: dragging?.id === area.id ? "none" : "outline 0.1s",
                    }}
                  >
                    <span style={{ position: "absolute", left: 8, top: 8, background: "rgba(255,255,255,0.9)", borderRadius: 999, padding: "2px 9px", fontSize: 10, fontWeight: 700, color: tone.text, backdropFilter: "blur(4px)" }}>
                      {area.label}
                    </span>
                  </button>
                );
              })}

              {tables.map(table => {
                const sel = table.id === selectedTableId;
                const zb  = zoneBadge[table.zone];
                return (
                  <button
                    key={table.id}
                    onPointerDown={e => startDrag(e, "table", table.id)}
                    style={{
                      position: "absolute", left: table.x, top: table.y,
                      width: table.width, height: table.height,
                      borderRadius: shapeRadius[table.shape],
                      transform: `rotate(${table.rotation}deg)`,
                      zIndex: sel ? 120 : 100,
                      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                      border: `${sel ? 2 : 1.5}px solid ${sel ? "#0f172a" : "#e2e8f0"}`,
                      background: sel ? "#0f172a" : "#fff",
                      color: sel ? "#fff" : "#1e293b",
                      cursor: "grab", touchAction: "none",
                      boxShadow: sel ? "0 4px 20px rgba(15,23,42,0.18)" : "0 1px 4px rgba(0,0,0,0.06)",
                      transition: dragging?.id === table.id ? "none" : "box-shadow 0.15s, border-color 0.15s",
                      fontFamily: "inherit",
                    }}
                  >
                    <span style={{
                      position: "absolute", top: -22, left: "50%", transform: "translateX(-50%)",
                      background: sel ? "#0f172a" : zb.bg, color: sel ? "#fff" : zb.text,
                      borderRadius: 999, padding: "1px 7px", fontSize: 9, fontWeight: 700,
                      whiteSpace: "nowrap", pointerEvents: "none",
                      opacity: sel ? 1 : 0, transition: "opacity 0.15s",
                    }}>
                      {table.zone}
                    </span>
                    <span style={{ fontSize: 11, fontWeight: 700, lineHeight: 1.2 }}>{table.name}</span>
                    <span style={{ fontSize: 10, opacity: 0.55, marginTop: 1 }}>{table.seats}s</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ marginTop: 12, display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
            {zones.map(z => {
              const zb = zoneBadge[z];
              return (
                <span key={z} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: zb.text, background: zb.bg, borderRadius: 999, padding: "3px 9px", fontWeight: 600 }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: zb.dot, display: "inline-block" }} />
                  {z}
                </span>
              );
            })}
            <span style={{ marginLeft: "auto", fontSize: 11, color: "#94a3b8" }}>Use spacing rules to maintain service distance guidelines.</span>
          </div>
        </Card>
      </div>

      {/* ── delete floor modal ── */}
      {deleteModal && activeFloor && (
        <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(15,23,42,0.5)", padding: 16, backdropFilter: "blur(2px)" }}>
          <div style={{ background: "#fff", borderRadius: 20, border: "1.5px solid #e2e8f0", padding: 24, maxWidth: 400, width: "100%", boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", marginBottom: 8 }}>Delete floor?</div>
            <p style={{ fontSize: 13, color: "#64748b", margin: "0 0 20px" }}>
              Permanently delete <strong>"{activeFloor.label}"</strong> and all its table and area layout data. This cannot be undone.
            </p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <Btn onClick={() => setDeleteModal(false)}>Cancel</Btn>
              <Btn variant="danger" onClick={deleteFloor}><Icons.Trash /> Delete floor</Btn>
            </div>
          </div>
        </div>
      )}

      {/* ── quick add tables modal ── */}
      {quickAddModal && (
        <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(15,23,42,0.5)", padding: 16, backdropFilter: "blur(2px)" }}>
          <div style={{ background: "#fff", borderRadius: 20, border: "1.5px solid #e2e8f0", padding: 24, maxWidth: 380, width: "100%", boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", marginBottom: 4 }}>Quick Add Tables</div>
            <p style={{ fontSize: 12, color: "#64748b", margin: "0 0 16px" }}>Automatically generate and position tables on the floor.</p>
            
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
              <div>
                <Label>Number of tables</Label>
                <Input 
                  type="number" 
                  min={1} 
                  max={50} 
                  value={quickAddCount}
                  onChange={e => setQuickAddCount(Math.max(1, Math.min(50, +e.target.value)))}
                  style={{ width: "100%" }}
                />
              </div>
              <div>
                <Label>Zone</Label>
                <Select 
                  value={quickAddZone}
                  onChange={e => setQuickAddZone(e.target.value as Zone)}
                  style={{ width: "100%" }}
                >
                  {zones.map(z => <option key={z}>{z}</option>)}
                </Select>
              </div>
              <div>
                <Label>Floor</Label>
                <Select 
                  value={quickAddFloorId}
                  onChange={e => setQuickAddFloorId(e.target.value)}
                  style={{ width: "100%" }}
                >
                  {floors.map(f => <option key={f.id} value={f.id}>{f.label}</option>)}
                </Select>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <Btn onClick={() => setQuickAddModal(false)}>Cancel</Btn>
              <Btn variant="solid" onClick={quickAddTables} style={{ background: "#3b82f6", borderColor: "#3b82f6" }}>
                <Icons.Zap /> Generate
              </Btn>
            </div>
          </div>
        </div>
      )}

      {/* ── manage tables modal ── */}
      {manageTablesModal && (
        <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(15,23,42,0.5)", padding: 16, backdropFilter: "blur(2px)" }}>
          <div style={{ background: "#fff", borderRadius: 20, border: "1.5px solid #e2e8f0", padding: 0, maxWidth: 600, width: "100%", boxShadow: "0 20px 60px rgba(0,0,0,0.15)", maxHeight: "80vh", display: "flex", flexDirection: "column" }}>
            
            {/* Modal header */}
            <div style={{ padding: "20px 24px", borderBottom: "1.5px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#0f172a" }}>Manage Tables</div>
                <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>
                  {floors.find(f => f.id === manageTablesFloorId)?.label} · {floorLayouts[manageTablesFloorId]?.tables.length || 0} tables
                </div>
              </div>
              <button onClick={() => setManageTablesModal(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", fontSize: 20 }}>✕</button>
            </div>

            {/* Floor tabs */}
            <div style={{ padding: "16px 24px", borderBottom: "1.5px solid #e2e8f0", display: "flex", alignItems: "center", gap: 6, overflowX: "auto" }}>
              {floors.map(f => (
                <button
                  key={f.id}
                  onClick={() => setManageTablesFloorId(f.id)}
                  style={{
                    border: "1.5px solid",
                    borderRadius: 999,
                    padding: "6px 14px",
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.15s",
                    borderColor: f.id === manageTablesFloorId ? "#0f172a" : "#e2e8f0",
                    background: f.id === manageTablesFloorId ? "#0f172a" : "#fff",
                    color: f.id === manageTablesFloorId ? "#fff" : "#64748b",
                    whiteSpace: "nowrap",
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Tables list */}
            <div style={{ flex: 1, overflowY: "auto", padding: "16px 24px", display: "flex", flexDirection: "column", gap: 8 }}>
              {!floorLayouts[manageTablesFloorId] || floorLayouts[manageTablesFloorId]?.tables.length === 0 ? (
                <div style={{ fontSize: 13, color: "#94a3b8", textAlign: "center", padding: "32px 16px" }}>No tables on this floor</div>
              ) : (
                floorLayouts[manageTablesFloorId].tables.map(t => {
                  return (
                    <div
                      key={t.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        padding: "12px 14px",
                        borderRadius: 12,
                        border: "1.5px solid #e2e8f0",
                        background: "#f8fafc",
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>{t.name}</div>
                        <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>
                          {t.shape} · {t.seats} seats · {t.zone}
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setFloorLayouts(prev => ({
                            ...prev,
                            [manageTablesFloorId]: {
                              ...prev[manageTablesFloorId],
                              tables: prev[manageTablesFloorId].tables.filter(table => table.id !== t.id)
                            }
                          }));
                          toast.success(`${t.name} deleted`);
                        }}
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: "50%",
                          border: "1.5px solid #fecdd3",
                          background: "#fff1f2",
                          cursor: "pointer",
                          color: "#be123c",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                        title="Delete table"
                      >
                        <Icons.Trash />
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            {/* Modal footer */}
            <div style={{ padding: "16px 24px", borderTop: "1.5px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontSize: 12, color: "#94a3b8" }}>💡 Click "Save Layout" in the main toolbar to persist changes</div>
              <Btn onClick={() => setManageTablesModal(false)}>Close</Btn>
            </div>
          </div>
        </div>
      )}
      </>
      )}
    </div>
  );
}
