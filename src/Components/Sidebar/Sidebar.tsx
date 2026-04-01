import { useEffect, useMemo, useRef, useState } from "react";
import type { IconType } from "react-icons";
import {
  FiBarChart2,
  FiBookOpen,
  FiBriefcase,
  FiChevronLeft,
  FiChevronRight,
  FiChevronDown,
  FiCreditCard,
  FiGrid,
  FiHome,
  FiLayers,
  FiShoppingBag,
  FiSettings,
  FiUsers,
  FiZap,
  FiClock,
  FiCheckCircle,
} from "react-icons/fi";
import { AdminBranchLevel, AdminMasterLevel } from "../../../public/SideBarData";
import { NavLink, useNavigate } from "react-router-dom";
import { useBranchContext } from "@/context/BranchContext";

// defaultSidebarGroups was unused and removed.

const iconMap: Record<string, IconType> = {
  Dashboard: FiHome,
  "Branches Managment": FiGrid,
  "Staff Managment": FiUsers,
  "Menu Management": FiShoppingBag,
  "Business Hours": FiClock,
  "Reservation Rules": FiCheckCircle,
  "Turn Times": FiClock,
  Reservation: FiBookOpen,
  Orders: FiShoppingBag,
  Payment: FiCreditCard,
  "Guest CRM": FiBriefcase,
  Marketing: FiBarChart2,
  Analytics: FiBarChart2,
  Settings: FiSettings,
  "Restaurant Settings": FiSettings,
  Onboarding: FiZap,
  "Floor Managment": FiLayers,
};

const SIDEBAR_WIDTH = 260;
const COLLAPSED_WIDTH = 72;

