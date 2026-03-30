import React, { createContext, useContext, useState, useEffect } from "react";
import { getJson } from "@/lib/api";
import { getStoredRestaurantId } from "@/lib/auth";

export type BranchGoLiveStatus = {
  id: string;
  branchId: string;
  businessHoursDone: boolean;
  floorPlanDone: boolean;
  tablesConfiguredDone: boolean;
  reservationPolicyDone: boolean;
  turnTimesDone: boolean;
  completionPercentage: number;
  isReady: boolean;
  createdAt: string;
  updatedAt: string;
  branch: {
    id: string;
    name: string;
  };
};

export type GoLiveStatus = {
  completionPercentage: number;
  isLive: boolean;
  restaurantProfileDone: boolean;
  branchSetupDone: boolean;
  businessHoursDone: boolean;
  floorPlanDone: boolean;
  tablesConfiguredDone: boolean;
  turnTimesDone: boolean;
  reservationPolicyDone: boolean;
  staffSetupDone: boolean;
  paymentConfiguredDone: boolean;
  communicationDone: boolean;
  brandingDone: boolean;
  branchStatuses?: BranchGoLiveStatus[];
  wentLiveAt?: string | null;
  lastCheckedAt?: string | null;
};

type GoLiveContextType = {
  goLiveStatus: GoLiveStatus | null;
  isLoadingGoLive: boolean;
  refreshGoLiveStatus: () => Promise<void>;
};

const GoLiveContext = createContext<GoLiveContextType | undefined>(undefined);

//eslint-disable-next-line
export const useGoLiveContext = () => {
  const context = useContext(GoLiveContext);
  if (!context) {
    throw new Error("useGoLiveContext must be used within a GoLiveProvider");
  }
  return context;
};

export const GoLiveProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [goLiveStatus, setGoLiveStatus] = useState<GoLiveStatus | null>(null);
  const [isLoadingGoLive, setIsLoadingGoLive] = useState(true);

  const fetchGoLiveStatus = async () => {
    const restaurantId = getStoredRestaurantId();
    if (!restaurantId) {
      setIsLoadingGoLive(false);
      return;
    }

    setIsLoadingGoLive(true);
    try {
      const response = await getJson<{ data: GoLiveStatus }>(`/go-live/${restaurantId}`);
      setGoLiveStatus(response.data?.data ?? (response.data as unknown as GoLiveStatus));
    } catch (err) {
      console.error("Failed to fetch go-live status for context", err);
      setGoLiveStatus(null);
    } finally {
      setIsLoadingGoLive(false);
    }
  };

  useEffect(() => {
    void fetchGoLiveStatus();
  }, []);

  return (
    <GoLiveContext.Provider
      value={{
        goLiveStatus,
        isLoadingGoLive,
        refreshGoLiveStatus: fetchGoLiveStatus,
      }}
    >
      {children}
    </GoLiveContext.Provider>
  );
};
