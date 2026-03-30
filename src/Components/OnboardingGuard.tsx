import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useGoLiveContext } from "@/context/GoLiveContext";
import { useBranchContext } from "@/context/BranchContext";

const OnboardingGuard = () => {
  useGoLiveContext();
  const { branches, selectedBranchId } = useBranchContext();
  const location = useLocation();

  // Loading is now handled by the parent LayoutContent to avoid "triple loading" jitter
  
  const hasBranches = branches.length > 0;
  const isAllBranches = selectedBranchId === null;
  const selectedBranch = branches.find((b) => b.id === selectedBranchId);
  const isBranchLive = selectedBranch?.isLive || false;

  const isSetupRoute = [
    "/dashboard/onboarding",
    "/dashboard/staff",
    "/dashboard/payment",
    "/dashboard/settings",
    "/dashboard/floor",
    "/dashboard/business-hours",
    "/dashboard/reservation-policy",
    "/dashboard/turn-times",
  ].includes(location.pathname);

  // 1. If 0 branches exist, MUST be on one of the setup pages
  if (!hasBranches && !isSetupRoute) {
    return <Navigate to="/dashboard/onboarding" replace />;
  }

  // 2. If a specific branch is selected but it's NOT live
  if (!isAllBranches && !isBranchLive && !isSetupRoute) {
    return <Navigate to="/dashboard/onboarding" replace />;
  }

  return <Outlet />;
};

export default OnboardingGuard;
