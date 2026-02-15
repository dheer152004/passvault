import { useState } from "react";
import { Package, Plus, Search, Copy, Trash2, Edit2, Heart, Eye, EyeOff, ExternalLink } from "lucide-react";
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


export interface SoftwareLicense {
  id: string;
  name: string;
  software: "jetbrains" | "adobe" | "microsoft" | "autodesk" | "other";
  licenseKey: string;
  email?: string;
  password?: string;
  expiryDate?: string;
  purchaseDate?: string;
  website?: string;
  notes?: string;
  createdAt: string;
  isFavorite: boolean;
  vaultId?: string;
}

interface SoftwareLicensesSectionProps {
  licenses: SoftwareLicense[];
  setLicenses: React.Dispatch<React.SetStateAction<SoftwareLicense[]>>;
  showFavoritesOnly?: boolean;
  activeVaultId?: string;
}

const softwareTypes = [
  { value: "jetbrains", label: "JetBrains", color: "bg-violet-600" },
  { value: "adobe", label: "Adobe", color: "bg-red-600" },
  { value: "microsoft", label: "Microsoft", color: "bg-blue-600" },
  { value: "autodesk", label: "Autodesk", color: "bg-teal-600" },
  { value: "other", label: "Other", color: "bg-gray-600" },
];

