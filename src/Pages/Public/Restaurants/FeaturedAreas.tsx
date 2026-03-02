import type { FeaturedArea } from "./types";

type FeaturedAreasProps = {
  areas: FeaturedArea[];
  activeFilter: string;
  onSelectArea: (area: string) => void;
  getAreaCount: (area: string) => number;
  loading: boolean;
  Placeholder: ({ width, height }: { width?: string | number; height?: number }) => JSX.Element;
  Loader: ({ size, color }: { size?: number; color?: string }) => JSX.Element;
};

const FeaturedAreas = ({
  areas,
  activeFilter,
  onSelectArea,
  getAreaCount,
  loading,
  Placeholder,
  Loader,
}: FeaturedAreasProps) => {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-sm font-semibold text-slate-900">Featured areas</div>
          <p className="mt-1 text-sm text-slate-500">
            Popular neighborhoods with high availability.
          </p>
        </div>
        {loading ? (
          <div className="flex items-center gap-2 text-slate-500">
            <Loader size={20} color="#0f172a" />
            <span className="text-xs">Loading areas</span>
          </div>
        ) : null}
      </div>
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {loading ? (
          <>
            <div className="rounded-2xl bg-slate-50 px-4 py-3">
              <Placeholder width="60%" height={14} />
              <div className="mt-2">
                <Placeholder width="40%" height={12} />
              </div>
            </div>
            <div className="rounded-2xl bg-slate-50 px-4 py-3">
              <Placeholder width="60%" height={14} />
              <div className="mt-2">
                <Placeholder width="40%" height={12} />
              </div>
            </div>
            <div className="rounded-2xl bg-slate-50 px-4 py-3">
              <Placeholder width="60%" height={14} />
              <div className="mt-2">
                <Placeholder width="40%" height={12} />
              </div>
            </div>
          </>
        ) : (
          areas.map((area) => (
            <button
              type="button"
              key={area.name}
              onClick={() => onSelectArea(area.name)}
              className={`rounded-2xl px-4 py-3 text-left cursor-pointer ${
                activeFilter === area.name
                  ? "border border-black"
                  : "border border-transparent bg-slate-50 text-slate-700 hover:bg-slate-100"
              }`}
            >
              <div className="text-sm font-semibold text-slate-700">{area.name}</div>
              <div className="mt-1 text-xs text-slate-500">
                {getAreaCount(area.name)} restaurants
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
};

export default FeaturedAreas;
