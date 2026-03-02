import { FiPlus, FiSearch, FiUsers } from "react-icons/fi";

const users = [
  { name: "Ava Collins", role: "Tenant Admin", tenant: "ByeWind", status: "Active" },
  { name: "Liam Patel", role: "Finance Admin", tenant: "Harbor", status: "Suspended" },
  { name: "Maya Brooks", role: "Ops Lead", tenant: "Uptown", status: "Active" },
];

const UserRoleManagement = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            User & Role Management
          </div>
          <div className="mt-1 text-2xl font-semibold text-slate-900">
            Admin and staff users
          </div>
        </div>
        <button className="flex items-center gap-2 rounded-full bg-slate-900 px-3 py-2 text-xs font-semibold text-white">
          <FiPlus /> Invite user
        </button>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <FiUsers /> Users
          </div>
          <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-500">
            <FiSearch />
            <input className="bg-transparent text-xs text-slate-600 focus:outline-none" placeholder="Search users" />
          </div>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase text-slate-400">
              <tr>
                <th className="pb-3 font-medium">Name</th>
                <th className="pb-3 font-medium">Role</th>
                <th className="pb-3 font-medium">Tenant</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="text-slate-600">
              {users.map((user) => (
                <tr key={user.name} className="border-t border-slate-100">
                  <td className="py-3 font-medium text-slate-900">{user.name}</td>
                  <td className="py-3">{user.role}</td>
                  <td className="py-3">{user.tenant}</td>
                  <td className="py-3">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      user.status === "Active" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="py-3">
                    <button className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600">
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserRoleManagement;
