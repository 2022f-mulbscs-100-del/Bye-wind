import React, { createContext, useContext, useState, useEffect } from "react";
import { getJson } from "@/lib/api";

export type BackendBranch = {
  id: string;
  name: string;
  status?: string | null;
  isLive: boolean;
  isActive: boolean;
};

type BranchContextType = {
  branches: BackendBranch[];
  selectedBranchId: string | null;
  setSelectedBranchId: (id: string | null) => void;
  isLoadingBranches: boolean;
  refreshBranches: () => Promise<void>;
};

const BranchContext = createContext<BranchContextType | undefined>(undefined);

export const useBranchContext = () => {
  const context = useContext(BranchContext);
  if (!context) {
    throw new Error("useBranchContext must be used within a BranchProvider");
  }
  return context;
};

export const BranchProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [branches, setBranches] = useState<BackendBranch[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null);
  const [isLoadingBranches, setIsLoadingBranches] = useState(true);

  const fetchBranches = async () => {
    setIsLoadingBranches(true);
    try {
      const response = await getJson<{ data: BackendBranch[] }>("/branches?limit=50");
      const data = response.data as any;
      setBranches(data?.data ?? data ?? []);
    } catch (err) {
      console.error("Failed to fetch branches for context", err);
      setBranches([]);
    } finally {
      setIsLoadingBranches(false);
    }
  };

  useEffect(() => {
    void fetchBranches();
  }, []);

  return (
    <BranchContext.Provider
      value={{
        branches,
        selectedBranchId,
        setSelectedBranchId,
        isLoadingBranches,
        refreshBranches: fetchBranches,
      }}
    >
      {children}
    </BranchContext.Provider>
  );
};
