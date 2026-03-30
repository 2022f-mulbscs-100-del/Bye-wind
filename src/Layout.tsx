import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import SideBar from "./Components/Sidebar/Sidebar";
import Navbar from "./Components/Navbar/Navbar";
import StatusBanner from "./Components/StatusBanner";
import ErrorBoundary from "./ErrorBoundary";
import { useScreenSize } from "./customHooks/ScreenSize";
import { BranchProvider, useBranchContext } from "./context/BranchContext";
import { GoLiveProvider, useGoLiveContext } from "./context/GoLiveContext";
import OnboardingGuard from "./Components/OnboardingGuard";
import Loader from "./Components/loader";

const LayoutContent = () => {
  const size = useScreenSize();
  const location = useLocation();
  const isMobile = size <= 900;
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const { isLoadingGoLive, goLiveStatus } = useGoLiveContext();
  const { isLoadingBranches } = useBranchContext();

  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname, isMobile]);

  // Unified loading state for "critical" initialization data
  if ((isLoadingGoLive && !goLiveStatus) || isLoadingBranches) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-slate-50 gap-4">
        <Loader size={48} />
        <div className="animate-pulse text-xs font-bold uppercase tracking-widest text-slate-400">
          Syncing Restaurant Engine...
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100 animate-in fade-in duration-700">
      {!isMobile && (
        <div className="p-4 z-[100]">
          <ErrorBoundary>
            <div className="sticky top-4 z-[100]">
              <SideBar />
            </div>
          </ErrorBoundary>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col p-4">
        <StatusBanner />
        <div className="shrink-0">
          <Navbar
            showMenuButton={isMobile}
            onMenuClick={() => setIsSidebarOpen((prev) => !prev)}
          />
        </div>
        <div className="mt-4 min-h-0 flex-1 overflow-y-auto pr-3">
          <OnboardingGuard />
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

const WrappedLayout = () => (
  <GoLiveProvider>
    <BranchProvider>
      <LayoutContent />
    </BranchProvider>
  </GoLiveProvider>
);

export default WrappedLayout;