const SideBar = () => {
  const navigate = useNavigate();
  const { branches, selectedBranchId, setSelectedBranchId } = useBranchContext();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const groupSwitcherRef = useRef<HTMLDivElement | null>(null);

  const sidebarGroups = useMemo(() => {
    const branchGroups = branches.map((branch) => {
      const status = (branch.status ?? "").toUpperCase();
      const isPending =
        status === "PENDING" || (branch.isActive && !branch.isLive && status !== "LIVE" && status !== "DRAFT");
      const label = isPending ? `${branch.name} (Pending)` : branch.name;

      return {
        id: branch.id,
        label,
        items: AdminBranchLevel,
      };
    });

    return [
      { id: "master", label: "All Branches", items: AdminMasterLevel },
      ...branchGroups,
    ];
  }, [branches]);

  const activeGroup = useMemo(() => {
    const rawGroup = sidebarGroups.find((g) => g.id === (selectedBranchId ?? "master")) ?? sidebarGroups[0];
    const isMaster = rawGroup.id === "master";
    
    // Check if at least one branch is live
    const atLeastOneLive = branches.some(b => (b.status || "").toUpperCase() === "LIVE");
    
    // Check if current selected branch is live
    const currentBranch = branches.find(b => b.id === selectedBranchId);
    const isCurrentLive = (currentBranch?.status || "").toUpperCase() === "LIVE";

    const filteredItems = rawGroup.items.filter(item => {
      // Branches Management is strictly global/master
      if (item.name === "Branches Managment") {
        return isMaster;
      }

      // Menu Management shows everywhere
      if (item.name === "Menu Management") {
        return true;
      }

      // Staff Management is now always visible (branch selection filters the list)
      if (item.name === "Staff Managment") {
        return true;
      }

      // Payment is global in theory, but user wants it in branch view during setup/onboarding.
      if (item.name === "Payment") {
        if (isMaster) return true;
        return !isCurrentLive;
      }

      // Settings (parent) - visible at branch level always
      if (item.name === "Settings") {
        if (isMaster) return true;
        return !isMaster;
      }

      // Operational items show in Master if at least one branch is live, 
      // or in specific branch if that branch is live.
      if (["Reservation", "Orders", "Guest CRM", "Analytics"].includes(item.name)) {
        if (isMaster) return atLeastOneLive;
        return isCurrentLive;
      }

      // Onboarding only shows if branch is selected and not live
      if (item.name === "Onboarding") {
        return !isMaster && !isCurrentLive;
      }

      // Dashboard shows in Master always, but in branch only if live
      if (item.name === "Dashboard") {
        if (isMaster) return true;
        return isCurrentLive;
      }

      return true;
    });

    return { ...rawGroup, items: filteredItems };
  }, [selectedBranchId, sidebarGroups, branches]);

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (!isOpen) return;
      const target = event.target as Node | null;
      if (!target) return;
      if (groupSwitcherRef.current?.contains(target)) return;
      setIsOpen(false);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

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
              className={`overflow-hidden transition-[opacity,transform,max-width] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${isCollapsed
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
              ref={groupSwitcherRef}
              className={`relative transition-[margin] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${isCollapsed ? "mb-3" : "mb-6"
                }`}
            >
              <div
                className={`overflow-hidden transition-[max-height] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${isCollapsed ? "max-h-10" : "max-h-12"
                  }`}
              >
                <button
                  onClick={() => setIsOpen((prev) => !prev)}
                  className={`rounded-xl border border-slate-200 bg-slate-50 text-sm font-medium hover:bg-slate-100 ${isCollapsed
                      ? "w-full px-0 py-2 flex items-center justify-center"
                      : "w-full px-3 py-2 text-left flex items-center justify-between"
                    }`}
                >
                  <span
                    className={`text-xs tracking-wide transition-[opacity,max-width] duration-200 ${isCollapsed
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
                    className={`overflow-hidden whitespace-nowrap transition-[opacity,max-width] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${isCollapsed
                        ? "opacity-0 max-w-0 pointer-events-none"
                        : "opacity-100 max-w-[140px] delay-150"
                      }`}
                  >
                    {activeGroup.label}
                  </span>
                  <span
                    className={`transition-[opacity,max-width,transform] duration-300 ${isCollapsed
                        ? "opacity-0 max-w-0 pointer-events-none"
                        : "opacity-100 max-w-6 delay-150"
                      } ${isOpen ? "rotate-180" : ""}`}
                  >
                    ▾
                  </span>
                </button>
              </div>

              <div
                className={`absolute top-full mt-2 rounded-xl border border-slate-200 bg-white shadow-lg transition-[opacity,transform] duration-200 ease-out z-20 ${isCollapsed ? "left-full ml-2 w-44" : "left-0 right-0"
                  } ${isOpen
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 -translate-y-2 pointer-events-none"
                  }`}
              >
                {sidebarGroups.map((group) => (
                  <button
                    key={group.id}
                    onClick={() => {
                      setSelectedBranchId(group.id === "master" ? null : group.id);
                      setIsOpen(false);
                      navigate("/dashboard");
                    }}
                    className={`w-full px-3 py-2 text-left text-sm hover:bg-slate-50 ${(group.id === "master" && selectedBranchId === null) ||
                        group.id === selectedBranchId
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
              className={`overflow-hidden transition-[max-height,opacity,margin] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${isCollapsed ? "max-h-3 opacity-100 my-2" : "max-h-0 opacity-0 my-0"
                }`}
            >
              <div className="h-px bg-slate-200" />
            </div>

            <div className="mb-3 h-5 overflow-hidden">
              <div
                className={`text-xs font-semibold uppercase tracking-wide text-slate-400 transition-opacity duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${isCollapsed
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
              const hasChildren = item.children && item.children.length > 0;
              const isExpanded = expandedItems.has(item.name);

              const hasBranches = branches.length > 0;
              const isAllBranches = selectedBranchId === null;
              const selectedBranch = branches.find((b) => b.id === selectedBranchId);
              const isBranchLive = (selectedBranch?.status || "").toUpperCase() === "LIVE";

              // CUSTOM FILTERING LOGIC
              let showItem = true;

              if (item.name === "Onboarding") {
                // Show if: (0 branches) OR (specific branch selected AND not live)
                showItem = !hasBranches || (!isAllBranches && !isBranchLive);
              } else if (item.name === "Dashboard") {
                // Show if: (has branches) AND (all branches selected OR specific branch is live)
                showItem = hasBranches && (isAllBranches || isBranchLive);
              } else if (item.name === "Payment") {
                // Show Payment only for "All Branches"
                showItem = isAllBranches;
              } else if (["Staff Managment", "Menu Management"].includes(item.name)) {
                // Staff and Menu always show
                showItem = true;
              } else if (item.name === "Settings") {
                // Settings parent: always visible at branch level
                showItem = !isAllBranches;
              } else if (["Reservation", "Orders", "Guest CRM", "Marketing", "Analytics"].includes(item.name)) {
                // Show if: 
                // 1. One branch exists (Global condition)
                // 2. Specific branch selected AND is live
                // 3. All branches selected AND at least one branch is live
                const isSingleBranch = branches.length === 1;
                showItem = isSingleBranch || (!isAllBranches && isBranchLive) || (isAllBranches && branches.some(b => b.isLive));
              } else if (item.name === "Branches Managment") {
                // Only for "All Branches" view
                showItem = isAllBranches && hasBranches;
              }

              if (!showItem) return null;

              // Render parent item with children
              if (hasChildren) {
                return (
                  <div key={item.name}>
                    {/* Divider before Settings */}
                    {item.name === "Settings" && (
                      <div className={`${isCollapsed ? "mx-4 my-2" : "mx-4 my-3"}`}>
                        <div className="h-px bg-slate-200" />
                      </div>
                    )}

                    {/* Parent item button */}
                    <button
                      onClick={() => {
                        const newExpandedItems = new Set(expandedItems);
                        if (newExpandedItems.has(item.name)) {
                          newExpandedItems.delete(item.name);
                        } else {
                          newExpandedItems.add(item.name);
                        }
                        setExpandedItems(newExpandedItems);
                      }}
                      className={`w-full flex  rounded-xl text-sm transition-[margin,padding,colors] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${isCollapsed ? "mx-4 px-2 py-2" : "mx-4 px-3 py-2 gap-3"
                        } ${isExpanded
                          ? ""
                          : "text-slate-600 "
                        }`}
                    >
                      <span className="flex h-5 w-5 items-center justify-center flex-shrink-0">
                        <Icon className="text-base" />
                      </span>

                      <span
                        className={`overflow-hidden whitespace-nowrap transition-[opacity,transform] mr-22 duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${isCollapsed
                            ? "opacity-0 -translate-x-1 pointer-events-none w-0"
                            : "opacity-100 translate-x-0   "
                          }`}
                      >
                        {item.name}
                      </span>

                      <span className={`flex h-5 w-5 items-center justify-center flex-shrink-0 transition-transform duration-300 ${isExpanded ? "rotate-180" : ""} ${isCollapsed ? "hidden" : ""}`}>
                        <FiChevronDown className="text-base" />
                      </span>
                    </button>

                    {/* Children items */}
                    {isExpanded && !isCollapsed && (
                      <div className="flex flex-col space-y-1 mt-2 mb-2">
                        {item.children!.map((childItem) => {
                          const ChildIcon = iconMap[childItem.name] ?? FiHome;

                          return (
                            <NavLink
                              key={childItem.name}
                              to={childItem.path!}
                              end={childItem.path === "/dashboard"}
                              className={({ isActive }) =>
                                `flex items-center gap-3 rounded-xl text-sm transition-[colors,background] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] mx-6 px-3 py-2 font-medium ${
                                  isActive
                                    ? "bg-blue-50 text-blue-600"
                                    : "text-slate-600 hover:bg-slate-50"
                                }`
                              }
                            >
                              <span className="flex h-5 w-5 items-center justify-center flex-shrink-0">
                                <ChildIcon className="text-base" />
                              </span>

                              <span className="overflow-hidden whitespace-nowrap flex-1">
                                {childItem.name}
                              </span>
                            </NavLink>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }

              // Render regular item (no children)
              return (
                <NavLink
                  key={item.name}
                  to={item.path!}
                  end={item.path === "/dashboard"}
                  className={({ isActive }) =>
                    `grid items-center rounded-xl text-sm transition-[margin,padding] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${isCollapsed ? "mx-4 px-2 py-2" : "mx-4 px-3 py-2"
                    } ${isActive
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
                    className={`overflow-hidden whitespace-nowrap transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${isCollapsed
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
