import Placeholder from "@/Components/placeholder";
import { FiSearch } from "react-icons/fi";

type HeaderSearchProps = {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  loading: boolean;
};

const HeaderSearch = ({ searchTerm, onSearchChange, loading }: HeaderSearchProps) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div>
        <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          Restaurants
        </div>
        <div className="mt-1 text-3xl font-semibold text-slate-900">Find a table</div>
      </div>
      <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm text-slate-500">
        <FiSearch />
        {loading ? (
          <div className="w-64">
            <Placeholder height={14} />
          </div>
        ) : (
          <input
            type="text"
            placeholder="Search by name or cuisine"
            className="w-64 bg-transparent text-sm text-slate-700 focus:outline-none"
            value={searchTerm}
            onChange={(event) => onSearchChange(event.target.value)}
          />
        )}
      </div>
    </div>
  );
};

export default HeaderSearch;
