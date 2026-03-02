import { Outlet } from "react-router-dom";
import SideBar from "./Components/Sidebar/Sidebar";
import Navbar from "./Components/Navbar/Navbar";
import ErrorBoundary from "./ErrorBoundary";
import { useScreenSize } from "./customHooks/ScreenSize";
const Layout = () => {
  const size = useScreenSize();
  return (
    <div className="flex min-h-screen bg-slate-100">
      <div className="p-4 z-[100]">
        <ErrorBoundary>
          <div className="sticky top-4 z-[100]">
            <SideBar />
          </div>
        </ErrorBoundary>
      </div>
      <div className="flex-1 min-w-0 p-4">
        <div className={`sticky top-4 z-10 ${size <= 900 ? "pl-[80px]" : ""}`}>
          <Navbar />
        </div>
        <div className={`mt-4 ${size <= 900 ? "pl-[80px]" : ""}`}>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Layout;
