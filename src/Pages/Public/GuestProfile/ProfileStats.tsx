import { FiCalendar, FiMail, FiMapPin, FiPhone } from "react-icons/fi";
import type { GuestProfileData } from "./types";

type ProfileStatsProps = {
  profile: GuestProfileData["profile"];
};

const ProfileStats = ({ profile }: ProfileStatsProps) => {
  return (
    <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3">
        <FiMail className="text-slate-400 flex-shrink-0" />
        <div className="text-sm text-slate-600 truncate">{profile.email}</div>
      </div>
      <div className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3">
        <FiPhone className="text-slate-400 flex-shrink-0" />
        <div className="text-sm text-slate-600">{profile.phone}</div>
      </div>
      <div className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3">
        <FiMapPin className="text-slate-400 flex-shrink-0" />
        <div className="text-sm text-slate-600">{profile.location}</div>
      </div>
      <div className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3">
        <FiCalendar className="text-slate-400 flex-shrink-0" />
        <div className="text-sm text-slate-600">
          {profile.totalBookings} total bookings
        </div>
      </div>
    </div>
  );
};

export default ProfileStats;