import { useState } from "react";
import { Landmark, Plus, Search, Copy, Trash2, Edit2, Heart, Eye, EyeOff } from "lucide-react";
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

export interface BankAccount {
  id: string;
  name: string;
  bankName: string;
  accountType: "checking" | "savings" | "business" | "investment" | "other";
  accountNumber: string;
  routingNumber?: string;
  ibanNumber?: string;
  swiftCode?: string;
  branchName?: string;
  accountHolderName: string;
  notes?: string;
  createdAt: string;
  isFavorite: boolean;
}

interface BankInfoSectionProps {
  bankAccounts: BankAccount[];
  setBankAccounts: React.Dispatch<React.SetStateAction<BankAccount[]>>;
  showFavoritesOnly?: boolean;
  activeVaultId?: string;
}

const accountTypes = [
  { value: "checking", label: "Checking Account" },
  { value: "savings", label: "Savings Account" },
  { value: "business", label: "Business Account" },
  { value: "investment", label: "Investment Account" },
  { value: "other", label: "Other" },
];

export function BankInfoSection({ bankAccounts, setBankAccounts, showFavoritesOnly = false }: BankInfoSectionProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<BankAccount | null>(null);
  const [visibleAccounts, setVisibleAccounts] = useState<Set<string>>(new Set());
  const [formData, setFormData] = useState({
    name: "",
    bankName: "",
    accountType: "checking" as BankAccount["accountType"],
    accountNumber: "",
    routingNumber: "",
    ibanNumber: "",
    swiftCode: "",
    branchName: "",
    accountHolderName: "",
    notes: "",
  });

  const resetForm = () => {
    setFormData({
      name: "",
      bankName: "",
      accountType: "checking",
      accountNumber: "",
      routingNumber: "",
      ibanNumber: "",
      swiftCode: "",
      branchName: "",
      accountHolderName: "",
      notes: "",
    });
  };

  const handleAdd = () => {
    if (!formData.name || !formData.bankName || !formData.accountNumber) {
      toast.error("Please fill in required fields");
      return;
    }

    const newAccount: BankAccount = {
      id: Date.now().toString(),
      ...formData,
      createdAt: new Date().toISOString().split("T")[0],
      isFavorite: false,
    };

    setBankAccounts([...bankAccounts, newAccount]);
    resetForm();
    setIsAddDialogOpen(false);
    toast.success("Bank account added successfully");
  };

  const handleEdit = () => {
    if (!editingAccount || !formData.name) return;

    setBankAccounts(bankAccounts.map(a => 
      a.id === editingAccount.id ? { ...a, ...formData } : a
    ));
    setEditingAccount(null);
    resetForm();
    toast.success("Bank account updated successfully");
  };

  const handleDelete = (id: string) => {
    setBankAccounts(bankAccounts.filter(a => a.id !== id));
    toast.success("Bank account deleted");
  };

  const toggleFavorite = (id: string) => {
    setBankAccounts(bankAccounts.map(a => 
      a.id === id ? { ...a, isFavorite: !a.isFavorite } : a
    ));
  };

  const toggleVisibility = (id: string) => {
    setVisibleAccounts(prev => {
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

  const maskNumber = (num: string) => {
    if (num.length <= 4) return num;
    return "•".repeat(num.length - 4) + num.slice(-4);
  };

  const filteredAccounts = bankAccounts
    .filter(a => showFavoritesOnly ? a.isFavorite : true)
    .filter(a => 
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.bankName.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const openEditDialog = (account: BankAccount) => {
    setEditingAccount(account);
    setFormData({
      name: account.name,
      bankName: account.bankName,
      accountType: account.accountType,
      accountNumber: account.accountNumber,
      routingNumber: account.routingNumber || "",
      ibanNumber: account.ibanNumber || "",
      swiftCode: account.swiftCode || "",
      branchName: account.branchName || "",
      accountHolderName: account.accountHolderName,
      notes: account.notes || "",
    });
  };

  const AccountForm = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nickname *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="My Checking"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="bankName">Bank Name *</Label>
          <Input
            id="bankName"
            value={formData.bankName}
            onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
            placeholder="Bank of America"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="accountType">Account Type</Label>
          <Select value={formData.accountType} onValueChange={(v) => setFormData({ ...formData, accountType: v as BankAccount["accountType"] })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {accountTypes.map(type => (
                <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="accountHolderName">Account Holder *</Label>
          <Input
            id="accountHolderName"
            value={formData.accountHolderName}
            onChange={(e) => setFormData({ ...formData, accountHolderName: e.target.value })}
            placeholder="John Doe"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="accountNumber">Account Number *</Label>
          <Input
            id="accountNumber"
            value={formData.accountNumber}
            onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
            placeholder="1234567890"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="routingNumber">Routing Number</Label>
          <Input
            id="routingNumber"
            value={formData.routingNumber}
            onChange={(e) => setFormData({ ...formData, routingNumber: e.target.value })}
            placeholder="021000021"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="ibanNumber">IBAN</Label>
          <Input
            id="ibanNumber"
            value={formData.ibanNumber}
            onChange={(e) => setFormData({ ...formData, ibanNumber: e.target.value })}
            placeholder="DE89370400440532013000"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="swiftCode">SWIFT/BIC Code</Label>
          <Input
            id="swiftCode"
            value={formData.swiftCode}
            onChange={(e) => setFormData({ ...formData, swiftCode: e.target.value })}
            placeholder="BOFAUS3N"
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="branchName">Branch Name</Label>
        <Input
          id="branchName"
          value={formData.branchName}
          onChange={(e) => setFormData({ ...formData, branchName: e.target.value })}
          placeholder="Downtown Branch"
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
          <h2 className="text-xl font-semibold text-foreground">Bank Accounts</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Store your banking information securely
          </p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search accounts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-[200px]"
            />
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="w-4 h-4 mr-2" /> Add Account
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add Bank Account</DialogTitle>
                <DialogDescription>Store your bank account details securely</DialogDescription>
              </DialogHeader>
              <AccountForm />
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleAdd}>Add Account</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingAccount} onOpenChange={(open) => !open && setEditingAccount(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Bank Account</DialogTitle>
            <DialogDescription>Update your bank account details</DialogDescription>
          </DialogHeader>
          <AccountForm />
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingAccount(null)}>Cancel</Button>
            <Button onClick={handleEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Accounts Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredAccounts.map((account) => {
          const isVisible = visibleAccounts.has(account.id);
          
          return (
            <div
              key={account.id}
              className="bg-card border border-border rounded-lg p-4 space-y-3"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Landmark className="w-5 h-5 text-primary" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">{account.name}</h3>
                    <p className="text-xs text-muted-foreground">{account.bankName}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => toggleFavorite(account.id)}
                  className="h-8 w-8"
                >
                  <Heart
                    className={cn(
                      "w-4 h-4",
                      account.isFavorite ? "fill-red-500 text-red-500" : "text-muted-foreground"
                    )}
                    strokeWidth={1.5}
                  />
                </Button>
              </div>

              <div className="text-sm">
                <span className="text-muted-foreground">Holder: </span>
                <span className="text-foreground">{account.accountHolderName}</span>
              </div>

              <div className="text-sm">
                <span className="text-muted-foreground">Type: </span>
                <span className="text-foreground capitalize">{account.accountType}</span>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Account Number</span>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => toggleVisibility(account.id)}>
                      {isVisible ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    </Button>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard(account.accountNumber, "Account number")}>
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                <div className="bg-muted/50 rounded p-2 font-mono text-sm text-foreground">
                  {isVisible ? account.accountNumber : maskNumber(account.accountNumber)}
                </div>
              </div>

              {account.routingNumber && (
                <div className="text-sm">
                  <span className="text-muted-foreground">Routing: </span>
                  <span className="text-foreground font-mono">{isVisible ? account.routingNumber : maskNumber(account.routingNumber)}</span>
                </div>
              )}

              <div className="flex gap-2 pt-2 border-t border-border">
                <Button variant="ghost" size="sm" onClick={() => openEditDialog(account)}>
                  <Edit2 className="w-3 h-3 mr-1" /> Edit
                </Button>
                <Button variant="ghost" size="sm" className="text-destructive ml-auto" onClick={() => handleDelete(account.id)}>
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredAccounts.length === 0 && (
        <div className="text-center py-12 bg-muted/30 rounded-lg border border-border">
          <Landmark className="w-12 h-12 mx-auto text-muted-foreground mb-4" strokeWidth={1} />
          <p className="text-muted-foreground">No bank accounts found</p>
        </div>
      )}
    </div>
  );
}
