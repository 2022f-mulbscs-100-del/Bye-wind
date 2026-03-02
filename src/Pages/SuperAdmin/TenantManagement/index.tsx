import { FiAlertTriangle, FiCheckCircle, FiPlus, FiSearch } from "react-icons/fi";

const tenants = [
  { name: "ByeWind Group", outlets: 12, status: "Active", region: "US", plan: "Enterprise" },
  { name: "Harbor Dining", outlets: 4, status: "Suspended", region: "EU", plan: "Pro" },
  { name: "Uptown Kitchens", outlets: 7, status: "Active", region: "US", plan: "Scale" },
];

const TenantManagement = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Tenant / Restaurant Management
          </div>
          <div className="mt-1 text-2xl font-semibold text-slate-900">
            Manage tenants & outlets
          </div>
        </div>
        <button className="flex items-center gap-2 rounded-full bg-slate-900 px-3 py-2 text-xs font-semibold text-white">
          <FiPlus /> Create tenant
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {["Active", "Suspended", "Pending"].map((item, index) => (
          <div key={item} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="text-xs uppercase text-slate-400">{item}</div>
            <div className="mt-3 text-2xl font-semibold text-slate-900">
              {index === 0 ? "118" : index === 1 ? "6" : "4"}
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm font-semibold text-slate-900">Tenants</div>
          <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-500">
            <FiSearch />
            <input className="bg-transparent text-xs text-slate-600 focus:outline-none" placeholder="Search tenants" />
          </div>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase text-slate-400">
              <tr>
                <th className="pb-3 font-medium">Tenant</th>
                <th className="pb-3 font-medium">Plan</th>
                <th className="pb-3 font-medium">Outlets</th>
                <th className="pb-3 font-medium">Region</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="text-slate-600">
              {tenants.map((tenant) => (
                <tr key={tenant.name} className="border-t border-slate-100">
                  <td className="py-3 font-medium text-slate-900">{tenant.name}</td>
                  <td className="py-3">{tenant.plan}</td>
                  <td className="py-3">{tenant.outlets}</td>
                  <td className="py-3">{tenant.region}</td>
                  <td className="py-3">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        tenant.status === "Active"
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-amber-50 text-amber-600"
                      }`}
                    >
                      {tenant.status}
                    </span>
                  </td>
                  <td className="py-3">
                    <button className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600">
                      Manage
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="text-sm font-semibold text-slate-900">Alerts</div>
          <div className="mt-3 flex items-center gap-2 text-sm text-slate-500">
            <FiAlertTriangle className="text-amber-500" /> 2 tenants require action.
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="text-sm font-semibold text-slate-900">Compliance</div>
          <div className="mt-3 flex items-center gap-2 text-sm text-slate-500">
            <FiCheckCircle className="text-emerald-500" /> All active tenants compliant.
          </div>
        </div>
      </div>
    </div>
  );
};

export default TenantManagement;
