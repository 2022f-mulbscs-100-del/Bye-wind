import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import SideBar from "./Components/Sidebar/Sidebar";
import Navbar from "./Components/Navbar/Navbar";
import ErrorBoundary from "./ErrorBoundary";
import { useScreenSize } from "./customHooks/ScreenSize";

const Layout = () => {
  const size = useScreenSize();
  const location = useLocation();
  const isMobile = size <= 900;
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname, isMobile]);

  return (
    <div className="flex min-h-screen bg-slate-100">
      {!isMobile && (
        <div className="p-4 z-[100]">
          <ErrorBoundary>
            <div className="sticky top-4 z-[100]">
              <SideBar />
            </div>
          </ErrorBoundary>
        </div>
      )}

      <div className="flex-1 min-w-0 p-4">
        <div className="sticky top-4 z-30">
          <Navbar
            showMenuButton={isMobile}
            onMenuClick={() => setIsSidebarOpen((prev) => !prev)}
          />
        </div>
        <div className="mt-4">
          <Outlet />
        </div>
      </div>

      {isMobile && (
        <>
          <button
            type="button"
            aria-label="Close Sidebar Overlay"
            onClick={() => setIsSidebarOpen(false)}
            className={`fixed inset-0 z-40 bg-slate-900/30 transition-opacity duration-300 ${
              isSidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
            }`}
          />
          <div
            className={`fixed left-4 top-4 bottom-4 z-50 transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
              isSidebarOpen ? "translate-x-0" : "-translate-x-[120%]"
            }`}
          >
            <ErrorBoundary>
              <SideBar />
            </ErrorBoundary>
          </div>
        </>
      )}
    </div>
  );
};

export default Layout;
