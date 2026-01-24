import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useEncryption } from "./useEncryption";
import { encryptObject, decryptArray, decryptObject } from "@/lib/crypto";
import { SENSITIVE_FIELDS } from "@/lib/sensitiveFields";
import { toast } from "sonner";

// Types matching database schema
export interface DbPassword {
  id: string;
  user_id: string;
  vault_id: string | null;
  name: string;
  username: string | null;
  password: string;
  url: string | null;
  category: string | null;
  notes: string | null;
  is_favorite: boolean | null;
  created_at: string;
  updated_at: string;
}

export interface DbNote {
  id: string;
  user_id: string;
  vault_id: string | null;
  title: string;
  content: string | null;
  is_favorite: boolean | null;
  created_at: string;
  updated_at: string;
}

export interface DbCard {
  id: string;
  user_id: string;
  vault_id: string | null;
  name: string;
  card_type: string | null;
  card_number: string;
  cardholder_name: string | null;
  expiry_date: string | null;
  cvv: string | null;
  pin: string | null;
  billing_address: string | null;
  notes: string | null;
  is_favorite: boolean | null;
  created_at: string;
  updated_at: string;
}

export interface DbAddress {
  id: string;
  user_id: string;
  vault_id: string | null;
  name: string;
  full_name: string | null;
  company: string | null;
  street_address: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  country: string | null;
  phone: string | null;
  email: string | null;
  notes: string | null;
  is_favorite: boolean | null;
  created_at: string;
  updated_at: string;
}

export interface DbTOTP {
  id: string;
  user_id: string;
  vault_id: string | null;
  name: string;
  issuer: string | null;
  secret: string;
  is_favorite: boolean | null;
  created_at: string;
  updated_at: string;
}

export interface DbIDCard {
  id: string;
  user_id: string;
  vault_id: string | null;
  name: string;
  id_type: string | null;
  id_number: string;
  full_name: string | null;
  date_of_birth: string | null;
  issue_date: string | null;
  expiry_date: string | null;
  issuing_authority: string | null;
  country: string | null;
  notes: string | null;
  is_favorite: boolean | null;
  created_at: string;
  updated_at: string;
}

export interface DbSSHKey {
  id: string;
  user_id: string;
  vault_id: string | null;
  name: string;
  key_type: string | null;
  public_key: string | null;
  private_key: string;
  passphrase: string | null;
  notes: string | null;
  is_favorite: boolean | null;
  created_at: string;
  updated_at: string;
}

export interface DbCryptoWallet {
  id: string;
  user_id: string;
  vault_id: string | null;
  name: string;
  wallet_type: string | null;
  wallet_address: string | null;
  private_key: string | null;
  seed_phrase: string | null;
  notes: string | null;
  is_favorite: boolean | null;
  created_at: string;
  updated_at: string;
}

export interface DbBankAccount {
  id: string;
  user_id: string;
  vault_id: string | null;
  name: string;
  bank_name: string | null;
  account_type: string | null;
  account_number: string | null;
  routing_number: string | null;
  iban: string | null;
  swift_bic: string | null;
  branch_name: string | null;
  branch_address: string | null;
  notes: string | null;
  is_favorite: boolean | null;
  created_at: string;
  updated_at: string;
}

export interface DbSoftwareLicense {
  id: string;
  user_id: string;
  vault_id: string | null;
  name: string;
  software_type: string | null;
  license_key: string;
  email: string | null;
  password: string | null;
  purchase_date: string | null;
  expiry_date: string | null;
  website: string | null;
  notes: string | null;
  is_favorite: boolean | null;
  created_at: string;
  updated_at: string;
}

export interface DbVault {
  id: string;
  user_id: string;
  name: string;
  icon: string | null;
  color: string | null;
  created_at: string;
  updated_at: string;
}

