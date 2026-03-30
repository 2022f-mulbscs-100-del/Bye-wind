import { useGoLiveContext } from "@/context/GoLiveContext";
import Loader from "@/Components/loader";
import OnboardingWizard from "./OnboardingWizard";

const OnboardingRouter = () => {
  const { goLiveStatus, isLoadingGoLive } = useGoLiveContext();

  if (isLoadingGoLive && !goLiveStatus) {
    return (
      <div className="flex h-[80vh] w-full items-center justify-center">
        <Loader size={40} />
      </div>
    );
  }

  // Always show OnboardingWizard
  return <OnboardingWizard />;
};

export default OnboardingRouter;
