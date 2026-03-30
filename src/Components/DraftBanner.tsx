import { useGoLiveContext } from "@/context/GoLiveContext";
import { Link } from "react-router-dom";

export default function DraftBanner() {
  const { goLiveStatus } = useGoLiveContext();

  if (!goLiveStatus || goLiveStatus.isLive) return null;

  return (
    <div className="bg-amber-50 border-b border-amber-100 px-4 py-2 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-2 text-amber-800 text-xs sm:text-sm font-medium">
        <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
        <span className="hidden sm:inline">Setup Mode: Your restaurant is not yet active for public bookings.</span>
        <span className="sm:hidden">Setup Mode: Not yet active.</span>
      </div>
      <Link
        to="/dashboard/onboarding"
        className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-amber-900 hover:text-amber-700 bg-amber-200/50 px-3 py-1 rounded-lg transition-colors border border-amber-200"
      >
        Finish Setup & Go Live
      </Link>
    </div>
  );
}
