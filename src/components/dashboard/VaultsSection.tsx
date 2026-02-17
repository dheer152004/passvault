import { useState } from "react";
import { Plus, MoreHorizontal, Pencil, Trash2, FolderOpen } from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export const VAULT_ICONS = ["📚", "🎓", "💼", "🏠", "🎮", "💰", "🔒", "⭐"];
export const VAULT_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16"];

export interface Vault {
  id: string;
  name: string;
  icon: string | null;
  color: string | null;
}

interface VaultsSectionProps {
  vaults: Vault[];
  activeVaultId: string | undefined;
  onVaultSelect: (id: string | undefined) => void;
  onAddVault: (data: { name: string; icon: string; color: string }) => Promise<any>;
  onUpdateVault: (id: string, data: { name?: string; icon?: string; color?: string }) => Promise<void>;
  onDeleteVault: (id: string) => Promise<void>;
}

export function VaultsSection({
  vaults,
  activeVaultId,
  onVaultSelect,
  onAddVault,
  onUpdateVault,
  onDeleteVault,
}: VaultsSectionProps) {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingVault, setEditingVault] = useState<string | null>(null);
  const [newVaultName, setNewVaultName] = useState("");
  const [selectedIcon, setSelectedIcon] = useState(VAULT_ICONS[0]);
  const [selectedColor, setSelectedColor] = useState(VAULT_COLORS[0]);

  const handleCreateVault = async () => {
    if (newVaultName.trim()) {
      await onAddVault({
        name: newVaultName.trim(),
        icon: selectedIcon,
        color: selectedColor,
      });
      setNewVaultName("");
      setSelectedIcon(VAULT_ICONS[0]);
      setSelectedColor(VAULT_COLORS[0]);
      setIsCreateOpen(false);
    }
  };

  const handleEditVault = async () => {
    if (editingVault && newVaultName.trim()) {
      await onUpdateVault(editingVault, {
        name: newVaultName.trim(),
        icon: selectedIcon,
        color: selectedColor,
      });
      setEditingVault(null);
      setNewVaultName("");
      setIsEditOpen(false);
    }
  };

  const openEditDialog = (vault: Vault) => {
    setEditingVault(vault.id);
    setNewVaultName(vault.name);
    setSelectedIcon(vault.icon || VAULT_ICONS[0]);
    setSelectedColor(vault.color || VAULT_COLORS[0]);
    setIsEditOpen(true);
  };

  const handleDeleteVault = async (id: string) => {
    await onDeleteVault(id);
    if (activeVaultId === id) {
      onVaultSelect(undefined);
    }
  };

  const VaultForm = ({ onSubmit, submitLabel }: { onSubmit: () => void; submitLabel: string }) => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="vault-name">Vault Name</Label>
        <Input
          id="vault-name"
          value={newVaultName}
          onChange={(e) => setNewVaultName(e.target.value)}
          placeholder="e.g., School, Work, Personal"
        />
      </div>

      <div className="space-y-2">
        <Label>Icon</Label>
        <div className="flex flex-wrap gap-2">
          {VAULT_ICONS.map((icon) => (
            <button
              key={icon}
              onClick={() => setSelectedIcon(icon)}
              className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center text-lg transition-all",
                selectedIcon === icon
                  ? "bg-primary/20 ring-2 ring-primary"
                  : "bg-muted hover:bg-muted/80"
              )}
            >
              {icon}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Color</Label>
        <div className="flex flex-wrap gap-2">
          {VAULT_COLORS.map((color) => (
            <button
              key={color}
              onClick={() => setSelectedColor(color)}
              className={cn(
                "w-8 h-8 rounded-full transition-all",
                selectedColor === color ? "ring-2 ring-offset-2 ring-primary" : ""
              )}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>

      <Button onClick={onSubmit} className="w-full" disabled={!newVaultName.trim()}>
        {submitLabel}
      </Button>
    </div>
  );

  // Default vault that always exists (not in DB)
  const defaultVault = {
    id: "default",
    name: "All Items",
    icon: "🔐",
    color: "#6366f1",
  };

  const allVaults = [defaultVault, ...vaults];

  if (isCollapsed) {
    return (
      <div className="px-2 py-2">
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" className="w-full h-8">
              <FolderOpen className="w-4 h-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Vault</DialogTitle>
            </DialogHeader>
            <VaultForm onSubmit={handleCreateVault} submitLabel="Create Vault" />
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="px-3 py-2">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-sidebar-foreground/60 uppercase tracking-wider">Vaults</span>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" className="h-6 w-6">
              <Plus className="w-3.5 h-3.5" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Vault</DialogTitle>
            </DialogHeader>
            <VaultForm onSubmit={handleCreateVault} submitLabel="Create Vault" />
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-1">
        {allVaults.map((vault) => {
          const isDefault = vault.id === "default";
          const isActive = isDefault ? !activeVaultId : activeVaultId === vault.id;

          return (
            <div
              key={vault.id}
              className={cn(
                "flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer transition-colors group",
                isActive
                  ? "bg-sidebar-accent"
                  : "hover:bg-sidebar-accent/50"
              )}
              onClick={() => onVaultSelect(isDefault ? undefined : vault.id)}
            >
              <span
                className="w-6 h-6 rounded flex items-center justify-center text-sm flex-shrink-0"
                style={{ backgroundColor: `${vault.color || "#6366f1"}20` }}
              >
                {vault.icon || "📁"}
              </span>
              <span className="flex-1 text-sm truncate text-sidebar-foreground">
                {vault.name}
              </span>

              {!isDefault && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 opacity-0 group-hover:opacity-100"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreHorizontal className="w-3 h-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => openEditDialog(vault)}>
                      <Pencil className="w-4 h-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleDeleteVault(vault.id)}
                      className="text-destructive"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          );
        })}
      </div>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Vault</DialogTitle>
          </DialogHeader>
          <VaultForm onSubmit={handleEditVault} submitLabel="Save Changes" />
        </DialogContent>
      </Dialog>
    </div>
  );
}
