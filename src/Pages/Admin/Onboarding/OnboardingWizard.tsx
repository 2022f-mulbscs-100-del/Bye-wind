import { useState, useEffect, useMemo } from "react";
import { useGoLiveContext } from "@/context/GoLiveContext";
import { useBranchContext } from "@/context/BranchContext";
import Loader from "@/Components/loader";
import BranchSetup from "./components/BranchSetup";
import ReviewGoLive from "./components/ReviewGoLive";
import OnboardingStep from "./components/OnboardingStep";

export default function OnboardingWizard() {
  const { goLiveStatus, refreshGoLiveStatus } = useGoLiveContext();
  const { selectedBranchId, branches } = useBranchContext();
  const [currentStep, setCurrentStep] = useState(1);

  const [hasInitialized, setHasInitialized] = useState(false);

  // Get branch-specific status when a branch is selected
  const branchStatus = useMemo(() => {
    if (selectedBranchId && goLiveStatus?.branchStatuses) {
      return goLiveStatus.branchStatuses.find(
        (status) => status.branchId === selectedBranchId
      );
    }
    return null;
  }, [selectedBranchId, goLiveStatus?.branchStatuses]);

  // Determine which checklist to use
  const activeChecklist = branchStatus || goLiveStatus;

  useEffect(() => {
    // Only auto-jump on the very first time we get goLiveStatus
    if (activeChecklist && !hasInitialized) {
      // For branch-level: only show first 4 steps
      if (branchStatus) {
        if (!branchStatus.businessHoursDone) setCurrentStep(2);
        else if (!branchStatus.floorPlanDone || !branchStatus.tablesConfiguredDone) setCurrentStep(3);
        else if (!branchStatus.reservationPolicyDone) setCurrentStep(4);
        else setCurrentStep(5); // Review step for branch
      } else {
        // For restaurant-level: show all steps
        if (!goLiveStatus.branchSetupDone) setCurrentStep(1);
        else if (!goLiveStatus.businessHoursDone) setCurrentStep(2);
        else if (!goLiveStatus.floorPlanDone || !goLiveStatus.tablesConfiguredDone) setCurrentStep(3);
        else if (!goLiveStatus.reservationPolicyDone) setCurrentStep(4);
        else if (!goLiveStatus.staffSetupDone) setCurrentStep(5);
        else if (!goLiveStatus.paymentConfiguredDone) setCurrentStep(6);
        else if (!goLiveStatus.communicationDone) setCurrentStep(7);
        else if (!goLiveStatus.brandingDone) setCurrentStep(8);
        else setCurrentStep(9);
      }

      setHasInitialized(true);
    }
  }, [activeChecklist, branchStatus, goLiveStatus, hasInitialized]);

  if (!goLiveStatus) {
    return (
      <div className="flex h-[60vh] w-full items-center justify-center">
        <Loader size={40} />
      </div>
    );
  }

  const handleNext = () => {
    setCurrentStep((p) => Math.min(9, p + 1));
  };
  const handleBack = () => setCurrentStep((p) => Math.max(1, p - 1));

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <BranchSetup onNext={handleNext} />;
      case 2:
        return (
          <OnboardingStep
            title="Business Hours"
            description="Set up your weekly operating hours and split shifts. This determines when guests can book tables at this branch."
            linkText="Configure Hours"
            linkPath="/dashboard/business-hours"
            isCompleted={activeChecklist?.businessHoursDone ?? false}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 3:
        return (
          <OnboardingStep
            title="Floor Plan & Tables"
            description="Design your restaurant layout, define zones, and place tables on the canvas. Accurate seating capacity is essential for bookings."
            linkText="Design Floor Plan"
            linkPath="/dashboard/floor"
            isCompleted={(activeChecklist?.floorPlanDone ?? false) && (activeChecklist?.tablesConfiguredDone ?? false)}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 4:
        return (
          <OnboardingStep
            title="Reservation Rules"
            description="Set your booking windows, party size limits, and turn times to optimize your seating capacity."
            linkText="Manage Rules"
            linkPath="/dashboard/reservation-policy"
            isCompleted={(activeChecklist?.reservationPolicyDone ?? false) && (activeChecklist?.turnTimesDone ?? false)}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 5:
        return (
          <OnboardingStep
            title="Staff Management"
            description="Add your team members and assign roles. Ensure your hosts and staff have access to manage daily operations."
            linkText="Invite Staff"
            linkPath="/dashboard/staff"
            isCompleted={goLiveStatus?.staffSetupDone ?? false}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 6:
        return (
          <OnboardingStep
            title="Payment Gateway"
            description="Connect your Stripe or Square account to handle booking deposits and secure your revenue."
            linkText="Setup Payments"
            linkPath="/dashboard/payment"
            isCompleted={goLiveStatus.paymentConfiguredDone}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 7:
        return (
          <OnboardingStep
            title="Notifications"
            description="Configure SMS and Email channels to keep your guests informed about their reservations."
            linkText="Configure Channels"
            linkPath="/dashboard/settings"
            isCompleted={goLiveStatus.communicationDone}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 8:
        return (
          <OnboardingStep
            title="Branding"
            description="Customize your booking widget with your brand colors, logo, and fonts for a seamless guest experience."
            linkText="Setup Branding"
            linkPath="/dashboard/settings"
            isCompleted={goLiveStatus.brandingDone}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 9:
        return <ReviewGoLive onBack={handleBack} />;
      default:
        return <BranchSetup onNext={handleNext} />;
    }
  };

  const hasBranches = branches.length > 0;

  const allStepTitles = [
    "Location",
    "Hours",
    "Tables",
    "Rules",
    "Staff",
    "Payments",
    "Comms",
    "Widget",
    "Review",
  ];

  // Always show all 9 steps
  const visibleSteps = hasBranches ? allStepTitles : [allStepTitles[0]];
  const totalVisible = visibleSteps.length;

  // When a branch is selected, show branch items (2-5) with actual status
  // and restaurant items (1, 6-8) as already completed
  const stepStatus = branchStatus
    ? [
        true, // 1. Location - Done (restaurant-level)
        branchStatus.businessHoursDone, // 2. Hours - Branch-level
        branchStatus.floorPlanDone && branchStatus.tablesConfiguredDone, // 3. Tables - Branch-level
        branchStatus.reservationPolicyDone && branchStatus.turnTimesDone, // 4. Rules - Branch-level
        false, // 5. Staff - Not tracked per branch yet (branch-level)
        true, // 6. Payments - Done (restaurant-level)
        true, // 7. Comms - Done (restaurant-level)
        true, // 8. Widget - Done (restaurant-level)
        branchStatus.completionPercentage === 100 && (goLiveStatus?.branchSetupDone ?? false), // 9. Review
      ]
    : [
        goLiveStatus.branchSetupDone, // 1. Location
        goLiveStatus.businessHoursDone, // 2. Hours
        goLiveStatus.floorPlanDone && goLiveStatus.tablesConfiguredDone, // 3. Tables
        goLiveStatus.reservationPolicyDone && goLiveStatus.turnTimesDone, // 4. Rules
        goLiveStatus.staffSetupDone, // 5. Staff
        goLiveStatus.paymentConfiguredDone, // 6. Payments
        goLiveStatus.communicationDone, // 7. Comms
        goLiveStatus.brandingDone, // 8. Widget
        goLiveStatus.completionPercentage === 100, // 9. Review
      ];

  return (
    <div className="mx-auto max-w-4xl py-6">
      <div className="mb-8 text-center sm:text-left">
        <h1 className="text-3xl font-bold text-slate-900">
          {hasBranches ? "Branch Setup" : "Restaurant Registration"}
        </h1>
        <p className="mt-2 text-slate-500">
          {hasBranches 
            ? "Complete these steps to activate your branch." 
            : "Create your first branch to get started."}
        </p>
      </div>

      <div className="grid lg:grid-cols-[240px_1fr] gap-8 items-start">
        {/* Sidebar Steps indicator */}
        <div className="hidden lg:block space-y-2 relative">
          <div className="absolute left-[11px] top-4 bottom-4 w-0.5 bg-slate-100 -z-10" />
          {visibleSteps.map((title, idx) => {
            const stepNum = idx + 1;
            const isCompleted = stepStatus[idx];
            const isCurrent = stepNum === currentStep;

            return (
              <button
                key={title}
                onClick={() => setCurrentStep(stepNum)}
                className={`flex w-full items-center gap-4 py-2 transition-opacity hover:opacity-100 opacity-${
                  isCurrent || isCompleted ? "100" : "50"
                }`}
              >
                <div
                  className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ring-4 ring-slate-50 ${
                    isCompleted
                      ? "bg-emerald-500 text-white"
                      : isCurrent
                      ? "bg-indigo-600 text-white"
                      : "bg-slate-200 text-slate-500"
                  }`}
                >
                  {isCompleted ? "✓" : stepNum}
                </div>
                <span className={`text-sm font-medium ${isCurrent ? "text-indigo-600" : "text-slate-600"}`}>
                  {title}
                </span>
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/50 min-h-[500px]">
          {/* Mobile Progress Bar */}
          <div className="mb-6 lg:hidden border-b border-slate-100 pb-4">
            <div className="flex justify-between text-sm font-semibold uppercase tracking-wide text-indigo-500">
              <span>Step {currentStep} of {totalVisible}</span>
              <span>{visibleSteps[currentStep - 1]}</span>
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full bg-indigo-500 transition-all duration-300"
                style={{ width: `${(currentStep / totalVisible) * 100}%` }}
              />
            </div>
          </div>

          <div className="min-h-[400px]">
            {renderStep()}
          </div>
        </div>
      </div>
    </div>
  );
}