export function SoftwareLicensesSection({ licenses, setLicenses, showFavoritesOnly = false, activeVaultId }: SoftwareLicensesSectionProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingLicense, setEditingLicense] = useState<SoftwareLicense | null>(null);
  const [visibleLicenses, setVisibleLicenses] = useState<Set<string>>(new Set());
  const [formData, setFormData] = useState({
    name: "",
    software: "jetbrains" as SoftwareLicense["software"],
    licenseKey: "",
    email: "",
    password: "",
    expiryDate: "",
    purchaseDate: "",
    website: "",
    notes: "",
    vaultId: activeVaultId,
  });

  const resetForm = () => {
    setFormData({
      name: "",
      software: "jetbrains",
      licenseKey: "",
      email: "",
      password: "",
      expiryDate: "",
      purchaseDate: "",
      website: "",
      notes: "",
      vaultId: activeVaultId,
    });
  };

  const handleAdd = () => {
    if (!formData.name || !formData.licenseKey) {
      toast.error("Please fill in required fields");
      return;
    }

    const newLicense: SoftwareLicense = {
      id: Date.now().toString(),
      name: formData.name,
      software: formData.software,
      licenseKey: formData.licenseKey,
      email: formData.email,
      password: formData.password,
      expiryDate: formData.expiryDate,
      purchaseDate: formData.purchaseDate,
      website: formData.website,
      notes: formData.notes,
      vaultId: formData.vaultId || activeVaultId,
      createdAt: new Date().toISOString().split("T")[0],
      isFavorite: false,
    };

    setLicenses([...licenses, newLicense]);
    resetForm();
    setIsAddDialogOpen(false);
    toast.success("License added successfully");
  };

  const handleEdit = () => {
    if (!editingLicense || !formData.name) return;

    setLicenses(licenses.map(l => 
      l.id === editingLicense.id ? { ...l, ...formData, vaultId: formData.vaultId } : l
    ));
    setEditingLicense(null);
    resetForm();
    toast.success("License updated successfully");
  };

  const handleDelete = (id: string) => {
    setLicenses(licenses.filter(l => l.id !== id));
    toast.success("License deleted");
  };

  const toggleFavorite = (id: string) => {
    setLicenses(licenses.map(l => 
      l.id === id ? { ...l, isFavorite: !l.isFavorite } : l
    ));
  };

  const toggleVisibility = (id: string) => {
    setVisibleLicenses(prev => {
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

  const filteredLicenses = licenses
    .filter(l => showFavoritesOnly ? l.isFavorite : true)
    .filter(l => !activeVaultId || l.vaultId === activeVaultId)
    .filter(l => 
      l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.software.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const openEditDialog = (license: SoftwareLicense) => {
    setEditingLicense(license);
    setFormData({
      name: license.name,
      software: license.software,
      licenseKey: license.licenseKey,
      email: license.email || "",
      password: license.password || "",
      expiryDate: license.expiryDate || "",
      purchaseDate: license.purchaseDate || "",
      website: license.website || "",
      notes: license.notes || "",
      vaultId: license.vaultId,
    });
  };

  const getSoftwareColor = (type: SoftwareLicense["software"]) => {
    return softwareTypes.find(t => t.value === type)?.color || "bg-gray-600";
  };

  const LicenseForm = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="IntelliJ IDEA Ultimate"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="software">Software Vendor</Label>
          <Select value={formData.software} onValueChange={(v) => setFormData({ ...formData, software: v as SoftwareLicense["software"] })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {softwareTypes.map(type => (
                <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="licenseKey">License Key *</Label>
        <Textarea
          id="licenseKey"
          value={formData.licenseKey}
          onChange={(e) => setFormData({ ...formData, licenseKey: e.target.value })}
          placeholder="XXXXX-XXXXX-XXXXX-XXXXX"
          className="font-mono text-sm h-20"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="email">Account Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="your@email.com"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Account Password</Label>
          <Input
            id="password"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            placeholder="••••••••"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="purchaseDate">Purchase Date</Label>
          <Input
            id="purchaseDate"
            type="date"
            value={formData.purchaseDate}
            onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="expiryDate">Expiry Date</Label>
          <Input
            id="expiryDate"
            type="date"
            value={formData.expiryDate}
            onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="website">Website</Label>
        <Input
          id="website"
          value={formData.website}
          onChange={(e) => setFormData({ ...formData, website: e.target.value })}
          placeholder="https://account.jetbrains.com"
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
          <h2 className="text-xl font-semibold text-foreground">Software Licenses</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Store your software licenses and subscriptions
          </p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search licenses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-[200px]"
            />
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="w-4 h-4 mr-2" /> Add License
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add Software License</DialogTitle>
                <DialogDescription>Store your software license details</DialogDescription>
              </DialogHeader>
              <LicenseForm />
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleAdd}>Add License</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingLicense} onOpenChange={(open) => !open && setEditingLicense(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Software License</DialogTitle>
            <DialogDescription>Update your license details</DialogDescription>
          </DialogHeader>
          <LicenseForm />
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingLicense(null)}>Cancel</Button>
            <Button onClick={handleEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Licenses Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredLicenses.map((license) => {
          const isVisible = visibleLicenses.has(license.id);
          
          return (
            <div
              key={license.id}
              className="bg-card border border-border rounded-lg p-4 space-y-3"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", getSoftwareColor(license.software))}>
                    <Package className="w-5 h-5 text-white" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">{license.name}</h3>
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-muted-foreground">
                        {softwareTypes.find(t => t.value === license.software)?.label}
                      </p>
                      <VaultBadge vaultId={license.vaultId} />
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => toggleFavorite(license.id)}
                  className="h-8 w-8"
                >
                  <Heart
                    className={cn(
                      "w-4 h-4",
                      license.isFavorite ? "fill-red-500 text-red-500" : "text-muted-foreground"
                    )}
                    strokeWidth={1.5}
                  />
                </Button>
              </div>

              {license.expiryDate && (
                <div className="text-sm">
                  <span className="text-muted-foreground">Expires: </span>
                  <span className="text-foreground">{license.expiryDate}</span>
                </div>
              )}

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">License Key</span>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => toggleVisibility(license.id)}>
                      {isVisible ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    </Button>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard(license.licenseKey, "License key")}>
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                <div className="bg-muted/50 rounded p-2 font-mono text-xs text-muted-foreground overflow-hidden">
                  {isVisible ? license.licenseKey.slice(0, 40) + (license.licenseKey.length > 40 ? "..." : "") : "••••••••••••••••••••"}
                </div>
              </div>

              {license.email && (
                <div className="text-sm">
                  <span className="text-muted-foreground">Email: </span>
                  <span className="text-foreground">{license.email}</span>
                </div>
              )}

              <div className="flex gap-2 pt-2 border-t border-border">
                <Button variant="ghost" size="sm" onClick={() => openEditDialog(license)}>
                  <Edit2 className="w-3 h-3 mr-1" /> Edit
                </Button>
                {license.website && (
                  <Button variant="ghost" size="sm" onClick={() => window.open(license.website, "_blank")}>
                    <ExternalLink className="w-3 h-3 mr-1" /> Open
                  </Button>
                )}
                <Button variant="ghost" size="sm" className="text-destructive ml-auto" onClick={() => handleDelete(license.id)}>
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredLicenses.length === 0 && (
        <div className="text-center py-12 bg-muted/30 rounded-lg border border-border">
          <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" strokeWidth={1} />
          <p className="text-muted-foreground">No software licenses found</p>
        </div>
      )}
    </div>
  );
}