export function useVaultData() {
  const { user, isAuthenticated } = useAuth();
  const { encryptionKey, isUnlocked } = useEncryption();
  const [isLoading, setIsLoading] = useState(true);
  
  // State for all vault item types
  const [passwords, setPasswords] = useState<DbPassword[]>([]);
  const [notes, setNotes] = useState<DbNote[]>([]);
  const [cards, setCards] = useState<DbCard[]>([]);
  const [addresses, setAddresses] = useState<DbAddress[]>([]);
  const [totps, setTotps] = useState<DbTOTP[]>([]);
  const [idCards, setIdCards] = useState<DbIDCard[]>([]);
  const [sshKeys, setSshKeys] = useState<DbSSHKey[]>([]);
  const [cryptoWallets, setCryptoWallets] = useState<DbCryptoWallet[]>([]);
  const [bankAccounts, setBankAccounts] = useState<DbBankAccount[]>([]);
  const [softwareLicenses, setSoftwareLicenses] = useState<DbSoftwareLicense[]>([]);
  const [vaults, setVaults] = useState<DbVault[]>([]);

  // Fetch all data and decrypt
  const fetchAllData = useCallback(async () => {
    if (!user?.id || !encryptionKey) return;
    
    setIsLoading(true);
    try {
      const [
        passwordsRes,
        notesRes,
        cardsRes,
        addressesRes,
        totpsRes,
        idCardsRes,
        sshKeysRes,
        cryptoRes,
        bankRes,
        licensesRes,
        vaultsRes,
      ] = await Promise.all([
        supabase.from("passwords").select("*").order("created_at", { ascending: false }),
        supabase.from("notes").select("*").order("created_at", { ascending: false }),
        supabase.from("cards").select("*").order("created_at", { ascending: false }),
        supabase.from("addresses").select("*").order("created_at", { ascending: false }),
        supabase.from("totp_authenticators").select("*").order("created_at", { ascending: false }),
        supabase.from("id_cards").select("*").order("created_at", { ascending: false }),
        supabase.from("ssh_keys").select("*").order("created_at", { ascending: false }),
        supabase.from("crypto_wallets").select("*").order("created_at", { ascending: false }),
        supabase.from("bank_accounts").select("*").order("created_at", { ascending: false }),
        supabase.from("software_licenses").select("*").order("created_at", { ascending: false }),
        supabase.from("vaults").select("*").order("created_at", { ascending: false }),
      ]);

      // Decrypt all sensitive data
      if (passwordsRes.data) {
        const decrypted = await decryptArray(passwordsRes.data, encryptionKey, SENSITIVE_FIELDS.passwords as unknown as (keyof DbPassword)[]);
        setPasswords(decrypted);
      }
      if (notesRes.data) {
        const decrypted = await decryptArray(notesRes.data, encryptionKey, SENSITIVE_FIELDS.notes as unknown as (keyof DbNote)[]);
        setNotes(decrypted);
      }
      if (cardsRes.data) {
        const decrypted = await decryptArray(cardsRes.data, encryptionKey, SENSITIVE_FIELDS.cards as unknown as (keyof DbCard)[]);
        setCards(decrypted);
      }
      if (addressesRes.data) {
        const decrypted = await decryptArray(addressesRes.data, encryptionKey, SENSITIVE_FIELDS.addresses as unknown as (keyof DbAddress)[]);
        setAddresses(decrypted);
      }
      if (totpsRes.data) {
        const decrypted = await decryptArray(totpsRes.data, encryptionKey, SENSITIVE_FIELDS.totp_authenticators as unknown as (keyof DbTOTP)[]);
        setTotps(decrypted);
      }
      if (idCardsRes.data) {
        const decrypted = await decryptArray(idCardsRes.data, encryptionKey, SENSITIVE_FIELDS.id_cards as unknown as (keyof DbIDCard)[]);
        setIdCards(decrypted);
      }
      if (sshKeysRes.data) {
        const decrypted = await decryptArray(sshKeysRes.data, encryptionKey, SENSITIVE_FIELDS.ssh_keys as unknown as (keyof DbSSHKey)[]);
        setSshKeys(decrypted);
      }
      if (cryptoRes.data) {
        const decrypted = await decryptArray(cryptoRes.data, encryptionKey, SENSITIVE_FIELDS.crypto_wallets as unknown as (keyof DbCryptoWallet)[]);
        setCryptoWallets(decrypted);
      }
      if (bankRes.data) {
        const decrypted = await decryptArray(bankRes.data, encryptionKey, SENSITIVE_FIELDS.bank_accounts as unknown as (keyof DbBankAccount)[]);
        setBankAccounts(decrypted);
      }
      if (licensesRes.data) {
        const decrypted = await decryptArray(licensesRes.data, encryptionKey, SENSITIVE_FIELDS.software_licenses as unknown as (keyof DbSoftwareLicense)[]);
        setSoftwareLicenses(decrypted);
      }
      if (vaultsRes.data) setVaults(vaultsRes.data); // Vaults don't have sensitive data
    } catch (error) {
      console.error("Error fetching vault data:", error);
      toast.error("Failed to load vault data");
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, encryptionKey]);

  useEffect(() => {
    if (isAuthenticated && user?.id && isUnlocked) {
      fetchAllData();
    }
  }, [isAuthenticated, user?.id, isUnlocked, fetchAllData]);

  // CRUD operations for passwords (with encryption)
  const addPassword = async (data: Omit<DbPassword, "id" | "user_id" | "created_at" | "updated_at">) => {
    if (!user?.id || !encryptionKey) return;
    
    // Encrypt sensitive fields before saving
    const encrypted = await encryptObject(data, encryptionKey, SENSITIVE_FIELDS.passwords as unknown as (keyof typeof data)[]);
    
    const { data: newItem, error } = await supabase
      .from("passwords")
      .insert({ ...encrypted, user_id: user.id })
      .select()
      .single();
    if (error) {
      toast.error("Failed to add password");
      return;
    }
    
    // Decrypt for local state
    const decrypted = await decryptObject(newItem, encryptionKey, SENSITIVE_FIELDS.passwords as unknown as (keyof DbPassword)[]);
    setPasswords(prev => [decrypted, ...prev]);
    toast.success("Password added securely");
  };

  const updatePassword = async (id: string, data: Partial<DbPassword>) => {
    if (!encryptionKey) return;
    
    // Encrypt sensitive fields
    const encrypted = await encryptObject(data, encryptionKey, SENSITIVE_FIELDS.passwords as unknown as (keyof typeof data)[]);
    
    const { error } = await supabase.from("passwords").update(encrypted).eq("id", id);
    if (error) {
      toast.error("Failed to update password");
      return;
    }
    setPasswords(prev => prev.map(p => p.id === id ? { ...p, ...data } : p));
    toast.success("Password updated securely");
  };

  const deletePassword = async (id: string) => {
    const { error } = await supabase.from("passwords").delete().eq("id", id);
    if (error) {
      toast.error("Failed to delete password");
      return;
    }
    setPasswords(prev => prev.filter(p => p.id !== id));
    toast.success("Password deleted successfully");
  };

}