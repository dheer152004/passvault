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
import { useIsMobile } from "@/hooks/use-mobile";
import { useSwipeGesture } from "@/hooks/useSwipeGesture";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { DashboardSidebar, SectionType } from "@/components/dashboard/DashboardSidebar";
import { MobileSectionIndicator } from "@/components/dashboard/MobileSectionIndicator";
import { PullToRefresh } from "@/components/dashboard/PullToRefresh";
import { PasswordsSection, Password, Category, defaultCategories } from "@/components/dashboard/PasswordsSection";

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

export default function Dashboard() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const vaultData = useVaultData();
  const isMobile = useIsMobile();

  // Auto logout after 30 seconds of inactivity
  useAutoLogout({
    timeoutSeconds: 30,
    onLogout: () => navigate("/login"),
  });
  
  const [activeSection, setActiveSection] = useState<SectionType>("passwords");
  const [activeVaultId, setActiveVaultId] = useState<string | undefined>(undefined);
  // Shared items are now managed in ShareSection via useSharing hook
  const [customCategories, setCustomCategories] = useState<Category[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Section order and labels for swipe navigation
  const sectionOrder: SectionType[] = [
    "passwords", "notes", "cards", "idcards", "addresses", 
    "totp", "sshkeys", "crypto", "bankinfo", "software", 
    "favorites", "sharing", "tools"
  ];

  const sectionLabels: Record<SectionType, string> = {
    passwords: "Passwords",
    notes: "Notes",
    cards: "Cards",
    idcards: "ID Cards",
    addresses: "Addresses",
    totp: "Auth",
    sshkeys: "SSH",
    crypto: "Crypto",
    bankinfo: "Bank",
    software: "Software",
    favorites: "Favorites",
    sharing: "Sharing",
    tools: "Tools",
  };

  const swipeHandlers = useSwipeGesture({
    onSwipeLeft: isMobile ? () => {
      const currentIndex = sectionOrder.indexOf(activeSection);
      if (currentIndex < sectionOrder.length - 1) {
        setActiveSection(sectionOrder[currentIndex + 1]);
      }
    } : undefined,
    onSwipeRight: isMobile ? () => {
      const currentIndex = sectionOrder.indexOf(activeSection);
      if (currentIndex > 0) {
        setActiveSection(sectionOrder[currentIndex - 1]);
      }
    } : undefined,
    minSwipeDistance: 75,
  });

  // Local state that syncs with database
  const [passwords, setPasswords] = useState<Password[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [totps, setTotps] = useState<TOTP[]>([]);
  const [idCards, setIdCards] = useState<IDCard[]>([]);
  const [sshKeys, setSshKeys] = useState<SSHKey[]>([]);
  const [cryptoWallets, setCryptoWallets] = useState<CryptoWallet[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [softwareLicenses, setSoftwareLicenses] = useState<SoftwareLicense[]>([]);

  // Sync from database when data loads
  useEffect(() => {
    if (!vaultData.isLoading) {
      setPasswords(vaultData.passwords.map(transformPassword));
      setNotes(vaultData.notes.map(transformNote));
      setCards(vaultData.cards.map(transformCard));
      setAddresses(vaultData.addresses.map(transformAddress));
      setTotps(vaultData.totps.map(transformTOTP));
      setIdCards(vaultData.idCards.map(transformIDCard));
      setSshKeys(vaultData.sshKeys.map(transformSSHKey));
      setCryptoWallets(vaultData.cryptoWallets.map(transformCryptoWallet));
      setBankAccounts(vaultData.bankAccounts.map(transformBankAccount));
      setSoftwareLicenses(vaultData.softwareLicenses.map(transformSoftwareLicense));
    }
  }, [vaultData.isLoading, vaultData.passwords, vaultData.notes, vaultData.cards, 
      vaultData.addresses, vaultData.totps, vaultData.idCards, vaultData.sshKeys,
      vaultData.cryptoWallets, vaultData.bankAccounts, vaultData.softwareLicenses]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  // Load custom categories from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("digilock_custom_categories");
    if (stored) {
      const parsed = JSON.parse(stored);
      setCustomCategories(parsed.map((c: { value: string; label: string }) => ({
        ...c,
        icon: Tag,
        isCustom: true,
      })));
    }
  }, []);

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate("/");
  };

  // Wrapper setters that persist to database
  const handleSetPasswords: React.Dispatch<React.SetStateAction<Password[]>> = (updater) => {
    setPasswords(prev => {
      const newPasswords = typeof updater === 'function' ? updater(prev) : updater;
      
      // Find added items
      const added = newPasswords.filter(n => !prev.find(p => p.id === n.id));
      added.forEach(p => {
        vaultData.addPassword({
          name: p.name,
          username: p.username,
          password: p.password,
          url: p.url,
          category: p.category,
          notes: null,
          is_favorite: p.isFavorite || false,
          vault_id: p.vaultId || null,
        });
      });

      // Find deleted items
      const deleted = prev.filter(p => !newPasswords.find(n => n.id === p.id));
      deleted.forEach(p => vaultData.deletePassword(p.id));

      // Find updated items
      newPasswords.forEach(n => {
        const old = prev.find(p => p.id === n.id);
        if (old && JSON.stringify(old) !== JSON.stringify(n)) {
          vaultData.updatePassword(n.id, {
            name: n.name,
            username: n.username,
            password: n.password,
            url: n.url,
            category: n.category,
            is_favorite: n.isFavorite || false,
            vault_id: n.vaultId || null,
          });
        }
      });

      return newPasswords;
    });
  };

  const handleSetNotes: React.Dispatch<React.SetStateAction<Note[]>> = (updater) => {
    setNotes(prev => {
      const newNotes = typeof updater === 'function' ? updater(prev) : updater;
      
      const added = newNotes.filter(n => !prev.find(p => p.id === n.id));
      added.forEach(n => {
        vaultData.addNote({
          title: n.title,
          content: n.content,
          is_favorite: n.isFavorite || false,
          vault_id: n.vaultId || null,
        });
      });

      const deleted = prev.filter(p => !newNotes.find(n => n.id === p.id));
      deleted.forEach(n => vaultData.deleteNote(n.id));

      newNotes.forEach(n => {
        const old = prev.find(p => p.id === n.id);
        if (old && JSON.stringify(old) !== JSON.stringify(n)) {
          vaultData.updateNote(n.id, {
            title: n.title,
            content: n.content,
            is_favorite: n.isFavorite || false,
            vault_id: n.vaultId || null,
          });
        }
      });

      return newNotes;
    });
  };

  const handleSetCards: React.Dispatch<React.SetStateAction<Card[]>> = (updater) => {
    setCards(prev => {
      const newCards = typeof updater === 'function' ? updater(prev) : updater;
      
      const added = newCards.filter(n => !prev.find(p => p.id === n.id));
      added.forEach(c => {
        vaultData.addCard({
          name: c.name,
          card_type: c.cardType,
          card_number: c.cardNumber,
          cardholder_name: c.cardholderName,
          expiry_date: c.expiryDate,
          cvv: c.cvv,
          pin: null,
          billing_address: null,
          notes: null,
          is_favorite: c.isFavorite || false,
          vault_id: c.vaultId || null,
        });
      });

      const deleted = prev.filter(p => !newCards.find(n => n.id === p.id));
      deleted.forEach(c => vaultData.deleteCard(c.id));

      newCards.forEach(n => {
        const old = prev.find(p => p.id === n.id);
        if (old && JSON.stringify(old) !== JSON.stringify(n)) {
          vaultData.updateCard(n.id, {
            name: n.name,
            card_type: n.cardType,
            card_number: n.cardNumber,
            cardholder_name: n.cardholderName,
            expiry_date: n.expiryDate,
            cvv: n.cvv,
            is_favorite: n.isFavorite || false,
            vault_id: n.vaultId || null,
          });
        }
      });

      return newCards;
    });
  };

  const handleSetAddresses: React.Dispatch<React.SetStateAction<Address[]>> = (updater) => {
    setAddresses(prev => {
      const newAddresses = typeof updater === 'function' ? updater(prev) : updater;
      
      const added = newAddresses.filter(n => !prev.find(p => p.id === n.id));
      added.forEach(a => {
        vaultData.addAddress({
          name: a.name,
          full_name: a.fullName,
          company: null,
          street_address: a.street,
          city: a.city,
          state: a.state,
          postal_code: a.zipCode,
          country: a.country,
          phone: a.phone,
          email: null,
          notes: null,
          is_favorite: a.isFavorite || false,
          vault_id: a.vaultId || null,
        });
      });

      const deleted = prev.filter(p => !newAddresses.find(n => n.id === p.id));
      deleted.forEach(a => vaultData.deleteAddress(a.id));

      newAddresses.forEach(n => {
        const old = prev.find(p => p.id === n.id);
        if (old && JSON.stringify(old) !== JSON.stringify(n)) {
          vaultData.updateAddress(n.id, {
            name: n.name,
            full_name: n.fullName,
            street_address: n.street,
            city: n.city,
            state: n.state,
            postal_code: n.zipCode,
            country: n.country,
            phone: n.phone,
            is_favorite: n.isFavorite || false,
            vault_id: n.vaultId || null,
          });
        }
      });

      return newAddresses;
    });
  };

  const handleSetTotps: React.Dispatch<React.SetStateAction<TOTP[]>> = (updater) => {
    setTotps(prev => {
      const newTotps = typeof updater === 'function' ? updater(prev) : updater;
      
      const added = newTotps.filter(n => !prev.find(p => p.id === n.id));
      added.forEach(t => {
        vaultData.addTOTP({
          name: t.name,
          issuer: t.issuer,
          secret: t.secret,
          is_favorite: t.isFavorite || false,
          vault_id: t.vaultId || null,
        });
      });

      const deleted = prev.filter(p => !newTotps.find(n => n.id === p.id));
      deleted.forEach(t => vaultData.deleteTOTP(t.id));

      newTotps.forEach(n => {
        const old = prev.find(p => p.id === n.id);
        if (old && JSON.stringify(old) !== JSON.stringify(n)) {
          vaultData.updateTOTP(n.id, {
            name: n.name,
            issuer: n.issuer,
            secret: n.secret,
            is_favorite: n.isFavorite || false,
            vault_id: n.vaultId || null,
          });
        }
      });

      return newTotps;
    });
  };

  const handleSetIdCards: React.Dispatch<React.SetStateAction<IDCard[]>> = (updater) => {
    setIdCards(prev => {
      const newIdCards = typeof updater === 'function' ? updater(prev) : updater;
      
      const added = newIdCards.filter(n => !prev.find(p => p.id === n.id));
      added.forEach(c => {
        vaultData.addIDCard({
          name: c.name,
          id_type: c.idType,
          id_number: c.idNumber,
          full_name: c.fullName,
          date_of_birth: c.dateOfBirth,
          issue_date: c.issueDate,
          expiry_date: c.expiryDate,
          issuing_authority: c.issuingAuthority,
          country: null,
          notes: c.notes,
          is_favorite: c.isFavorite || false,
          vault_id: c.vaultId || null,
        });
      });

      const deleted = prev.filter(p => !newIdCards.find(n => n.id === p.id));
      deleted.forEach(c => vaultData.deleteIDCard(c.id));

      newIdCards.forEach(n => {
        const old = prev.find(p => p.id === n.id);
        if (old && JSON.stringify(old) !== JSON.stringify(n)) {
          vaultData.updateIDCard(n.id, {
            name: n.name,
            id_type: n.idType,
            id_number: n.idNumber,
            full_name: n.fullName,
            date_of_birth: n.dateOfBirth,
            issue_date: n.issueDate,
            expiry_date: n.expiryDate,
            issuing_authority: n.issuingAuthority,
            notes: n.notes,
            is_favorite: n.isFavorite || false,
            vault_id: n.vaultId || null,
          });
        }
      });

      return newIdCards;
    });
  };

  const handleSetSshKeys: React.Dispatch<React.SetStateAction<SSHKey[]>> = (updater) => {
    setSshKeys(prev => {
      const newSshKeys = typeof updater === 'function' ? updater(prev) : updater;
      
      const added = newSshKeys.filter(n => !prev.find(p => p.id === n.id));
      added.forEach(k => {
        vaultData.addSSHKey({
          name: k.name,
          key_type: k.keyType,
          public_key: k.publicKey,
          private_key: k.privateKey,
          passphrase: k.passphrase,
          notes: k.notes,
          is_favorite: k.isFavorite || false,
          vault_id: k.vaultId || null,
        });
      });

      const deleted = prev.filter(p => !newSshKeys.find(n => n.id === p.id));
      deleted.forEach(k => vaultData.deleteSSHKey(k.id));

      newSshKeys.forEach(n => {
        const old = prev.find(p => p.id === n.id);
        if (old && JSON.stringify(old) !== JSON.stringify(n)) {
          vaultData.updateSSHKey(n.id, {
            name: n.name,
            key_type: n.keyType,
            public_key: n.publicKey,
            private_key: n.privateKey,
            passphrase: n.passphrase,
            notes: n.notes,
            is_favorite: n.isFavorite || false,
            vault_id: n.vaultId || null,
          });
        }
      });

      return newSshKeys;
    });
  };

  const handleSetCryptoWallets: React.Dispatch<React.SetStateAction<CryptoWallet[]>> = (updater) => {
    setCryptoWallets(prev => {
      const newWallets = typeof updater === 'function' ? updater(prev) : updater;
      
      const added = newWallets.filter(n => !prev.find(p => p.id === n.id));
      added.forEach(w => {
        vaultData.addCryptoWallet({
          name: w.name,
          wallet_type: w.walletType,
          wallet_address: w.walletAddress,
          private_key: w.privateKey,
          seed_phrase: w.seedPhrase,
          notes: w.notes,
          is_favorite: w.isFavorite || false,
          vault_id: w.vaultId || null,
        });
      });

      const deleted = prev.filter(p => !newWallets.find(n => n.id === p.id));
      deleted.forEach(w => vaultData.deleteCryptoWallet(w.id));

      newWallets.forEach(n => {
        const old = prev.find(p => p.id === n.id);
        if (old && JSON.stringify(old) !== JSON.stringify(n)) {
          vaultData.updateCryptoWallet(n.id, {
            name: n.name,
            wallet_type: n.walletType,
            wallet_address: n.walletAddress,
            private_key: n.privateKey,
            seed_phrase: n.seedPhrase,
            notes: n.notes,
            is_favorite: n.isFavorite || false,
            vault_id: n.vaultId || null,
          });
        }
      });

      return newWallets;
    });
  };



  // Filter helper: match vault or default vault for items without vaultId
  const matchesVault = (itemVaultId?: string) => {
    if (!activeVaultId) {
      return true;
    }
    return itemVaultId === activeVaultId;
  };

  // Filtered items by active vault
  const vaultPasswords = passwords.filter(p => matchesVault(p.vaultId));
  const vaultNotes = notes.filter(n => matchesVault(n.vaultId));
  const vaultCards = cards.filter(c => matchesVault(c.vaultId));
  const vaultAddresses = addresses.filter(a => matchesVault(a.vaultId));
  const vaultTotps = totps.filter(t => matchesVault(t.vaultId));
  const vaultIdCards = idCards.filter(i => matchesVault(i.vaultId));
  const vaultSshKeys = sshKeys.filter(s => matchesVault(s.vaultId));
  const vaultCryptoWallets = cryptoWallets.filter(c => matchesVault(c.vaultId));
  const vaultBankAccounts = bankAccounts.filter(b => matchesVault(b.vaultId));
  const vaultSoftwareLicenses = softwareLicenses.filter(s => matchesVault(s.vaultId));

  // Calculate counts for sidebar based on active vault
  const counts = {
    passwords: vaultPasswords.length,
    notes: vaultNotes.length,
    cards: vaultCards.length,
    addresses: vaultAddresses.length,
    totp: vaultTotps.length,
    idcards: vaultIdCards.length,
    sshkeys: vaultSshKeys.length,
    crypto: vaultCryptoWallets.length,
    bankinfo: vaultBankAccounts.length,
    software: vaultSoftwareLicenses.length,
    favorites: 
      vaultPasswords.filter(p => p.isFavorite).length +
      vaultNotes.filter(n => n.isFavorite).length +
      vaultCards.filter(c => c.isFavorite).length +
      vaultAddresses.filter(a => a.isFavorite).length +
      vaultTotps.filter(t => t.isFavorite).length +
      vaultIdCards.filter(i => i.isFavorite).length +
      vaultSshKeys.filter(s => s.isFavorite).length +
      vaultCryptoWallets.filter(c => c.isFavorite).length +
      vaultBankAccounts.filter(b => b.isFavorite).length +
      vaultSoftwareLicenses.filter(s => s.isFavorite).length,
    sharing: 0, // Managed by useSharing hook in ShareSection
  };

  if (!isAuthenticated) {
    return null;
  }

  if (vaultData.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading your vault...</p>
        </div>
      </div>
    );
  }

  const renderSection = () => {
    const showFavoritesOnly = activeSection === "favorites";
    
    if (showFavoritesOnly) {
      const hasFavoritePasswords = vaultPasswords.some(p => p.isFavorite);
      const hasFavoriteNotes = vaultNotes.some(n => n.isFavorite);
      const hasFavoriteCards = vaultCards.some(c => c.isFavorite);
      const hasFavoriteAddresses = vaultAddresses.some(a => a.isFavorite);
      const hasFavoriteTotps = vaultTotps.some(t => t.isFavorite);
      const hasFavoriteIdCards = vaultIdCards.some(i => i.isFavorite);
      const hasFavoriteSshKeys = vaultSshKeys.some(s => s.isFavorite);
      const hasFavoriteCryptoWallets = vaultCryptoWallets.some(c => c.isFavorite);
      const hasFavoriteBankAccounts = vaultBankAccounts.some(b => b.isFavorite);
      const hasFavoriteLicenses = vaultSoftwareLicenses.some(s => s.isFavorite);
}
