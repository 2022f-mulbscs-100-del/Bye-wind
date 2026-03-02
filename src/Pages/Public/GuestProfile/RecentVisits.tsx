import { FiStar } from "react-icons/fi";
import type { GuestProfileData } from "./types";

type RecentVisitsProps = {
  visits: GuestProfileData["recentVisits"];
};

const RecentVisits = ({ visits }: RecentVisitsProps) => {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="text-lg font-semibold text-slate-900 mb-4">Recent Visits</div>
      <div className="space-y-3">
        {visits.map((visit, index) => (
          <div
            key={index}
            className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3"
          >
            <div>
              <div className="font-medium text-slate-900">{visit.restaurantName}</div>
              <div className="text-sm text-slate-500">{visit.visitDate}</div>
            </div>
            {visit.rating && (
              <div className="flex items-center gap-1 text-sm text-slate-600">
                <FiStar className="text-yellow-500 fill-yellow-500" />
                {visit.rating}.0
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentVisits;
