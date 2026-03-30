import { useGoLiveContext } from "@/context/GoLiveContext";
import { useBranchContext } from "@/context/BranchContext";
import { Link, useLocation } from "react-router-dom";
import { FiInfo, FiZap } from "react-icons/fi";

export default function StatusBanner() {
  const { } = useGoLiveContext();
  const { branches, selectedBranchId } = useBranchContext();
  const location = useLocation();

  const isAllBranches = selectedBranchId === null;
  const selectedBranch = branches.find((b) => b.id === selectedBranchId);
  const isBranchLive = selectedBranch?.isLive || false;
  
  const isGlobalPage = ["/dashboard/staff", "/dashboard/payment", "/dashboard/settings"].includes(location.pathname);

  // 1. GLOBAL BANNER (All Branches selected on a global page)
  if (isAllBranches && branches.length > 0 && isGlobalPage) {
    return (
      <div className="bg-indigo-50 border-b border-indigo-100 px-4 py-2 flex items-center gap-3 shrink-0">
        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
          <FiInfo className="text-xs" />
        </div>
        <div className="flex-1 text-indigo-900 text-xs sm:text-sm font-medium">
          Global Configuration: <span className="font-normal opacity-80">These settings apply to your entire restaurant and all branches.</span>
        </div>
      </div>
    );
  }

  // 2. SETUP BANNER (Specific branch selected but NOT live)
  if (!isAllBranches && !isBranchLive) {
    return (
      <div className="bg-amber-50 border-b border-amber-100 px-4 py-2 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2 text-amber-800 text-xs sm:text-sm font-medium text-wrap text-left">
          <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-pulse flex-shrink-0" />
          <span className="hidden sm:inline">Setup Mode: This branch is not yet active for public bookings.</span>
          <span className="sm:hidden">Setup Mode: Not yet active.</span>
        </div>
        <Link 
          to="/dashboard/onboarding" 
          className="flex items-center gap-1 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-amber-900 hover:text-amber-700 bg-amber-200/50 px-3 py-1 rounded-lg transition-colors border border-amber-200"
        >
          <FiZap /> Finish Setup
        </Link>
      </div>
    );
  }

  return null;
}
