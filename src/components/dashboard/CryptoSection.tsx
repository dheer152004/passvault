import { useState } from "react";
import { Bitcoin, Plus, Search, Copy, Trash2, Edit2, Heart, Eye, EyeOff, Wallet } from "lucide-react";
import { VaultBadge } from "./VaultBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { VaultSelect } from "./VaultSelect";


export interface CryptoWallet {
  id: string;
  name: string;
  walletType: "bitcoin" | "ethereum" | "solana" | "cardano" | "polygon" | "other";
  walletAddress: string;
  privateKey?: string;
  seedPhrase?: string;
  notes?: string;
  createdAt: string;
  isFavorite: boolean;
  vaultId?: string;
}

interface CryptoSectionProps {
  cryptoWallets: CryptoWallet[];
  setCryptoWallets: React.Dispatch<React.SetStateAction<CryptoWallet[]>>;
  showFavoritesOnly?: boolean;
  activeVaultId?: string;
}

const walletTypes = [
  { value: "bitcoin", label: "Bitcoin (BTC)", color: "bg-orange-500" },
  { value: "ethereum", label: "Ethereum (ETH)", color: "bg-blue-500" },
  { value: "solana", label: "Solana (SOL)", color: "bg-purple-500" },
  { value: "cardano", label: "Cardano (ADA)", color: "bg-blue-600" },
  { value: "polygon", label: "Polygon (MATIC)", color: "bg-violet-500" },
  { value: "other", label: "Other", color: "bg-gray-500" },
];

