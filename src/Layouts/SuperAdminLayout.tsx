import { Link, Outlet } from "react-router-dom";
import {
  FiActivity,
  FiArchive,
  FiDatabase,
  FiKey,
  FiLock,
  FiSettings,
  FiShield,
  FiSliders,
  FiTerminal,
  FiUsers,
} from "react-icons/fi";

const superAdminLinks = [
  { label: "Dashboard", path: "/super-admin", icon: FiActivity },
  { label: "Tenant Management", path: "/super-admin/tenants", icon: FiArchive },
  { label: "User & Role Management", path: "/super-admin/users", icon: FiUsers },
  { label: "Roles & Permissions", path: "/super-admin/roles", icon: FiSliders },
  { label: "Audit Logs", path: "/super-admin/audit-logs", icon: FiTerminal },
  { label: "Feature Management", path: "/super-admin/features", icon: FiSettings },
  { label: "API & Integrations", path: "/super-admin/api", icon: FiKey },
  { label: "Security & Compliance", path: "/super-admin/security", icon: FiShield },
  { label: "Backup & DR", path: "/super-admin/backup", icon: FiDatabase },
  { label: "Environment & Releases", path: "/super-admin/releases", icon: FiLock },
  { label: "System Health", path: "/super-admin/health", icon: FiActivity },
];

const SuperAdminLayout = () => {
  return (
    <div className="flex min-h-screen bg-slate-100">
      <aside className="w-72 p-4">
        <div className="h-full rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Super Admin
          </div>
          <div className="mt-1 text-lg font-semibold text-slate-900">Control Center</div>
          <nav className="mt-4 space-y-1">
            {superAdminLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                <link.icon className="text-slate-400" />
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </aside>
      <main className="flex-1 min-w-0 p-6">
        <Outlet />
      </main>
    </div>
  );
};

export default SuperAdminLayout;
