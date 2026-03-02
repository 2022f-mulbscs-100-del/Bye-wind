import Placeholder from "@/Components/placeholder";
import { FiFilter } from "react-icons/fi";

type FiltersBarProps = {
  filters: string[];
  activeFilter: string;
  onFilterChange: (filter: string) => void;
  loading: boolean;
};

const FiltersBar = ({
  filters,
  activeFilter,
  onFilterChange,
  loading,
}: FiltersBarProps) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <div className="flex flex-wrap items-center gap-2">
        {loading ? (
          <>
            <Placeholder width={70} height={26} />
            <Placeholder width={90} height={26} />
            <Placeholder width={80} height={26} />
            <Placeholder width={110} height={26} />
          </>
        ) : (
          <>
            <button
              key="All"
              onClick={() => onFilterChange("All")}
              className={`rounded-full border px-3 py-1 text-xs font-semibold cursor-pointer ${
                activeFilter === "All"
                  ? "border-slate-900 bg-slate-900 text-white"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              All
            </button>
            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => onFilterChange(filter)}
                className={`rounded-full border px-3 py-1 text-xs font-semibold cursor-pointer ${
                  activeFilter === filter
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                {filter}
              </button>
            ))}
          </>
        )}
      </div>
      <button className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600">
        <FiFilter /> Sort & Filters
      </button>
    </div>
  );
};

export default FiltersBar;
