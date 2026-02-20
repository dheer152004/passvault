import { useState, useEffect } from "react";
import { 
  Search, 
  Plus, 
  Copy, 
  Pencil, 
  Trash2,
  Check,
  Heart,
  Smartphone,
  RefreshCw
} from "lucide-react";
import { VaultBadge } from "./VaultBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import { VaultSelect } from "./VaultSelect";

export interface TOTP {
  id: string;
  name: string;
  issuer: string;
  secret: string;
  createdAt: string;
  isFavorite?: boolean;
  vaultId?: string;
}

interface TOTPSectionProps {
  totps: TOTP[];
  setTotps: React.Dispatch<React.SetStateAction<TOTP[]>>;
  showFavoritesOnly?: boolean;
  activeVaultId?: string;
}

// Generate a 6-digit code from secret (simulated)
const generateTOTPCode = (secret: string): string => {
  const hash = secret.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const timeStep = Math.floor(Date.now() / 30000);
  const code = ((hash * timeStep) % 1000000).toString().padStart(6, '0');
  return code;
};

export function TOTPSection({ 
  totps, 
  setTotps, 
  showFavoritesOnly = false,
  activeVaultId
}: TOTPSectionProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingTOTP, setEditingTOTP] = useState<TOTP | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(30);
  const [codes, setCodes] = useState<Record<string, string>>({});
  
  const [formData, setFormData] = useState({
    name: "",
    issuer: "",
    secret: "",
    vaultId: undefined as string | undefined,
  });

  // Update codes and timer every second
  useEffect(() => {
    const updateCodes = () => {
      const newCodes: Record<string, string> = {};
      totps.forEach(totp => {
        newCodes[totp.id] = generateTOTPCode(totp.secret);
      });
      setCodes(newCodes);
    };

    const updateTimer = () => {
      const seconds = 30 - (Math.floor(Date.now() / 1000) % 30);
      setTimeRemaining(seconds);
      if (seconds === 30) {
        updateCodes();
      }
    };

    updateCodes();
    updateTimer();

    const interval = setInterval(() => {
      updateTimer();
    }, 1000);

    return () => clearInterval(interval);
  }, [totps]);

  const filteredTOTPs = totps.filter((t) => {
    const matchesSearch = 
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.issuer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFavorite = !showFavoritesOnly || t.isFavorite;
    const matchesVault = !activeVaultId || t.vaultId === activeVaultId;
    return matchesSearch && matchesFavorite && matchesVault;
  });

  const toggleFavorite = (id: string) => {
    const totp = totps.find(t => t.id === id);
    setTotps(totps.map(t => 
      t.id === id ? { ...t, isFavorite: !t.isFavorite } : t
    ));
    toast.success(totp?.isFavorite ? "Removed from favorites" : "Added to favorites");
  };

  const copyToClipboard = async (code: string, id: string) => {
    await navigator.clipboard.writeText(code);
    setCopiedId(id);
    toast.success("Code copied to clipboard");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleAddTOTP = () => {
    if (!formData.name || !formData.secret) {
      toast.error("Please fill in all required fields");
      return;
    }

    const newTOTP: TOTP = {
      id: Date.now().toString(),
      ...formData,
      createdAt: new Date().toISOString().split("T")[0],
      isFavorite: false,
      vaultId: activeVaultId || formData.vaultId,
    };
    setTotps([...totps, newTOTP]);
    setFormData({ name: "", issuer: "", secret: "", vaultId: undefined });
    setIsAddDialogOpen(false);
    toast.success("Authenticator added successfully");
  };

  const handleEditTOTP = () => {
    if (!editingTOTP) return;
    setTotps(
      totps.map((t) =>
        t.id === editingTOTP.id ? { ...editingTOTP, ...formData } : t
      )
    );
    setEditingTOTP(null);
    setFormData({ name: "", issuer: "", secret: "", vaultId: undefined });
    toast.success("Authenticator updated successfully");
  };

  const handleDeleteTOTP = (id: string) => {
    setTotps(totps.filter((t) => t.id !== id));
    toast.success("Authenticator deleted successfully");
  };

  const openEditDialog = (totp: TOTP) => {
    setEditingTOTP(totp);
    setFormData({
      name: totp.name,
      issuer: totp.issuer,
      secret: totp.secret,
      vaultId: totp.vaultId,
    });
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Authenticator</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your 2FA codes
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" strokeWidth={1.5} />
              Add Authenticator
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Authenticator</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="name">Account Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Google, GitHub"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="issuer">Issuer</Label>
                <Input
                  id="issuer"
                  placeholder="e.g., user@example.com"
                  value={formData.issuer}
                  onChange={(e) => setFormData({ ...formData, issuer: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="secret">Secret Key *</Label>
                <Input
                  id="secret"
                  placeholder="Enter the secret key"
                  value={formData.secret}
                  onChange={(e) => setFormData({ ...formData, secret: e.target.value.toUpperCase() })}
                  className="font-mono"
                />
                <p className="text-xs text-muted-foreground">
                  Usually provided as a text string when setting up 2FA
                </p>
              </div>
              <VaultSelect
                value={formData.vaultId}
                onChange={(value) => setFormData({ ...formData, vaultId: value })}
              />
              <Button onClick={handleAddTOTP} className="w-full">
                Add Authenticator
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Timer */}
      <div className="flex items-center gap-3 mb-6 p-3 bg-muted/30 rounded-lg border border-border">
        <RefreshCw className={`w-4 h-4 text-muted-foreground ${timeRemaining <= 5 ? 'animate-spin' : ''}`} strokeWidth={1.5} />
        <div className="flex-1">
          <Progress value={(timeRemaining / 30) * 100} className="h-2" />
        </div>
        <span className={`text-sm font-mono ${timeRemaining <= 5 ? 'text-destructive' : 'text-muted-foreground'}`}>
          {timeRemaining}s
        </span>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
        <Input
          placeholder="Search authenticators..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* TOTP List */}
      <div className="space-y-3">
        {filteredTOTPs.length === 0 ? (
          <div className="text-center py-12 bg-muted/30 rounded-lg border border-border">
            <Smartphone className="w-12 h-12 mx-auto text-muted-foreground mb-4" strokeWidth={1.5} />
            <p className="text-muted-foreground">No authenticators found</p>
          </div>
        ) : (
          filteredTOTPs.map((totp) => {
            const code = codes[totp.id] || "------";
            const isCopied = copiedId === totp.id;

            return (
              <div
                key={totp.id}
                className="bg-background border border-border rounded-lg p-4 hover:border-primary/30 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                    <Smartphone className="w-5 h-5 text-muted-foreground" strokeWidth={1.5} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-medium text-foreground">{totp.name}</h3>
                        {totp.issuer && (
                          <p className="text-sm text-muted-foreground">{totp.issuer}</p>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => toggleFavorite(totp.id)}
                          className="p-2 rounded-md hover:bg-muted transition-colors"
                          aria-label={totp.isFavorite ? "Remove from favorites" : "Add to favorites"}
                        >
                          <Heart 
                            className={`w-4 h-4 transition-colors ${totp.isFavorite ? "fill-destructive text-destructive" : "text-muted-foreground"}`} 
                            strokeWidth={1.5} 
                          />
                        </button>
                        <button
                          onClick={() => copyToClipboard(code, totp.id)}
                          className="p-2 rounded-md hover:bg-muted transition-colors"
                          aria-label="Copy code"
                        >
                          {isCopied ? (
                            <Check className="w-4 h-4 text-primary" strokeWidth={1.5} />
                          ) : (
                            <Copy className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
                          )}
                        </button>
                        <Dialog>
                          <DialogTrigger asChild>
                            <button
                              onClick={() => openEditDialog(totp)}
                              className="p-2 rounded-md hover:bg-muted transition-colors"
                              aria-label="Edit authenticator"
                            >
                              <Pencil className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
                            </button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Edit Authenticator</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 pt-4">
                              <div className="space-y-2">
                                <Label htmlFor="edit-name">Account Name *</Label>
                                <Input
                                  id="edit-name"
                                  placeholder="e.g., Google, GitHub"
                                  value={formData.name}
                                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="edit-issuer">Issuer</Label>
                                <Input
                                  id="edit-issuer"
                                  placeholder="e.g., user@example.com"
                                  value={formData.issuer}
                                  onChange={(e) => setFormData({ ...formData, issuer: e.target.value })}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="edit-secret">Secret Key *</Label>
                                <Input
                                  id="edit-secret"
                                  placeholder="Enter the secret key"
                                  value={formData.secret}
                                  onChange={(e) => setFormData({ ...formData, secret: e.target.value.toUpperCase() })}
                                  className="font-mono"
                                />
                              </div>
                              <VaultSelect
                                value={formData.vaultId}
                                onChange={(value) => setFormData({ ...formData, vaultId: value })}
                              />
                              <Button onClick={handleEditTOTP} className="w-full">
                                Save Changes
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                        <button
                          onClick={() => handleDeleteTOTP(totp.id)}
                          className="p-2 rounded-md hover:bg-muted transition-colors"
                          aria-label="Delete authenticator"
                        >
                          <Trash2 className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
                        </button>
                      </div>
                    </div>
                    
                    <div className="mt-3 flex items-center gap-2">
                      <code className={`text-2xl font-mono font-bold tracking-widest ${timeRemaining <= 5 ? 'text-destructive' : 'text-primary'}`}>
                        {code.slice(0, 3)} {code.slice(3)}
                      </code>
                      <VaultBadge vaultId={totp.vaultId} />
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mt-8">
        <div className="bg-muted/30 rounded-lg p-4 border border-border">
          <p className="text-sm text-muted-foreground">Total Authenticators</p>
          <p className="text-2xl font-semibold text-foreground mt-1">{totps.length}</p>
        </div>
        <div className="bg-muted/30 rounded-lg p-4 border border-border">
          <p className="text-sm text-muted-foreground">Favorites</p>
          <p className="text-2xl font-semibold text-foreground mt-1">
            {totps.filter(t => t.isFavorite).length}
          </p>
        </div>
      </div>
    </div>
  );
}
