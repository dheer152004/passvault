import { Badge } from "@/components/ui/badge";
import { useVaultsContext } from "@/hooks/useVaultsContext";

interface VaultBadgeProps {
  vaultId?: string;
  className?: string;
}

export function VaultBadge({ vaultId, className }: VaultBadgeProps) {
  const { vaults } = useVaultsContext();
  
  if (!vaultId) return null;
  
  const vault = vaults.find(v => v.id === vaultId);
  
  if (!vault) return null;
  
  return (
    <Badge 
      variant="outline" 
      className={`text-xs font-normal gap-1 ${className}`}
      style={{ borderColor: vault.color || "#6366f1", color: vault.color || "#6366f1" }}
    >
      <span>{vault.icon || "📁"}</span>
      <span className="max-w-[80px] truncate">{vault.name}</span>
    </Badge>
  );
}