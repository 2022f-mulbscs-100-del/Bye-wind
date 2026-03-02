import {
  FiActivity,
  FiBarChart2,
  FiCheckCircle,
  FiGift,
  FiHeart,
  FiMail,
  FiMessageSquare,
  FiRefreshCw,
  FiStar,
  FiTag,
  FiTrendingDown,
  FiTrendingUp,
  FiUsers,
} from "react-icons/fi";

const guests = [
  {
    id: "g1",
    name: "Maya Carter",
    visits: 14,
    tier: "Gold",
    location: "San Francisco, CA",
    contact: "maya.carter@email.com",
  },
  {
    id: "g2",
    name: "Liam Nguyen",
    visits: 9,
    tier: "Silver",
    location: "Oakland, CA",
    contact: "liam.nguyen@email.com",
  },
  {
    id: "g3",
    name: "Ava Diaz",
    visits: 22,
    tier: "Platinum",
    location: "Berkeley, CA",
    contact: "ava.diaz@email.com",
  },
];

const GuestCRM = () => {
  return (
    <div className="space-y-6">
      <div>
        <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          Guest CRM & Loyalty
        </div>
        <div className="mt-1 text-2xl font-semibold text-slate-900">
          Guest CRM & Loyalty
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        {["Unified Profiles", "AI Segments", "LTV", "Churn Risk"].map(
          (label, idx) => (
            <div
              key={label}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="text-xs uppercase text-slate-400">{label}</div>
              <div className="mt-3 text-2xl font-semibold text-slate-900">
                {idx === 0 ? "12,480" : idx === 1 ? "18" : idx === 2 ? "$420" : "6%"}
              </div>
              <div className="mt-2 text-xs text-slate-500">Updated in real time</div>
            </div>
          )
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[2fr_1fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-slate-900">Guest list</div>
              <p className="mt-1 text-sm text-slate-500">
                Unified profile from reservations, walk-ins, POS, and marketing.
              </p>
            </div>
            <FiUsers className="text-slate-400" />
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase text-slate-400">
                <tr>
                  <th className="pb-3 font-medium">Guest</th>
                  <th className="pb-3 font-medium">Visits</th>
                  <th className="pb-3 font-medium">Tier</th>
                  <th className="pb-3 font-medium">Location</th>
                  <th className="pb-3 font-medium">Contact</th>
                </tr>
              </thead>
              <tbody className="text-slate-600">
                {guests.map((guest) => (
                  <tr key={guest.id} className="border-t border-slate-100">
                    <td className="py-3 font-medium text-slate-900">{guest.name}</td>
                    <td className="py-3">{guest.visits}</td>
                    <td className="py-3">
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                        {guest.tier}
                      </span>
                    </td>
                    <td className="py-3">{guest.location}</td>
                    <td className="py-3">{guest.contact}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <FiTag /> AI Tags & Segments
            </div>
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              {[
                "VIP",
                "High spenders",
                "Frequent diners",
                "At‑risk",
                "Inactive",
              ].map((tag) => (
                <span key={tag} className="rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-600">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <FiMessageSquare /> Staff Notes
            </div>
            <div className="mt-3 space-y-2 text-sm text-slate-600">
              <div className="rounded-xl bg-slate-50 px-4 py-2">"Prefers window seating" · Host</div>
              <div className="rounded-xl bg-slate-50 px-4 py-2">"Allergic to peanuts" · Manager</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.2fr_1fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="text-sm font-semibold text-slate-900">Visit & Engagement History</div>
          <div className="mt-3 space-y-2 text-sm text-slate-600">
            {[
              "Reservation · 2 guests · $128 · Web",
              "Walk‑in · 4 guests · $210 · POS",
              "Cancellation · 2 guests · App",
            ].map((item) => (
              <div key={item} className="rounded-xl bg-slate-50 px-4 py-2">
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
          <div className="text-sm font-semibold text-slate-900">Preferences</div>
          {[
            "Gluten‑free",
            "Outdoor seating",
            "Anniversary celebrations",
          ].map((pref) => (
            <div key={pref} className="rounded-xl bg-slate-50 px-4 py-2 text-sm text-slate-600">
              {pref}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[2fr_1fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="text-sm font-semibold text-slate-900">Loyalty & Rewards</div>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3 text-sm text-slate-600">
            <div className="rounded-xl bg-slate-50 px-4 py-3">
              <div className="text-xs text-slate-400">Points Engine</div>
              <div className="mt-1 font-semibold text-slate-700">Spend‑based</div>
            </div>
            <div className="rounded-xl bg-slate-50 px-4 py-3">
              <div className="text-xs text-slate-400">Tier</div>
              <div className="mt-1 font-semibold text-slate-700">Gold</div>
            </div>
            <div className="rounded-xl bg-slate-50 px-4 py-3">
              <div className="text-xs text-slate-400">Rewards</div>
              <div className="mt-1 font-semibold text-slate-700">Free dessert</div>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button className="rounded-full bg-slate-900 px-3 py-2 text-xs font-semibold text-white">
              Configure points
            </button>
            <button className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600">
              Manage tiers
            </button>
            <button className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600">
              Rewards catalog
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <FiTrendingUp /> LTV
            </div>
            <div className="mt-2 text-2xl font-semibold text-slate-900">$1,280</div>
            <div className="mt-2 text-xs text-emerald-600">+12% vs last quarter</div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <FiTrendingDown /> Churn Prediction
            </div>
            <div className="mt-2 text-2xl font-semibold text-slate-900">6%</div>
            <div className="mt-2 text-xs text-amber-600">At‑risk segment flagged</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.2fr_1fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <FiHeart /> Personalized triggers
          </div>
          <div className="mt-3 space-y-2 text-sm text-slate-600">
            <div className="rounded-xl bg-slate-50 px-4 py-2">
              Anniversary reminder · Send offer
            </div>
            <div className="rounded-xl bg-slate-50 px-4 py-2">
              VIP arrival · Alert floor manager
            </div>
            <div className="rounded-xl bg-slate-50 px-4 py-2">
              Churn risk · Win‑back campaign
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <FiRefreshCw /> CRM → Marketing Sync
          </div>
          <div className="mt-3 text-sm text-slate-600">
            Syncs AI segments to campaigns in real time.
          </div>
          <button className="mt-4 rounded-full bg-slate-900 px-3 py-2 text-xs font-semibold text-white">
            Manage sync
          </button>
        </div>
      </div>
    </div>
  );
};

export default GuestCRM;
