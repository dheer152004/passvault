import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export const DEFAULT_VAULT_ID = "default";

export interface Vault {
  id: string;
  name: string;
  icon: string;
  color: string;
  createdAt: Date;
  isDefault?: boolean;
}

interface VaultsContextType {
  vaults: Vault[];
  allVaults: Vault[]; // includes default vault
  activeVaultId: string;
  setActiveVaultId: (id: string) => void;
  addVault: (name: string, icon: string, color: string) => void;
  updateVault: (id: string, updates: Partial<Omit<Vault, 'id' | 'createdAt' | 'isDefault'>>) => void;
  deleteVault: (id: string) => void;
}

const VaultsContext = createContext<VaultsContextType | undefined>(undefined);

const VAULT_ICONS = ["📚", "🎓", "💼", "🏠", "🎮", "💰", "🔒", "⭐"];
const VAULT_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16"];

const DEFAULT_VAULT: Vault = {
  id: DEFAULT_VAULT_ID,
  name: "Default Vault",
  icon: "🔐",
  color: "#6366f1",
  createdAt: new Date(0),
  isDefault: true,
};

export function VaultsProvider({ children }: { children: ReactNode }) {
  const [vaults, setVaults] = useState<Vault[]>(() => {
    const saved = localStorage.getItem("vaults");
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.map((v: any) => ({ ...v, createdAt: new Date(v.createdAt) }));
    }
    return [];
  });

  const [activeVaultId, setActiveVaultId] = useState<string>(() => {
    return localStorage.getItem("activeVaultId") || DEFAULT_VAULT_ID;
  });

  // All vaults including the default one
  const allVaults = [DEFAULT_VAULT, ...vaults];

  useEffect(() => {
    localStorage.setItem("vaults", JSON.stringify(vaults));
  }, [vaults]);

  useEffect(() => {
    localStorage.setItem("activeVaultId", activeVaultId);
  }, [activeVaultId]);

  const addVault = (name: string, icon: string, color: string) => {
    const newVault: Vault = {
      id: crypto.randomUUID(),
      name,
      icon,
      color,
      createdAt: new Date(),
    };
    setVaults((prev) => [...prev, newVault]);
  };

  const updateVault = (id: string, updates: Partial<Omit<Vault, 'id' | 'createdAt' | 'isDefault'>>) => {
    if (id === DEFAULT_VAULT_ID) return; // Can't update default vault
    setVaults((prev) =>
      prev.map((vault) => (vault.id === id ? { ...vault, ...updates } : vault))
    );
  };

  const deleteVault = (id: string) => {
    if (id === DEFAULT_VAULT_ID) return; // Can't delete default vault
    setVaults((prev) => prev.filter((vault) => vault.id !== id));
    if (activeVaultId === id) {
      setActiveVaultId(DEFAULT_VAULT_ID);
    }
  };

  return (
    <VaultsContext.Provider
      value={{
        vaults,
        allVaults,
        activeVaultId,
        setActiveVaultId,
        addVault,
        updateVault,
        deleteVault,
      }}
    >
      {children}
    </VaultsContext.Provider>
  );
}

export function useVaults() {
  const context = useContext(VaultsContext);
  if (context === undefined) {
    throw new Error("useVaults must be used within a VaultsProvider");
  }
  return context;
}

export { VAULT_ICONS, VAULT_COLORS };

