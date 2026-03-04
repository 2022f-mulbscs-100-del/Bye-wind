import { useMemo, useState } from "react";
import type { IconType } from "react-icons";
import {
  FiBarChart2,
  FiBookOpen,
  FiBriefcase,
  FiChevronLeft,
  FiChevronRight,
  FiCreditCard,
  FiGrid,
  FiHome,
  FiLayers,
  FiShoppingBag,
  FiSettings,
  FiUsers,
} from "react-icons/fi";
import { AdminBranchLevel, AdminMasterLevel } from "../../../public/SideBarData";
import { NavLink } from "react-router-dom";

const sidebarGroups = [
  { id: "master", label: "All Branches", items: AdminMasterLevel },
  { id: "branch", label: "Branch A", items: AdminBranchLevel },
];

const iconMap: Record<string, IconType> = {
  Dashboard: FiHome,
  "Branches Managment": FiGrid,
  "Staff Managment": FiUsers,
  Reservation: FiBookOpen,
  Orders: FiShoppingBag,
  Payment: FiCreditCard,
  "Guest CRM": FiBriefcase,
  Marketing: FiBarChart2,
  Analytics: FiBarChart2,
  Settings: FiSettings,
  "Floor Managment": FiLayers,
};

const SIDEBAR_WIDTH = 260;
const COLLAPSED_WIDTH = 72;

const SideBar = () => {
  const [groupId, setGroupId] = useState("master");
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const activeGroup = useMemo(
    () => sidebarGroups.find((g) => g.id === groupId) ?? sidebarGroups[0],
    [groupId]
  );

  return (
    <div className="relative">
      {/* Outer container */}
      <div
        className="h-[calc(100vh-2rem)] bg-white text-slate-700 shadow-sm border border-slate-200 rounded-2xl overflow-hidden relative transition-[width] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
        style={{
          width: isCollapsed ? COLLAPSED_WIDTH : SIDEBAR_WIDTH,
        }}
      >
        <div className="h-full w-full">
          {/* HEADER */}
          <div className="flex items-center justify-between px-4 py-5">
            <div
              className={`overflow-hidden transition-[opacity,transform,max-width] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
                isCollapsed
                  ? "opacity-0 -translate-x-2 pointer-events-none max-w-0"
                  : "opacity-100 translate-x-0 max-w-[160px]"
              }`}
            >
              <div className="text-lg font-semibold text-slate-900 whitespace-nowrap">
                ByeWind
              </div>
              <div className="text-xs text-slate-400 whitespace-nowrap">
                Admin Panel
              </div>
            </div>

            <button
              onClick={() => setIsCollapsed((prev) => !prev)}
              className="rounded-full border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50"
            >
              {isCollapsed ? <FiChevronRight /> : <FiChevronLeft />}
            </button>
          </div>

          {/* ROLE SWITCH */}
          <div className="px-4">
            <div
              className={`relative transition-[margin] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
                isCollapsed ? "mb-3" : "mb-6"
              }`}
            >
              <div
                className={`overflow-hidden transition-[max-height] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
                  isCollapsed ? "max-h-10" : "max-h-12"
                }`}
              >
                <button
                  onClick={() => setIsOpen((prev) => !prev)}
                  className={`rounded-xl border border-slate-200 bg-slate-50 text-sm font-medium hover:bg-slate-100 ${
                    isCollapsed
                      ? "w-full px-0 py-2 flex items-center justify-center"
                      : "w-full px-3 py-2 text-left flex items-center justify-between"
                  }`}
                >
                  <span
                    className={`text-xs tracking-wide transition-[opacity,max-width] duration-200 ${
                      isCollapsed
                        ? "opacity-100 max-w-12"
                        : "opacity-0 max-w-0 pointer-events-none"
                    }`}
                  >
                    {activeGroup.label
                      .split(" ")
                      .map((part) => part[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()}
                  </span>
                  <span
                    className={`overflow-hidden whitespace-nowrap transition-[opacity,max-width] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
                      isCollapsed
                        ? "opacity-0 max-w-0 pointer-events-none"
                        : "opacity-100 max-w-[140px] delay-150"
                    }`}
                  >
                    {activeGroup.label}
                  </span>
                  <span
                    className={`transition-[opacity,max-width,transform] duration-300 ${
                      isCollapsed
                        ? "opacity-0 max-w-0 pointer-events-none"
                        : "opacity-100 max-w-6 delay-150"
                    } ${isOpen ? "rotate-180" : ""}`}
                  >
                    ▾
                  </span>
                </button>
              </div>

              <div
                className={`absolute top-full mt-2 rounded-xl border border-slate-200 bg-white shadow-lg transition-[opacity,transform] duration-200 ease-out z-20 ${
                  isCollapsed ? "left-full ml-2 w-44" : "left-0 right-0"
                } ${
                  isOpen
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 -translate-y-2 pointer-events-none"
                }`}
              >
                {sidebarGroups.map((group) => (
                  <button
                    key={group.id}
                    onClick={() => {
                      setGroupId(group.id);
                      setIsOpen(false);
                    }}
                    className={`w-full px-3 py-2 text-left text-sm hover:bg-slate-50 ${
                      group.id === groupId
                        ? "bg-slate-50 text-slate-900"
                        : "text-slate-600"
                    }`}
                  >
                    {group.label}
                  </button>
                ))}
              </div>
            </div>

            <div
              className={`overflow-hidden transition-[max-height,opacity,margin] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
                isCollapsed ? "max-h-3 opacity-100 my-2" : "max-h-0 opacity-0 my-0"
              }`}
            >
              <div className="h-px bg-slate-200" />
            </div>

            <div className="mb-3 h-5 overflow-hidden">
              <div
                className={`text-xs font-semibold uppercase tracking-wide text-slate-400 transition-opacity duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
                  isCollapsed
                    ? "opacity-0 pointer-events-none"
                    : "opacity-100"
                }`}
              >
                Navigation
              </div>
            </div>
          </div>

          {/* NAV ITEMS */}
          <nav className="flex flex-col space-y-1">
            {activeGroup.items.map((item) => {
              const Icon = iconMap[item.name] ?? FiHome;

              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  end={item.path === "/dashboard"}
                  className={({ isActive }) =>
                    `grid items-center rounded-xl text-sm transition-[margin,padding] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
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
                    <Icon className="text-base flex-shrink-0" />
                  </span>

                  <span
                    className={`overflow-hidden whitespace-nowrap transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
                      isCollapsed
                        ? "opacity-0 -translate-x-1 pointer-events-none"
                        : "opacity-100 translate-x-0"
                    }`}
                  >
                    {item.name}
                  </span>
                </NavLink>
              );
            })}
          </nav>
        </div>
      </div>
    </div>
  );
};

export default SideBar;
