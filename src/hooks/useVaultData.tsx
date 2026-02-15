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

  // CRUD operations for notes (with encryption)
  const addNote = async (data: Omit<DbNote, "id" | "user_id" | "created_at" | "updated_at">) => {
    if (!user?.id || !encryptionKey) return;
    
    const encrypted = await encryptObject(data, encryptionKey, SENSITIVE_FIELDS.notes as unknown as (keyof typeof data)[]);
    
    const { data: newItem, error } = await supabase
      .from("notes")
      .insert({ ...encrypted, user_id: user.id })
      .select()
      .single();
    if (error) {
      toast.error("Failed to add note");
      return;
    }
    
    const decrypted = await decryptObject(newItem, encryptionKey, SENSITIVE_FIELDS.notes as unknown as (keyof DbNote)[]);
    setNotes(prev => [decrypted, ...prev]);
    toast.success("Note added securely");
  };

  const updateNote = async (id: string, data: Partial<DbNote>) => {
    if (!encryptionKey) return;
    
    const encrypted = await encryptObject(data, encryptionKey, SENSITIVE_FIELDS.notes as unknown as (keyof typeof data)[]);
    
    const { error } = await supabase.from("notes").update(encrypted).eq("id", id);
    if (error) {
      toast.error("Failed to update note");
      return;
    }
    setNotes(prev => prev.map(n => n.id === id ? { ...n, ...data } : n));
    toast.success("Note updated securely");
  };

  const deleteNote = async (id: string) => {
    const { error } = await supabase.from("notes").delete().eq("id", id);
    if (error) {
      toast.error("Failed to delete note");
      return;
    }
    setNotes(prev => prev.filter(n => n.id !== id));
    toast.success("Note deleted successfully");
  };

  // CRUD operations for cards (with encryption)
  const addCard = async (data: Omit<DbCard, "id" | "user_id" | "created_at" | "updated_at">) => {
    if (!user?.id || !encryptionKey) return;
    
    const encrypted = await encryptObject(data, encryptionKey, SENSITIVE_FIELDS.cards as unknown as (keyof typeof data)[]);
    
    const { data: newItem, error } = await supabase
      .from("cards")
      .insert({ ...encrypted, user_id: user.id })
      .select()
      .single();
    if (error) {
      toast.error("Failed to add card");
      return;
    }
    
    const decrypted = await decryptObject(newItem, encryptionKey, SENSITIVE_FIELDS.cards as unknown as (keyof DbCard)[]);
    setCards(prev => [decrypted, ...prev]);
    toast.success("Card added securely");
  };

  const updateCard = async (id: string, data: Partial<DbCard>) => {
    if (!encryptionKey) return;
    
    const encrypted = await encryptObject(data, encryptionKey, SENSITIVE_FIELDS.cards as unknown as (keyof typeof data)[]);
    
    const { error } = await supabase.from("cards").update(encrypted).eq("id", id);
    if (error) {
      toast.error("Failed to update card");
      return;
    }
    setCards(prev => prev.map(c => c.id === id ? { ...c, ...data } : c));
    toast.success("Card updated securely");
  };

  const deleteCard = async (id: string) => {
    const { error } = await supabase.from("cards").delete().eq("id", id);
    if (error) {
      toast.error("Failed to delete card");
      return;
    }
    setCards(prev => prev.filter(c => c.id !== id));
    toast.success("Card deleted successfully");
  };

  // CRUD operations for addresses (with encryption)
  const addAddress = async (data: Omit<DbAddress, "id" | "user_id" | "created_at" | "updated_at">) => {
    if (!user?.id || !encryptionKey) return;
    
    const encrypted = await encryptObject(data, encryptionKey, SENSITIVE_FIELDS.addresses as unknown as (keyof typeof data)[]);
    
    const { data: newItem, error } = await supabase
      .from("addresses")
      .insert({ ...encrypted, user_id: user.id })
      .select()
      .single();
    if (error) {
      toast.error("Failed to add address");
      return;
    }
    
    const decrypted = await decryptObject(newItem, encryptionKey, SENSITIVE_FIELDS.addresses as unknown as (keyof DbAddress)[]);
    setAddresses(prev => [decrypted, ...prev]);
    toast.success("Address added securely");
  };

  const updateAddress = async (id: string, data: Partial<DbAddress>) => {
    if (!encryptionKey) return;
    
    const encrypted = await encryptObject(data, encryptionKey, SENSITIVE_FIELDS.addresses as unknown as (keyof typeof data)[]);
    
    const { error } = await supabase.from("addresses").update(encrypted).eq("id", id);
    if (error) {
      toast.error("Failed to update address");
      return;
    }
    setAddresses(prev => prev.map(a => a.id === id ? { ...a, ...data } : a));
    toast.success("Address updated securely");
  };

  const deleteAddress = async (id: string) => {
    const { error } = await supabase.from("addresses").delete().eq("id", id);
    if (error) {
      toast.error("Failed to delete address");
      return;
    }
    setAddresses(prev => prev.filter(a => a.id !== id));
    toast.success("Address deleted successfully");
  };

  // CRUD operations for TOTPs (with encryption)
  const addTOTP = async (data: Omit<DbTOTP, "id" | "user_id" | "created_at" | "updated_at">) => {
    if (!user?.id || !encryptionKey) return;
    
    const encrypted = await encryptObject(data, encryptionKey, SENSITIVE_FIELDS.totp_authenticators as unknown as (keyof typeof data)[]);
    
    const { data: newItem, error } = await supabase
      .from("totp_authenticators")
      .insert({ ...encrypted, user_id: user.id })
      .select()
      .single();
    if (error) {
      toast.error("Failed to add authenticator");
      return;
    }
    
    const decrypted = await decryptObject(newItem, encryptionKey, SENSITIVE_FIELDS.totp_authenticators as unknown as (keyof DbTOTP)[]);
    setTotps(prev => [decrypted, ...prev]);
    toast.success("Authenticator added securely");
  };

  const updateTOTP = async (id: string, data: Partial<DbTOTP>) => {
    if (!encryptionKey) return;
    
    const encrypted = await encryptObject(data, encryptionKey, SENSITIVE_FIELDS.totp_authenticators as unknown as (keyof typeof data)[]);
    
    const { error } = await supabase.from("totp_authenticators").update(encrypted).eq("id", id);
    if (error) {
      toast.error("Failed to update authenticator");
      return;
    }
    setTotps(prev => prev.map(t => t.id === id ? { ...t, ...data } : t));
    toast.success("Authenticator updated securely");
  };

  const deleteTOTP = async (id: string) => {
    const { error } = await supabase.from("totp_authenticators").delete().eq("id", id);
    if (error) {
      toast.error("Failed to delete authenticator");
      return;
    }
    setTotps(prev => prev.filter(t => t.id !== id));
    toast.success("Authenticator deleted successfully");
  };

  // CRUD operations for ID cards (with encryption)
  const addIDCard = async (data: Omit<DbIDCard, "id" | "user_id" | "created_at" | "updated_at">) => {
    if (!user?.id || !encryptionKey) return;
    
    const encrypted = await encryptObject(data, encryptionKey, SENSITIVE_FIELDS.id_cards as unknown as (keyof typeof data)[]);
    
    const { data: newItem, error } = await supabase
      .from("id_cards")
      .insert({ ...encrypted, user_id: user.id })
      .select()
      .single();
    if (error) {
      toast.error("Failed to add ID card");
      return;
    }
    
    const decrypted = await decryptObject(newItem, encryptionKey, SENSITIVE_FIELDS.id_cards as unknown as (keyof DbIDCard)[]);
    setIdCards(prev => [decrypted, ...prev]);
    toast.success("ID card added securely");
  };

  const updateIDCard = async (id: string, data: Partial<DbIDCard>) => {
    if (!encryptionKey) return;
    
    const encrypted = await encryptObject(data, encryptionKey, SENSITIVE_FIELDS.id_cards as unknown as (keyof typeof data)[]);
    
    const { error } = await supabase.from("id_cards").update(encrypted).eq("id", id);
    if (error) {
      toast.error("Failed to update ID card");
      return;
    }
    setIdCards(prev => prev.map(c => c.id === id ? { ...c, ...data } : c));
    toast.success("ID card updated securely");
  };

  const deleteIDCard = async (id: string) => {
    const { error } = await supabase.from("id_cards").delete().eq("id", id);
    if (error) {
      toast.error("Failed to delete ID card");
      return;
    }
    setIdCards(prev => prev.filter(c => c.id !== id));
    toast.success("ID card deleted successfully");
  };

  // CRUD operations for SSH keys (with encryption)
  const addSSHKey = async (data: Omit<DbSSHKey, "id" | "user_id" | "created_at" | "updated_at">) => {
    if (!user?.id || !encryptionKey) return;
    
    const encrypted = await encryptObject(data, encryptionKey, SENSITIVE_FIELDS.ssh_keys as unknown as (keyof typeof data)[]);
    
    const { data: newItem, error } = await supabase
      .from("ssh_keys")
      .insert({ ...encrypted, user_id: user.id })
      .select()
      .single();
    if (error) {
      toast.error("Failed to add SSH key");
      return;
    }
    
    const decrypted = await decryptObject(newItem, encryptionKey, SENSITIVE_FIELDS.ssh_keys as unknown as (keyof DbSSHKey)[]);
    setSshKeys(prev => [decrypted, ...prev]);
    toast.success("SSH key added securely");
  };

  const updateSSHKey = async (id: string, data: Partial<DbSSHKey>) => {
    if (!encryptionKey) return;
    
    const encrypted = await encryptObject(data, encryptionKey, SENSITIVE_FIELDS.ssh_keys as unknown as (keyof typeof data)[]);
    
    const { error } = await supabase.from("ssh_keys").update(encrypted).eq("id", id);
    if (error) {
      toast.error("Failed to update SSH key");
      return;
    }
    setSshKeys(prev => prev.map(k => k.id === id ? { ...k, ...data } : k));
    toast.success("SSH key updated securely");
  };

  const deleteSSHKey = async (id: string) => {
    const { error } = await supabase.from("ssh_keys").delete().eq("id", id);
    if (error) {
      toast.error("Failed to delete SSH key");
      return;
    }
    setSshKeys(prev => prev.filter(k => k.id !== id));
    toast.success("SSH key deleted successfully");
  };

  // CRUD operations for crypto wallets (with encryption)
  const addCryptoWallet = async (data: Omit<DbCryptoWallet, "id" | "user_id" | "created_at" | "updated_at">) => {
    if (!user?.id || !encryptionKey) return;
    
    const encrypted = await encryptObject(data, encryptionKey, SENSITIVE_FIELDS.crypto_wallets as unknown as (keyof typeof data)[]);
    
    const { data: newItem, error } = await supabase
      .from("crypto_wallets")
      .insert({ ...encrypted, user_id: user.id })
      .select()
      .single();
    if (error) {
      toast.error("Failed to add crypto wallet");
      return;
    }
    
    const decrypted = await decryptObject(newItem, encryptionKey, SENSITIVE_FIELDS.crypto_wallets as unknown as (keyof DbCryptoWallet)[]);
    setCryptoWallets(prev => [decrypted, ...prev]);
    toast.success("Crypto wallet added securely");
  };

  const updateCryptoWallet = async (id: string, data: Partial<DbCryptoWallet>) => {
    if (!encryptionKey) return;
    
    const encrypted = await encryptObject(data, encryptionKey, SENSITIVE_FIELDS.crypto_wallets as unknown as (keyof typeof data)[]);
    
    const { error } = await supabase.from("crypto_wallets").update(encrypted).eq("id", id);
    if (error) {
      toast.error("Failed to update crypto wallet");
      return;
    }
    setCryptoWallets(prev => prev.map(w => w.id === id ? { ...w, ...data } : w));
    toast.success("Crypto wallet updated securely");
  };

  const deleteCryptoWallet = async (id: string) => {
    const { error } = await supabase.from("crypto_wallets").delete().eq("id", id);
    if (error) {
      toast.error("Failed to delete crypto wallet");
      return;
    }
    setCryptoWallets(prev => prev.filter(w => w.id !== id));
    toast.success("Crypto wallet deleted successfully");
  };

  // CRUD operations for bank accounts (with encryption)
  const addBankAccount = async (data: Omit<DbBankAccount, "id" | "user_id" | "created_at" | "updated_at">) => {
    if (!user?.id || !encryptionKey) return;
    
    const encrypted = await encryptObject(data, encryptionKey, SENSITIVE_FIELDS.bank_accounts as unknown as (keyof typeof data)[]);
    
    const { data: newItem, error } = await supabase
      .from("bank_accounts")
      .insert({ ...encrypted, user_id: user.id })
      .select()
      .single();
    if (error) {
      toast.error("Failed to add bank account");
      return;
    }
    
    const decrypted = await decryptObject(newItem, encryptionKey, SENSITIVE_FIELDS.bank_accounts as unknown as (keyof DbBankAccount)[]);
    setBankAccounts(prev => [decrypted, ...prev]);
    toast.success("Bank account added securely");
  };

  const updateBankAccount = async (id: string, data: Partial<DbBankAccount>) => {
    if (!encryptionKey) return;
    
    const encrypted = await encryptObject(data, encryptionKey, SENSITIVE_FIELDS.bank_accounts as unknown as (keyof typeof data)[]);
    
    const { error } = await supabase.from("bank_accounts").update(encrypted).eq("id", id);
    if (error) {
      toast.error("Failed to update bank account");
      return;
    }
    setBankAccounts(prev => prev.map(a => a.id === id ? { ...a, ...data } : a));
    toast.success("Bank account updated securely");
  };

  const deleteBankAccount = async (id: string) => {
    const { error } = await supabase.from("bank_accounts").delete().eq("id", id);
    if (error) {
      toast.error("Failed to delete bank account");
      return;
    }
    setBankAccounts(prev => prev.filter(a => a.id !== id));
    toast.success("Bank account deleted successfully");
  };

  // CRUD operations for software licenses (with encryption)
  const addSoftwareLicense = async (data: Omit<DbSoftwareLicense, "id" | "user_id" | "created_at" | "updated_at">) => {
    if (!user?.id || !encryptionKey) return;
    
    const encrypted = await encryptObject(data, encryptionKey, SENSITIVE_FIELDS.software_licenses as unknown as (keyof typeof data)[]);
    
    const { data: newItem, error } = await supabase
      .from("software_licenses")
      .insert({ ...encrypted, user_id: user.id })
      .select()
      .single();
    if (error) {
      toast.error("Failed to add software license");
      return;
    }
    
    const decrypted = await decryptObject(newItem, encryptionKey, SENSITIVE_FIELDS.software_licenses as unknown as (keyof DbSoftwareLicense)[]);
    setSoftwareLicenses(prev => [decrypted, ...prev]);
    toast.success("Software license added securely");
  };

  const updateSoftwareLicense = async (id: string, data: Partial<DbSoftwareLicense>) => {
    if (!encryptionKey) return;
    
    const encrypted = await encryptObject(data, encryptionKey, SENSITIVE_FIELDS.software_licenses as unknown as (keyof typeof data)[]);
    
    const { error } = await supabase.from("software_licenses").update(encrypted).eq("id", id);
    if (error) {
      toast.error("Failed to update software license");
      return;
    }
    setSoftwareLicenses(prev => prev.map(l => l.id === id ? { ...l, ...data } : l));
    toast.success("Software license updated securely");
  };

  const deleteSoftwareLicense = async (id: string) => {
    const { error } = await supabase.from("software_licenses").delete().eq("id", id);
    if (error) {
      toast.error("Failed to delete software license");
      return;
    }
    setSoftwareLicenses(prev => prev.filter(l => l.id !== id));
    toast.success("Software license deleted successfully");
  };

  // CRUD operations for vaults (no encryption needed - just metadata)
  const addVault = async (data: Omit<DbVault, "id" | "user_id" | "created_at" | "updated_at">) => {
    if (!user?.id) return;
    const { data: newItem, error } = await supabase
      .from("vaults")
      .insert({ ...data, user_id: user.id })
      .select()
      .single();
    if (error) {
      toast.error("Failed to add vault");
      return;
    }
    setVaults(prev => [newItem, ...prev]);
    toast.success("Vault created successfully");
    return newItem;
  };

  const updateVault = async (id: string, data: Partial<DbVault>) => {
    const { error } = await supabase.from("vaults").update(data).eq("id", id);
    if (error) {
      toast.error("Failed to update vault");
      return;
    }
    setVaults(prev => prev.map(v => v.id === id ? { ...v, ...data } : v));
    toast.success("Vault updated successfully");
  };

  const deleteVault = async (id: string) => {
    const { error } = await supabase.from("vaults").delete().eq("id", id);
    if (error) {
      toast.error("Failed to delete vault");
      return;
    }
    setVaults(prev => prev.filter(v => v.id !== id));
    toast.success("Vault deleted successfully");
  };

  return {
    isLoading,
    refetch: fetchAllData,
    
    // Data
    passwords,
    notes,
    cards,
    addresses,
    totps,
    idCards,
    sshKeys,
    cryptoWallets,
    bankAccounts,
    softwareLicenses,
    vaults,
    
    // Password operations
    addPassword,
    updatePassword,
    deletePassword,
    
    // Note operations
    addNote,
    updateNote,
    deleteNote,
    
    // Card operations
    addCard,
    updateCard,
    deleteCard,
    
    // Address operations
    addAddress,
    updateAddress,
    deleteAddress,
    
    // TOTP operations
    addTOTP,
    updateTOTP,
    deleteTOTP,
    
    // ID Card operations
    addIDCard,
    updateIDCard,
    deleteIDCard,
    
    // SSH Key operations
    addSSHKey,
    updateSSHKey,
    deleteSSHKey,
    
    // Crypto Wallet operations
    addCryptoWallet,
    updateCryptoWallet,
    deleteCryptoWallet,
    
    // Bank Account operations
    addBankAccount,
    updateBankAccount,
    deleteBankAccount,
    
    // Software License operations
    addSoftwareLicense,
    updateSoftwareLicense,
    deleteSoftwareLicense,
    
    // Vault operations
    addVault,
    updateVault,
    deleteVault,
  };
}
