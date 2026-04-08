import { useGoLiveContext } from "@/context/GoLiveContext";
import { useBranchContext } from "@/context/BranchContext";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Loader from "@/Components/loader";
import OnboardingWizard from "./OnboardingWizard";

const OnboardingRouter = () => {
  const { goLiveStatus, isLoadingGoLive } = useGoLiveContext();
  const { branches, selectedBranchId } = useBranchContext();
  const navigate = useNavigate();

  const selectedBranch = branches.find(b => b.id === selectedBranchId);
  const isBranchLive = selectedBranch?.isLive || false;

  useEffect(() => {
    if (!isLoadingGoLive && isBranchLive) {
      navigate("/dashboard", { replace: true });
    }
  }, [isBranchLive, isLoadingGoLive, navigate]);

  if (isLoadingGoLive && !goLiveStatus) {
    return (
      <div className="flex h-[80vh] w-full items-center justify-center">
        <Loader size={40} />
      </div>
    );
  }

  // Always show OnboardingWizard if not live
  return <OnboardingWizard />;
};

export default OnboardingRouter;
