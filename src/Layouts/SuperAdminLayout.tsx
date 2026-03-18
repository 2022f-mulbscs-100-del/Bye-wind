import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  FiActivity,
  FiArchive,
  FiChevronLeft,
  FiChevronRight,
  FiDatabase,
  FiKey,
  FiLock,
  FiMenu,
  FiSettings,
  FiShield,
  FiSliders,
  FiTerminal,
  FiUsers,
  FiX,
  FiLogOut,
} from "react-icons/fi";
import { useScreenSize } from "../customHooks/ScreenSize";
import { clearAuthSession } from "@/lib/auth";

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

const SIDEBAR_WIDTH = 280;
const COLLAPSED_WIDTH = 72;

const SuperAdminLayout = () => {
  const size = useScreenSize();
  const navigate = useNavigate();
  const isMobile = size <= 900;
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleSignOut = () => {
    clearAuthSession();
    navigate("/login");
  };

  const sidebarNav = (
    <div
      className="h-[calc(100vh-2rem)] overflow-hidden rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm transition-[width] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
      style={{ width: isCollapsed ? COLLAPSED_WIDTH : SIDEBAR_WIDTH }}
    >
      <div className="flex items-center justify-between px-4 py-5">
        <div
          className={`overflow-hidden transition-[opacity,transform,max-width] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
            isCollapsed
              ? "pointer-events-none max-w-0 -translate-x-2 opacity-0"
              : "max-w-[170px] translate-x-0 opacity-100"
          }`}
        >
          <div className="text-lg font-semibold text-slate-900 whitespace-nowrap">
            ByeWind
          </div>
          <div className="text-xs text-slate-400 whitespace-nowrap">Super Admin</div>
        </div>

        <button
          type="button"
          onClick={() => setIsCollapsed((prev) => !prev)}
          className="rounded-full border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? <FiChevronRight /> : <FiChevronLeft />}
        </button>
      </div>

      <div className="px-4">
        <div className="mb-3 h-5 overflow-hidden">
          <div
            className={`text-xs font-semibold uppercase tracking-wide text-slate-400 transition-opacity duration-300 ${
              isCollapsed ? "pointer-events-none opacity-0" : "opacity-100"
            }`}
          >
            Navigation
          </div>
        </div>
      </div>

      <nav className="flex flex-col space-y-1">
        {superAdminLinks.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            end={link.path === "/super-admin"}
            onClick={() => {
              if (isMobile) setIsSidebarOpen(false);
            }}
            className={({ isActive }) =>
              `grid items-center rounded-xl text-sm font-medium transition-[margin,padding] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
                isCollapsed ? "mx-4 px-2 py-2" : "mx-4 px-3 py-2"
              } ${
                isActive
                  ? "bg-slate-100 text-slate-900"
                  : "text-slate-600 hover:bg-slate-50"
              }`
            }
            style={{
              gridTemplateColumns: isCollapsed ? "20px 0fr" : "20px 1fr",
              columnGap: isCollapsed ? "0px" : "12px",
            }}
          >
            <span className="flex h-5 w-5 items-center justify-center">
              <link.icon className="text-base flex-shrink-0" />
            </span>
            <span
              className={`overflow-hidden whitespace-nowrap transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
                isCollapsed
                  ? "pointer-events-none -translate-x-1 opacity-0"
                  : "translate-x-0 opacity-100"
              }`}
            >
              {link.label}
            </span>
          </NavLink>
        ))}
      </nav>

      <div className="mt-4 border-t border-slate-100 px-4 pt-3">
        <button
          type="button"
          onClick={handleSignOut}
          className={`grid w-full items-center rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 ${
            isCollapsed ? "px-2 py-2" : "px-3 py-2"
          }`}
          style={{
            gridTemplateColumns: isCollapsed ? "20px 0fr" : "20px 1fr",
            columnGap: isCollapsed ? "0px" : "12px",
          }}
        >
          <span className="flex h-5 w-5 items-center justify-center">
            <FiLogOut className="text-base flex-shrink-0" />
          </span>
          <span
            className={`overflow-hidden whitespace-nowrap transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
              isCollapsed ? "pointer-events-none -translate-x-1 opacity-0" : "translate-x-0 opacity-100"
            }`}
          >
            Sign out
          </span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-slate-100">
      {!isMobile && (
        <aside className="z-[100] p-4">
          <div className="sticky top-4">{sidebarNav}</div>
        </aside>
      )}

      {isMobile && (
        <>
          <button
            type="button"
            aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
            onClick={() => setIsSidebarOpen((prev) => !prev)}
            className="fixed left-4 top-4 z-50 rounded-xl border border-slate-200 bg-white p-2 text-slate-700 shadow-sm"
          >
            {isSidebarOpen ? <FiX /> : <FiMenu />}
          </button>

          <button
            type="button"
            aria-label="Close Sidebar Overlay"
            onClick={() => setIsSidebarOpen(false)}
            className={`fixed inset-0 z-40 bg-slate-900/30 transition-opacity duration-300 ${
              isSidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
            }`}
          />

          <aside
            className={`fixed left-4 top-4 bottom-4 z-50 transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
              isSidebarOpen ? "translate-x-0" : "-translate-x-[120%]"
            }`}
          >
            {sidebarNav}
          </aside>
        </>
      )}

      <main className={`flex-1 min-w-0 ${isMobile ? "p-4 pt-16" : "p-6"}`}>
        <Outlet />
      </main>
    </div>
  );
};

export default SuperAdminLayout;
