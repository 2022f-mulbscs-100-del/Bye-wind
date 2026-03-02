import { FiCheckCircle, FiLock, FiShield } from "react-icons/fi";

const roles = [
  { name: "Super Admin", modules: 18, users: 4 },
  { name: "Tenant Admin", modules: 12, users: 38 },
  { name: "Finance", modules: 6, users: 12 },
];

const RolesPermissions = () => {
  return (
    <div className="space-y-6">
      <div>
        <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          Role & Permission Configuration
        </div>
        <div className="mt-1 text-2xl font-semibold text-slate-900">RBAC policies</div>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {roles.map((role) => (
          <div key={role.name} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <FiLock /> {role.name}
            </div>
            <div className="mt-2 text-xs text-slate-500">{role.modules} modules enabled</div>
            <div className="mt-2 text-xs text-slate-500">{role.users} users</div>
          </div>
        ))}
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
          <FiShield /> Permission sets
        </div>
        <div className="mt-4 space-y-2 text-sm text-slate-600">
          {[
            "Manage tenants",
            "Configure billing",
            "View audit logs",
            "Access integrations",
          ].map((item) => (
            <div key={item} className="flex items-center gap-2 rounded-xl bg-slate-50 px-4 py-3">
              <FiCheckCircle className="text-emerald-500" /> {item}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RolesPermissions;
