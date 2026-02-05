import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, User, Tag, Loader2, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useVaultData } from "@/hooks/useVaultData";
import { useAutoLogout } from "@/hooks/useAutoLogout";
import { VaultsContextProvider } from "@/hooks/useVaultsContext";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

// Transform database types to component types
const transformPassword = (p: any): Password => ({
  id: p.id,
  name: p.name,
  username: p.username || "",
  password: p.password,
  url: p.url || "",
  category: p.category || "other",
  createdAt: p.created_at?.split("T")[0] || "",
  isFavorite: p.is_favorite || false,
  vaultId: p.vault_id || undefined,
});

const transformNote = (n: any): Note => ({
  id: n.id,
  title: n.title,
  content: n.content || "",
  createdAt: n.created_at?.split("T")[0] || "",
  isFavorite: n.is_favorite || false,
  vaultId: n.vault_id || undefined,
});

const transformCard = (c: any): Card => ({
  id: c.id,
  name: c.name,
  cardNumber: c.card_number,
  expiryDate: c.expiry_date || "",
  cvv: c.cvv || "",
  cardholderName: c.cardholder_name || "",
  cardType: c.card_type || "visa",
  createdAt: c.created_at?.split("T")[0] || "",
  isFavorite: c.is_favorite || false,
  vaultId: c.vault_id || undefined,
});

const transformAddress = (a: any): Address => ({
  id: a.id,
  name: a.name,
  fullName: a.full_name || "",
  street: a.street_address || "",
  city: a.city || "",
  state: a.state || "",
  zipCode: a.postal_code || "",
  country: a.country || "",
  phone: a.phone || "",
  createdAt: a.created_at?.split("T")[0] || "",
  isFavorite: a.is_favorite || false,
  vaultId: a.vault_id || undefined,
});

const transformTOTP = (t: any): TOTP => ({
  id: t.id,
  name: t.name,
  issuer: t.issuer || "",
  secret: t.secret,
  createdAt: t.created_at?.split("T")[0] || "",
  isFavorite: t.is_favorite || false,
  vaultId: t.vault_id || undefined,
});

const transformIDCard = (c: any): IDCard => ({
  id: c.id,
  name: c.name,
  idType: c.id_type || "other",
  idNumber: c.id_number,
  fullName: c.full_name || "",
  dateOfBirth: c.date_of_birth || "",
  issueDate: c.issue_date || "",
  expiryDate: c.expiry_date || "",
  issuingAuthority: c.issuing_authority || "",
  notes: c.notes || "",
  createdAt: c.created_at?.split("T")[0] || "",
  isFavorite: c.is_favorite || false,
  vaultId: c.vault_id || undefined,
});

const transformSSHKey = (k: any): SSHKey => ({
  id: k.id,
  name: k.name,
  keyType: k.key_type || "rsa",
  publicKey: k.public_key || "",
  privateKey: k.private_key,
  passphrase: k.passphrase || "",
  notes: k.notes || "",
  createdAt: k.created_at?.split("T")[0] || "",
  isFavorite: k.is_favorite || false,
  vaultId: k.vault_id || undefined,
});

const transformCryptoWallet = (w: any): CryptoWallet => ({
  id: w.id,
  name: w.name,
  walletType: w.wallet_type || "bitcoin",
  walletAddress: w.wallet_address || "",
  privateKey: w.private_key || "",
  seedPhrase: w.seed_phrase || "",
  notes: w.notes || "",
  createdAt: w.created_at?.split("T")[0] || "",
  isFavorite: w.is_favorite || false,
  vaultId: w.vault_id || undefined,
});

const transformBankAccount = (a: any): BankAccount => ({
  id: a.id,
  name: a.name,
  bankName: a.bank_name || "",
  accountType: a.account_type || "checking",
  accountNumber: a.account_number || "",
  routingNumber: a.routing_number || "",
  ibanNumber: a.iban || "",
  swiftCode: a.swift_bic || "",
  branchName: a.branch_name || "",
  accountHolderName: a.branch_address || "",
  notes: a.notes || "",
  createdAt: a.created_at?.split("T")[0] || "",
  isFavorite: a.is_favorite || false,
  vaultId: a.vault_id || undefined,
});

const transformSoftwareLicense = (l: any): SoftwareLicense => ({
  id: l.id,
  name: l.name,
  software: l.software_type || "other",
  licenseKey: l.license_key,
  email: l.email || "",
  password: l.password || "",
  purchaseDate: l.purchase_date || "",
  expiryDate: l.expiry_date || "",
  website: l.website || "",
  notes: l.notes || "",
  createdAt: l.created_at?.split("T")[0] || "",
  isFavorite: l.is_favorite || false,
  vaultId: l.vault_id || undefined,
});

