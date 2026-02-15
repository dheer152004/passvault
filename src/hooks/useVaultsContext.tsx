import { createContext, useContext, ReactNode } from "react";

export interface Vault {
  id: string;
  name: string;
  icon: string | null;
  color: string | null;
}

interface VaultsContextType {
  vaults: Vault[];
  activeVaultId: string | undefined;
  setActiveVaultId: (id: string | undefined) => void;
}

const VaultsContext = createContext<VaultsContextType | undefined>(undefined);

export function VaultsContextProvider({
  children,
  vaults,
  activeVaultId,
  setActiveVaultId,
}: {
  children: ReactNode;
  vaults: Vault[];
  activeVaultId: string | undefined;
  setActiveVaultId: (id: string | undefined) => void;
}) {
  return (
    <VaultsContext.Provider value={{ vaults, activeVaultId, setActiveVaultId }}>
      {children}
    </VaultsContext.Provider>
  );
}

export function useVaultsContext() {
  const context = useContext(VaultsContext);
  if (context === undefined) {
    throw new Error("useVaultsContext must be used within a VaultsContextProvider");
  }
  return context;
}

