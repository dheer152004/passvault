import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useVaultsContext } from "@/hooks/useVaultsContext";

interface VaultSelectProps {
  value: string | undefined;
  onChange: (value: string | undefined) => void;
  label?: string;
}

export function VaultSelect({ value, onChange, label = "Vault" }: VaultSelectProps) {
  const { vaults } = useVaultsContext();
  
  // Add "No Vault" option at the beginning
  const allOptions = [
    { id: "none", name: "No Vault", icon: "📄", color: "#6b7280" },
    ...vaults,
  ];

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Select
        value={value || "none"}
        onValueChange={(val) => onChange(val === "none" ? undefined : val)}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select a vault" />
        </SelectTrigger>
        <SelectContent>
          {allOptions.map((vault) => (
            <SelectItem key={vault.id} value={vault.id}>
              <span className="flex items-center gap-2">
                <span>{vault.icon || "📁"}</span>
                <span>{vault.name}</span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}