export function CryptoSection({ cryptoWallets, setCryptoWallets, showFavoritesOnly = false, activeVaultId }: CryptoSectionProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingWallet, setEditingWallet] = useState<CryptoWallet | null>(null);
  const [visibleWallets, setVisibleWallets] = useState<Set<string>>(new Set());
  const [formData, setFormData] = useState({
    name: "",
    walletType: "bitcoin" as CryptoWallet["walletType"],
    walletAddress: "",
    privateKey: "",
    seedPhrase: "",
    notes: "",
    vaultId: activeVaultId,
  });

  const resetForm = () => {
    setFormData({
      name: "",
      walletType: "bitcoin",
      walletAddress: "",
      privateKey: "",
      seedPhrase: "",
      notes: "",
      vaultId: activeVaultId,
    });
  };

  const handleAdd = () => {
    if (!formData.name || !formData.walletAddress) {
      toast.error("Please fill in required fields");
      return;
    }

    const newWallet: CryptoWallet = {
      id: Date.now().toString(),
      name: formData.name,
      walletType: formData.walletType,
      walletAddress: formData.walletAddress,
      privateKey: formData.privateKey,
      seedPhrase: formData.seedPhrase,
      notes: formData.notes,
      vaultId: formData.vaultId || activeVaultId,
      createdAt: new Date().toISOString().split("T")[0],
      isFavorite: false,
    };

    setCryptoWallets([...cryptoWallets, newWallet]);
    resetForm();
    setIsAddDialogOpen(false);
    toast.success("Crypto wallet added successfully");
  };

  const handleEdit = () => {
    if (!editingWallet || !formData.name) return;

    setCryptoWallets(cryptoWallets.map(w => 
      w.id === editingWallet.id ? { ...w, ...formData, vaultId: formData.vaultId } : w
    ));
    setEditingWallet(null);
    resetForm();
    toast.success("Wallet updated successfully");
  };

  const handleDelete = (id: string) => {
    setCryptoWallets(cryptoWallets.filter(w => w.id !== id));
    toast.success("Wallet deleted");
  };

  const toggleFavorite = (id: string) => {
    setCryptoWallets(cryptoWallets.map(w => 
      w.id === id ? { ...w, isFavorite: !w.isFavorite } : w
    ));
  };

  const toggleVisibility = (id: string) => {
    setVisibleWallets(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const filteredWallets = cryptoWallets
    .filter(w => showFavoritesOnly ? w.isFavorite : true)
    .filter(w => !activeVaultId || w.vaultId === activeVaultId)
    .filter(w => 
      w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.walletAddress.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const openEditDialog = (wallet: CryptoWallet) => {
    setEditingWallet(wallet);
    setFormData({
      name: wallet.name,
      walletType: wallet.walletType,
      walletAddress: wallet.walletAddress,
      privateKey: wallet.privateKey || "",
      seedPhrase: wallet.seedPhrase || "",
      notes: wallet.notes || "",
      vaultId: wallet.vaultId,
    });
  };

  const getWalletColor = (type: CryptoWallet["walletType"]) => {
    return walletTypes.find(t => t.value === type)?.color || "bg-gray-500";
  };

  const WalletForm = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="My Bitcoin Wallet"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="walletType">Wallet Type</Label>
          <Select value={formData.walletType} onValueChange={(v) => setFormData({ ...formData, walletType: v as CryptoWallet["walletType"] })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {walletTypes.map(type => (
                <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="walletAddress">Wallet Address *</Label>
        <Input
          id="walletAddress"
          value={formData.walletAddress}
          onChange={(e) => setFormData({ ...formData, walletAddress: e.target.value })}
          placeholder="0x..."
          className="font-mono text-sm"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="privateKey">Private Key</Label>
        <Textarea
          id="privateKey"
          value={formData.privateKey}
          onChange={(e) => setFormData({ ...formData, privateKey: e.target.value })}
          placeholder="Enter private key (stored securely)"
          className="font-mono text-xs h-20"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="seedPhrase">Seed Phrase / Recovery Words</Label>
        <Textarea
          id="seedPhrase"
          value={formData.seedPhrase}
          onChange={(e) => setFormData({ ...formData, seedPhrase: e.target.value })}
          placeholder="word1 word2 word3..."
          className="font-mono text-xs h-20"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="Additional notes..."
          className="h-16"
        />
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Crypto Wallets</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Store your cryptocurrency wallet details securely
          </p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search wallets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-[200px]"
            />
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="w-4 h-4 mr-2" /> Add Wallet
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add Crypto Wallet</DialogTitle>
                <DialogDescription>Store your cryptocurrency wallet details</DialogDescription>
              </DialogHeader>
              <WalletForm />
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleAdd}>Add Wallet</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingWallet} onOpenChange={(open) => !open && setEditingWallet(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Crypto Wallet</DialogTitle>
            <DialogDescription>Update your wallet details</DialogDescription>
          </DialogHeader>
          <WalletForm />
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingWallet(null)}>Cancel</Button>
            <Button onClick={handleEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Wallets Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredWallets.map((wallet) => {
          const isVisible = visibleWallets.has(wallet.id);
          
          return (
            <div
              key={wallet.id}
              className="bg-card border border-border rounded-lg p-4 space-y-3"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", getWalletColor(wallet.walletType))}>
                    <Bitcoin className="w-5 h-5 text-white" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">{wallet.name}</h3>
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-muted-foreground">
                        {walletTypes.find(t => t.value === wallet.walletType)?.label}
                      </p>
                      <VaultBadge vaultId={wallet.vaultId} />
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => toggleFavorite(wallet.id)}
                  className="h-8 w-8"
                >
                  <Heart
                    className={cn(
                      "w-4 h-4",
                      wallet.isFavorite ? "fill-red-500 text-red-500" : "text-muted-foreground"
                    )}
                    strokeWidth={1.5}
                  />
                </Button>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Address</span>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard(wallet.walletAddress, "Address")}>
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
                <div className="bg-muted/50 rounded p-2 font-mono text-xs text-muted-foreground overflow-hidden text-ellipsis">
                  {wallet.walletAddress.slice(0, 20)}...{wallet.walletAddress.slice(-8)}
                </div>
              </div>

              {(wallet.privateKey || wallet.seedPhrase) && (
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={() => toggleVisibility(wallet.id)}>
                    {isVisible ? <EyeOff className="w-3 h-3 mr-1" /> : <Eye className="w-3 h-3 mr-1" />}
                    {isVisible ? "Hide" : "Show"} Secrets
                  </Button>
                </div>
              )}

              {isVisible && wallet.seedPhrase && (
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground">Seed Phrase</span>
                  <div className="bg-destructive/10 rounded p-2 font-mono text-xs text-destructive">
                    {wallet.seedPhrase}
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-2 border-t border-border">
                <Button variant="ghost" size="sm" onClick={() => openEditDialog(wallet)}>
                  <Edit2 className="w-3 h-3 mr-1" /> Edit
                </Button>
                <Button variant="ghost" size="sm" className="text-destructive ml-auto" onClick={() => handleDelete(wallet.id)}>
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredWallets.length === 0 && (
        <div className="text-center py-12 bg-muted/30 rounded-lg border border-border">
          <Wallet className="w-12 h-12 mx-auto text-muted-foreground mb-4" strokeWidth={1} />
          <p className="text-muted-foreground">No crypto wallets found</p>
        </div>
      )}
    </div>
  );
}

