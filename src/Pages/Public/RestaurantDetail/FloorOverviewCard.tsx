type FloorHighlight = { label: string; value: string };
type FloorTable = { id: string; x: number; y: number; w: number; h: number; label: string };

type FloorOverviewCardProps = {
  highlights: FloorHighlight[];
  tables: FloorTable[];
};

const FloorOverviewCard = ({ highlights, tables }: FloorOverviewCardProps) => {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="text-sm font-semibold text-slate-900">Floor overview</div>
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {highlights.map((item) => (
          <div key={item.label} className="rounded-2xl bg-slate-50 px-4 py-3">
            <div className="text-xs text-slate-400">{item.label}</div>
            <div className="mt-1 text-sm font-semibold text-slate-700">
              {item.value}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <div className="relative h-56 w-full overflow-hidden rounded-xl border border-dashed border-slate-200 bg-[linear-gradient(90deg,rgba(148,163,184,0.12)_1px,transparent_1px),linear-gradient(180deg,rgba(148,163,184,0.12)_1px,transparent_1px)] bg-[size:22px_22px]">
          {tables.map((table) => (
            <div
              key={table.id}
              className="absolute flex items-center justify-center rounded-xl border border-slate-200 bg-white text-[11px] font-semibold text-slate-600 shadow-sm"
              style={{
                left: table.x,
                top: table.y,
                width: table.w,
                height: table.h,
              }}
            >
              {table.label}
            </div>
          ))}
        </div>
        <div className="mt-3 text-xs text-slate-500">
          Live floor plan preview (read-only)
        </div>
      </div>
    </div>
  );
};

export default FloorOverviewCard;
