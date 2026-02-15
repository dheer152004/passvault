import { useState } from "react";
import { Plus, IdCard, Pencil, Trash2, Search, Heart, Eye, EyeOff, Copy, Check, Car, Building2, Vote, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
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
import { VaultSelect } from "./VaultSelect";

export interface IDCard {
  id: string;
  name: string;
  idType: string;
  idNumber: string;
  fullName: string;
  dateOfBirth: string;
  issueDate: string;
  expiryDate: string;
  issuingAuthority: string;
  notes: string;
  createdAt: string;
  isFavorite?: boolean;
  vaultId?: string;
}

interface IDCardsSectionProps {
  idCards: IDCard[];
  setIdCards: React.Dispatch<React.SetStateAction<IDCard[]>>;
  showFavoritesOnly?: boolean;
  activeVaultId?: string;
}

const idTypes = [
  { value: "driving_license", label: "Driving License", icon: Car },
  { value: "govt_id", label: "Government ID", icon: Building2 },
  { value: "voter_id", label: "Voter ID", icon: Vote },
  { value: "passport", label: "Passport", icon: FileText },
  { value: "other", label: "Other", icon: IdCard },
];

const getIdTypeIcon = (type: string) => {
  const found = idTypes.find(t => t.value === type);
  return found?.icon || IdCard;
};

const getIdTypeGradient = (type: string): string => {
  const gradients: Record<string, string> = {
    driving_license: "bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-900",
    govt_id: "bg-gradient-to-br from-indigo-600 via-indigo-700 to-indigo-900",
    voter_id: "bg-gradient-to-br from-purple-600 via-purple-700 to-purple-900",
    passport: "bg-gradient-to-br from-rose-600 via-rose-700 to-rose-900",
    other: "bg-gradient-to-br from-gray-600 via-gray-700 to-gray-900",
  };
  return gradients[type] || gradients.other;
};

export function IDCardsSection({ idCards, setIdCards, showFavoritesOnly = false, activeVaultId }: IDCardsSectionProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<IDCard | null>(null);
  const [visibleCards, setVisibleCards] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    idType: "driving_license",
    idNumber: "",
    fullName: "",
    dateOfBirth: "",
    issueDate: "",
    expiryDate: "",
    issuingAuthority: "",
    notes: "",
    vaultId: undefined as string | undefined,
  });

  const filteredCards = idCards.filter((c) => {
    const matchesSearch = 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.idNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFavorite = !showFavoritesOnly || c.isFavorite;
    const matchesVault = !activeVaultId || c.vaultId === activeVaultId;
    return matchesSearch && matchesFavorite && matchesVault;
  });

  const handleAddCard = () => {
    if (!formData.name.trim() || !formData.idNumber.trim()) {
      toast.error("Please fill in required fields");
      return;
    }
    const newCard: IDCard = {
      id: Date.now().toString(),
      ...formData,
      createdAt: new Date().toISOString().split("T")[0],
      isFavorite: false,
      vaultId: activeVaultId || formData.vaultId,
    };
    setIdCards([...idCards, newCard]);
    setFormData({
      name: "",
      idType: "driving_license",
      idNumber: "",
      fullName: "",
      dateOfBirth: "",
      issueDate: "",
      expiryDate: "",
      issuingAuthority: "",
      notes: "",
      vaultId: undefined,
    });
    setIsAddDialogOpen(false);
    toast.success("ID card added successfully");
  };

  const handleEditCard = () => {
    if (!editingCard) return;
    setIdCards(
      idCards.map((c) =>
        c.id === editingCard.id ? { ...c, ...formData } : c
      )
    );
    setEditingCard(null);
    setFormData({
      name: "",
      idType: "driving_license",
      idNumber: "",
      fullName: "",
      dateOfBirth: "",
      issueDate: "",
      expiryDate: "",
      issuingAuthority: "",
      notes: "",
      vaultId: undefined,
    });
    toast.success("ID card updated successfully");
  };

  const handleDeleteCard = (id: string) => {
    setIdCards(idCards.filter((c) => c.id !== id));
    toast.success("ID card deleted successfully");
  };

  const toggleFavorite = (id: string) => {
    const card = idCards.find(c => c.id === id);
    setIdCards(idCards.map(c => 
      c.id === id ? { ...c, isFavorite: !c.isFavorite } : c
    ));
    toast.success(card?.isFavorite ? "Removed from favorites" : "Added to favorites");
  };

  const toggleCardVisibility = (id: string) => {
    setVisibleCards((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("ID number copied to clipboard");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const openEditDialog = (card: IDCard) => {
    setEditingCard(card);
    setFormData({
      name: card.name,
      idType: card.idType,
      idNumber: card.idNumber,
      fullName: card.fullName,
      dateOfBirth: card.dateOfBirth,
      issueDate: card.issueDate,
      expiryDate: card.expiryDate,
      issuingAuthority: card.issuingAuthority,
      notes: card.notes,
      vaultId: card.vaultId,
    });
  };

  const maskIdNumber = (number: string) => {
    if (number.length <= 4) return "••••";
    return `${"•".repeat(number.length - 4)}${number.slice(-4)}`;
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-semibold text-foreground">ID Cards</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Securely store your identification documents
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" strokeWidth={1.5} />
              Add ID Card
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New ID Card</DialogTitle>
            </DialogHeader>
            <IDCardForm
              formData={formData}
              setFormData={setFormData}
              onSubmit={handleAddCard}
              submitLabel="Add ID Card"
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
        <Input
          placeholder="Search ID cards..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredCards.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-muted/30 rounded-lg border border-border">
            <IdCard className="w-12 h-12 mx-auto text-muted-foreground mb-4" strokeWidth={1.5} />
            <p className="text-muted-foreground">No ID cards found</p>
          </div>
        ) : (
          filteredCards.map((card) => {
            const isVisible = visibleCards.has(card.id);
            const isCopied = copiedId === card.id;
            const TypeIcon = getIdTypeIcon(card.idType);

            return (
              <div
                key={card.id}
                className="bg-card border border-border rounded-xl p-4 hover:border-primary/30 transition-colors"
              >
                {/* ID Card Visual */}
                <div className="relative aspect-[1.586/1] [perspective:1000px]">
                  <div
                    className={`relative w-full h-full transition-transform duration-500 [transform-style:preserve-3d] ${isVisible ? "[transform:rotateY(180deg)]" : ""}`}
                  >
                    {/* Front of Card */}
                    <div
                      className={`absolute inset-0 rounded-lg p-4 text-white shadow-lg overflow-hidden [backface-visibility:hidden] ${getIdTypeGradient(card.idType)}`}
                    >
                      {/* Background Pattern */}
                      <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full translate-y-1/2 -translate-x-1/2" />
                      </div>

                      <div className="relative h-full flex flex-col justify-between">
                        {/* Top Section - ID Type & Icon */}
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-xs text-white/70 uppercase tracking-wider">
                              {idTypes.find(t => t.value === card.idType)?.label || "ID Card"}
                            </p>
                            <p className="text-sm font-semibold text-white/90 mt-0.5">{card.issuingAuthority || "Government"}</p>
                          </div>
                          <TypeIcon className="w-8 h-8 text-white/80" strokeWidth={1.5} />
                        </div>

                        {/* Middle - ID Number (Masked) */}
                        <div>
                          <p className="text-[10px] text-white/60 uppercase tracking-wider">ID Number</p>
                          <p className="font-mono text-lg tracking-[0.1em] text-white">
                            {maskIdNumber(card.idNumber)}
                          </p>
                        </div>

                        {/* Bottom - Name & Expiry */}
                        <div className="flex items-end justify-between">
                          <div>
                            <p className="text-[10px] text-white/60 uppercase tracking-wider">Full Name</p>
                            <p className="text-sm font-medium text-white tracking-wide uppercase">{card.fullName}</p>
                          </div>
                          {card.expiryDate && (
                            <div className="text-right">
                              <p className="text-[10px] text-white/60 uppercase tracking-wider">Expires</p>
                              <p className="text-sm font-medium text-white">{card.expiryDate}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Back of Card */}
                    <div
                      className={`absolute inset-0 rounded-lg p-4 text-white shadow-lg overflow-hidden [backface-visibility:hidden] [transform:rotateY(180deg)] ${getIdTypeGradient(card.idType)}`}
                    >
                      <div className="relative h-full flex flex-col">
                        {/* ID Number */}
                        <div className="mb-3">
                          <p className="text-[10px] text-white/60 uppercase tracking-wider">ID Number</p>
                          <p className="font-mono text-lg tracking-[0.1em] text-white">{card.idNumber}</p>
                        </div>

                        {/* Date of Birth */}
                        {card.dateOfBirth && (
                          <div className="mb-3">
                            <p className="text-[10px] text-white/60 uppercase tracking-wider">Date of Birth</p>
                            <p className="text-sm text-white">{card.dateOfBirth}</p>
                          </div>
                        )}

                        {/* Issue Date */}
                        {card.issueDate && (
                          <div className="mb-3">
                            <p className="text-[10px] text-white/60 uppercase tracking-wider">Issue Date</p>
                            <p className="text-sm text-white">{card.issueDate}</p>
                          </div>
                        )}

                        {/* Notes */}
                        {card.notes && (
                          <div className="mt-auto">
                            <p className="text-[10px] text-white/60 uppercase tracking-wider">Notes</p>
                            <p className="text-xs text-white/90 line-clamp-2">{card.notes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Info & Actions */}
                <div className="mt-3 flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-foreground text-sm">{card.name}</h3>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => toggleFavorite(card.id)}
                      className="p-2 rounded-md hover:bg-muted transition-colors"
                      aria-label={card.isFavorite ? "Remove from favorites" : "Add to favorites"}
                    >
                      <Heart 
                        className={`w-4 h-4 transition-colors ${card.isFavorite ? "fill-destructive text-destructive" : "text-muted-foreground"}`} 
                        strokeWidth={1.5} 
                      />
                    </button>
                    <button
                      onClick={() => toggleCardVisibility(card.id)}
                      className="p-2 rounded-md hover:bg-muted transition-colors"
                      aria-label={isVisible ? "Hide details" : "Show details"}
                    >
                      {isVisible ? (
                        <EyeOff className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
                      ) : (
                        <Eye className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
                      )}
                    </button>
                    <button
                      onClick={() => copyToClipboard(card.idNumber, card.id)}
                      className="p-2 rounded-md hover:bg-muted transition-colors"
                      aria-label="Copy ID number"
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
                          onClick={() => openEditDialog(card)}
                          className="p-2 rounded-md hover:bg-muted transition-colors"
                          aria-label="Edit ID card"
                        >
                          <Pencil className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
                        </button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Edit ID Card</DialogTitle>
                        </DialogHeader>
                        <IDCardForm
                          formData={formData}
                          setFormData={setFormData}
                          onSubmit={handleEditCard}
                          submitLabel="Save Changes"
                        />
                      </DialogContent>
                    </Dialog>
                    <button
                      onClick={() => handleDeleteCard(card.id)}
                      className="p-2 rounded-md hover:bg-muted transition-colors"
                      aria-label="Delete ID card"
                    >
                      <Trash2 className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

interface IDCardFormProps {
  formData: {
    name: string;
    idType: string;
    idNumber: string;
    fullName: string;
    dateOfBirth: string;
    issueDate: string;
    expiryDate: string;
    issuingAuthority: string;
    notes: string;
  };
  setFormData: React.Dispatch<React.SetStateAction<{
    name: string;
    idType: string;
    idNumber: string;
    fullName: string;
    dateOfBirth: string;
    issueDate: string;
    expiryDate: string;
    issuingAuthority: string;
    notes: string;
  }>>;
  onSubmit: () => void;
  submitLabel: string;
}

function IDCardForm({ formData, setFormData, onSubmit, submitLabel }: IDCardFormProps) {
  return (
    <div className="space-y-4 pt-4">
      <div className="space-y-2">
        <Label htmlFor="name">Card Name *</Label>
        <Input
          id="name"
          placeholder="e.g., My Driver's License"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="idType">ID Type</Label>
        <Select
          value={formData.idType}
          onValueChange={(value) => setFormData({ ...formData, idType: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {idTypes.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="idNumber">ID Number *</Label>
        <Input
          id="idNumber"
          placeholder="e.g., DL123456789"
          value={formData.idNumber}
          onChange={(e) => setFormData({ ...formData, idNumber: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="fullName">Full Name</Label>
        <Input
          id="fullName"
          placeholder="e.g., John Doe"
          value={formData.fullName}
          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="dateOfBirth">Date of Birth</Label>
          <Input
            id="dateOfBirth"
            placeholder="DD/MM/YYYY"
            value={formData.dateOfBirth}
            onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="expiryDate">Expiry Date</Label>
          <Input
            id="expiryDate"
            placeholder="DD/MM/YYYY"
            value={formData.expiryDate}
            onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="issueDate">Issue Date</Label>
        <Input
          id="issueDate"
          placeholder="DD/MM/YYYY"
          value={formData.issueDate}
          onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="issuingAuthority">Issuing Authority</Label>
        <Input
          id="issuingAuthority"
          placeholder="e.g., DMV, Government of India"
          value={formData.issuingAuthority}
          onChange={(e) => setFormData({ ...formData, issuingAuthority: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          placeholder="Any additional notes..."
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          rows={2}
        />
      </div>
      <Button onClick={onSubmit} className="w-full">
        {submitLabel}
      </Button>
    </div>
  );
}
