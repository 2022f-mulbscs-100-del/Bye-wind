import { FiCalendar, FiEdit2, FiMail, FiMapPin, FiPhone, FiShield, FiUser } from "react-icons/fi";

const Profile = () => {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-500">
            <FiUser className="text-xl" />
          </div>
          <div>
            <div className="text-2xl font-semibold text-slate-900">Ava Collins</div>
            <div className="text-sm text-slate-500">Operations Admin</div>
            <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600">
              <FiShield /> Admin Verified
            </div>
          </div>
          <div className="ml-auto flex flex-wrap gap-2">
            <button className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50">
              Edit Profile
            </button>
            <button className="rounded-full bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800">
              Settings
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[2fr_1fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold text-slate-900">Profile Details</div>
            <FiEdit2 className="text-slate-400" />
          </div>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {[
              { label: "Full name", value: "Ava Collins" },
              { label: "Role", value: "Operations Admin" },
              { label: "Email", value: "ava.collins@byewind.com" },
              { label: "Phone", value: "+1 (415) 555-2033" },
              { label: "Location", value: "San Francisco, CA" },
              { label: "Timezone", value: "America/Los_Angeles" },
            ].map((item) => (
              <div key={item.label} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                <div className="text-xs font-semibold uppercase text-slate-400">
                  {item.label}
                </div>
                <div className="mt-1 text-sm font-semibold text-slate-700">
                  {item.value}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                <FiMail />
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-900">Primary Contact</div>
                <p className="text-xs text-slate-500">Prefered channel</p>
              </div>
            </div>
            <div className="mt-4 space-y-2 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <FiMail className="text-slate-400" /> ava.collins@byewind.com
              </div>
              <div className="flex items-center gap-2">
                <FiPhone className="text-slate-400" /> +1 (415) 555-2033
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                <FiCalendar />
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-900">Recent Activity</div>
                <p className="text-xs text-slate-500">Last 7 days</p>
              </div>
            </div>
            <div className="mt-4 space-y-2 text-sm text-slate-600">
              {["Updated booking policies", "Approved 2 branches", "Added new staff member"].map(
                (item) => (
                  <div key={item} className="flex items-center gap-2">
                    <FiMapPin className="text-slate-400" />
                    {item}
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
