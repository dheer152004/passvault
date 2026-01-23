import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { deriveKey, generateSalt, hashPassword } from "@/lib/crypto";

interface EncryptionContextType {
  encryptionKey: CryptoKey | null;
  isUnlocked: boolean;
  salt: string | null;
  initializeEncryption: (password: string, existingSalt?: string) => Promise<{ salt: string; passwordHash: string }>;
  lockVault: () => void;
}

const EncryptionContext = createContext<EncryptionContextType | null>(null);

const SALT_STORAGE_KEY = 'digilock_encryption_salt';

export function EncryptionProvider({ children }: { children: ReactNode }) {
  const [encryptionKey, setEncryptionKey] = useState<CryptoKey | null>(null);
  const [salt, setSalt] = useState<string | null>(null);

  // Initialize encryption with master password
  const initializeEncryption = useCallback(async (
    password: string,
    existingSalt?: string
  ): Promise<{ salt: string; passwordHash: string }> => {
    // Use existing salt or generate new one
    const encSalt = existingSalt || await generateSalt();
    
    // Derive encryption key from password
    const key = await deriveKey(password, encSalt);
    
    // Generate password hash for auth verification
    const passwordHash = await hashPassword(password, encSalt);
    
    // Store in state (memory only, never persisted)
    setEncryptionKey(key);
    setSalt(encSalt);
    
    // Store salt in localStorage (salt is not secret, just needs to be consistent)
    localStorage.setItem(SALT_STORAGE_KEY, encSalt);
    
    return { salt: encSalt, passwordHash };
  }, []);

  // Lock vault (clear encryption key from memory)
  const lockVault = useCallback(() => {
    setEncryptionKey(null);
    // Don't clear salt - we need it to derive the key again on unlock
  }, []);

  return (
    <EncryptionContext.Provider
      value={{
        encryptionKey,
        isUnlocked: !!encryptionKey,
        salt,
        initializeEncryption,
        lockVault,
      }}
    >
      {children}
    </EncryptionContext.Provider>
  );
}

export function useEncryption() {
  const context = useContext(EncryptionContext);
  if (!context) {
    throw new Error("useEncryption must be used within an EncryptionProvider");
  }
  return context;
}

// Get stored salt from localStorage
export function getStoredSalt(): string | null {
  return localStorage.getItem(SALT_STORAGE_KEY);
}
