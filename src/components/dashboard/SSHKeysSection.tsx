import { useState } from "react";
import { Terminal, Plus, Search, Copy, Trash2, Edit2, Heart, Eye, EyeOff, Key } from "lucide-react";
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


export interface SSHKey {
  id: string;
  name: string;
  keyType: "rsa" | "ed25519" | "ecdsa" | "dsa";
  publicKey: string;
  privateKey: string;
  passphrase?: string;
  host?: string;
  username?: string;
  notes?: string;
  createdAt: string;
  isFavorite: boolean;
  vaultId?: string;
}

interface SSHKeysSectionProps {
  sshKeys: SSHKey[];
  setSSHKeys: React.Dispatch<React.SetStateAction<SSHKey[]>>;
  showFavoritesOnly?: boolean;
  activeVaultId?: string;
}

const keyTypes = [
  { value: "rsa", label: "RSA" },
  { value: "ed25519", label: "Ed25519" },
  { value: "ecdsa", label: "ECDSA" },
  { value: "dsa", label: "DSA" },
];

export function SSHKeysSection({ sshKeys, setSSHKeys, showFavoritesOnly = false, activeVaultId }: SSHKeysSectionProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingKey, setEditingKey] = useState<SSHKey | null>(null);
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());
  const [formData, setFormData] = useState({
    name: "",
    keyType: "rsa" as SSHKey["keyType"],
    publicKey: "",
    privateKey: "",
    passphrase: "",
    host: "",
    username: "",
    notes: "",
    vaultId: activeVaultId,
  });

  const resetForm = () => {
    setFormData({
      name: "",
      keyType: "rsa",
      publicKey: "",
      privateKey: "",
      passphrase: "",
      host: "",
      username: "",
      notes: "",
      vaultId: activeVaultId,
    });
  };

  const handleAdd = () => {
    if (!formData.name || !formData.publicKey) {
      toast.error("Please fill in required fields");
      return;
    }

    const newKey: SSHKey = {
      id: Date.now().toString(),
      name: formData.name,
      keyType: formData.keyType,
      publicKey: formData.publicKey,
      privateKey: formData.privateKey,
      passphrase: formData.passphrase,
      host: formData.host,
      username: formData.username,
      notes: formData.notes,
      vaultId: formData.vaultId || activeVaultId,
      createdAt: new Date().toISOString().split("T")[0],
      isFavorite: false,
    };

    setSSHKeys([...sshKeys, newKey]);
    resetForm();
    setIsAddDialogOpen(false);
    toast.success("SSH key added successfully");
  };

  const handleEdit = () => {
    if (!editingKey || !formData.name) return;

    setSSHKeys(sshKeys.map(k => 
      k.id === editingKey.id ? { ...k, ...formData, vaultId: formData.vaultId } : k
    ));
    setEditingKey(null);
    resetForm();
    toast.success("SSH key updated successfully");
  };

  const handleDelete = (id: string) => {
    setSSHKeys(sshKeys.filter(k => k.id !== id));
    toast.success("SSH key deleted");
  };

  const toggleFavorite = (id: string) => {
    setSSHKeys(sshKeys.map(k => 
      k.id === id ? { ...k, isFavorite: !k.isFavorite } : k
    ));
  };

  const toggleVisibility = (id: string) => {
    setVisibleKeys(prev => {
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

  const filteredKeys = sshKeys
    .filter(k => showFavoritesOnly ? k.isFavorite : true)
    .filter(k => !activeVaultId || k.vaultId === activeVaultId)
    .filter(k => 
      k.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      k.host?.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const openEditDialog = (key: SSHKey) => {
    setEditingKey(key);
    setFormData({
      name: key.name,
      keyType: key.keyType,
      publicKey: key.publicKey,
      privateKey: key.privateKey,
      passphrase: key.passphrase || "",
      host: key.host || "",
      username: key.username || "",
      notes: key.notes || "",
      vaultId: key.vaultId,
    });
  };

  const KeyForm = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="My SSH Key"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="keyType">Key Type</Label>
          <Select value={formData.keyType} onValueChange={(v) => setFormData({ ...formData, keyType: v as SSHKey["keyType"] })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {keyTypes.map(type => (
                <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="host">Host</Label>
          <Input
            id="host"
            value={formData.host}
            onChange={(e) => setFormData({ ...formData, host: e.target.value })}
            placeholder="github.com"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            placeholder="git"
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="publicKey">Public Key *</Label>
        <Textarea
          id="publicKey"
          value={formData.publicKey}
          onChange={(e) => setFormData({ ...formData, publicKey: e.target.value })}
          placeholder="ssh-rsa AAAA..."
          className="font-mono text-xs h-20"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="privateKey">Private Key</Label>
        <Textarea
          id="privateKey"
          value={formData.privateKey}
          onChange={(e) => setFormData({ ...formData, privateKey: e.target.value })}
          placeholder="-----BEGIN OPENSSH PRIVATE KEY-----"
          className="font-mono text-xs h-20"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="passphrase">Passphrase</Label>
        <Input
          id="passphrase"
          type="password"
          value={formData.passphrase}
          onChange={(e) => setFormData({ ...formData, passphrase: e.target.value })}
          placeholder="Optional passphrase"
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
      <VaultSelect
        value={formData.vaultId}
        onChange={(vaultId) => setFormData({ ...formData, vaultId })}
      />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">SSH Keys</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your SSH keys securely
          </p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search keys..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-[200px]"
            />
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="w-4 h-4 mr-2" /> Add Key
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add SSH Key</DialogTitle>
                <DialogDescription>Add a new SSH key to your vault</DialogDescription>
              </DialogHeader>
              <KeyForm />
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleAdd}>Add Key</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingKey} onOpenChange={(open) => !open && setEditingKey(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit SSH Key</DialogTitle>
            <DialogDescription>Update your SSH key details</DialogDescription>
          </DialogHeader>
          <KeyForm />
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingKey(null)}>Cancel</Button>
            <Button onClick={handleEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Keys Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredKeys.map((sshKey) => {
          const isVisible = visibleKeys.has(sshKey.id);
          
          return (
            <div
              key={sshKey.id}
              className="bg-card border border-border rounded-lg p-4 space-y-3"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Terminal className="w-5 h-5 text-primary" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">{sshKey.name}</h3>
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-muted-foreground">{sshKey.keyType.toUpperCase()}</p>
                      <VaultBadge vaultId={sshKey.vaultId} />
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => toggleFavorite(sshKey.id)}
                  className="h-8 w-8"
                >
                  <Heart
                    className={cn(
                      "w-4 h-4",
                      sshKey.isFavorite ? "fill-red-500 text-red-500" : "text-muted-foreground"
                    )}
                    strokeWidth={1.5}
                  />
                </Button>
              </div>

              {sshKey.host && (
                <div className="text-sm">
                  <span className="text-muted-foreground">Host: </span>
                  <span className="text-foreground">{sshKey.username ? `${sshKey.username}@` : ""}{sshKey.host}</span>
                </div>
              )}

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Public Key</span>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => toggleVisibility(sshKey.id)}>
                      {isVisible ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    </Button>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard(sshKey.publicKey, "Public key")}>
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                <div className="bg-muted/50 rounded p-2 font-mono text-xs text-muted-foreground overflow-hidden">
                  {isVisible ? sshKey.publicKey.slice(0, 60) + "..." : "••••••••••••••••••••"}
                </div>
              </div>

              <div className="flex gap-2 pt-2 border-t border-border">
                <Button variant="ghost" size="sm" onClick={() => openEditDialog(sshKey)}>
                  <Edit2 className="w-3 h-3 mr-1" /> Edit
                </Button>
                {sshKey.privateKey && (
                  <Button variant="ghost" size="sm" onClick={() => copyToClipboard(sshKey.privateKey, "Private key")}>
                    <Key className="w-3 h-3 mr-1" /> Copy Private
                  </Button>
                )}
                <Button variant="ghost" size="sm" className="text-destructive ml-auto" onClick={() => handleDelete(sshKey.id)}>
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredKeys.length === 0 && (
        <div className="text-center py-12 bg-muted/30 rounded-lg border border-border">
          <Terminal className="w-12 h-12 mx-auto text-muted-foreground mb-4" strokeWidth={1} />
          <p className="text-muted-foreground">No SSH keys found</p>
        </div>
      )}
    </div>
  );
}

