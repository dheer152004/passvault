import { useState } from "react";
import { Plus, CreditCard, Pencil, Trash2, Search, Heart, Eye, EyeOff, Copy, Check } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { VaultSelect } from "./VaultSelect";

export interface Card {
  id: string;
  name: string;
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardholderName: string;
  cardType: string;
  createdAt: string;
  isFavorite?: boolean;
  vaultId?: string;
}

interface CardsSectionProps {
  cards: Card[];
  setCards: React.Dispatch<React.SetStateAction<Card[]>>;
  showFavoritesOnly?: boolean;
  activeVaultId?: string;
}

const cardTypes = [
  { value: "visa", label: "Visa" },
  { value: "mastercard", label: "Mastercard" },
  { value: "amex", label: "American Express" },
  { value: "discover", label: "Discover" },
  { value: "other", label: "Other" },
];

// Card Brand Logo Components
const VisaLogo = () => (
  <svg viewBox="0 0 48 16" className="h-6 w-auto">
    <text x="0" y="13" fill="white" fontFamily="Arial" fontWeight="bold" fontSize="14" fontStyle="italic">VISA</text>
  </svg>
);

const MastercardLogo = () => (
  <svg viewBox="0 0 40 24" className="h-6 w-auto">
    <circle cx="12" cy="12" r="10" fill="#EB001B" />
    <circle cx="28" cy="12" r="10" fill="#F79E1B" />
    <path d="M20 4.5a10 10 0 0 0 0 15 10 10 0 0 0 0-15z" fill="#FF5F00" />
  </svg>
);

const AmexLogo = () => (
  <svg viewBox="0 0 48 16" className="h-5 w-auto">
    <text x="0" y="12" fill="white" fontFamily="Arial" fontWeight="bold" fontSize="10">AMEX</text>
  </svg>
);

const DiscoverLogo = () => (
  <svg viewBox="0 0 60 16" className="h-5 w-auto">
    <text x="0" y="12" fill="white" fontFamily="Arial" fontWeight="bold" fontSize="10">DISCOVER</text>
  </svg>
);

const CardLogo = ({ type }: { type: string }) => {
  switch (type) {
    case "visa":
      return <VisaLogo />;
    case "mastercard":
      return <MastercardLogo />;
    case "amex":
      return <AmexLogo />;
    case "discover":
      return <DiscoverLogo />;
    default:
      return <CreditCard className="w-6 h-6 text-white/80" strokeWidth={1.5} />;
  }
};

export function CardsSection({ cards, setCards, showFavoritesOnly = false, activeVaultId }: CardsSectionProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<Card | null>(null);
  const [visibleCards, setVisibleCards] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardholderName: "",
    cardType: "visa",
    vaultId: undefined as string | undefined,
  });

  const filteredCards = cards.filter((c) => {
    const matchesSearch = 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.cardholderName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFavorite = !showFavoritesOnly || c.isFavorite;
    const matchesVault = !activeVaultId || c.vaultId === activeVaultId;
    return matchesSearch && matchesFavorite && matchesVault;
  });

  const handleAddCard = () => {
    if (!formData.name.trim() || !formData.cardNumber.trim()) {
      toast.error("Please fill in required fields");
      return;
    }
    const newCard: Card = {
      id: Date.now().toString(),
      ...formData,
      createdAt: new Date().toISOString().split("T")[0],
      isFavorite: false,
      vaultId: activeVaultId || formData.vaultId,
    };
    setCards([...cards, newCard]);
    setFormData({ name: "", cardNumber: "", expiryDate: "", cvv: "", cardholderName: "", cardType: "visa", vaultId: undefined });
    setIsAddDialogOpen(false);
    toast.success("Card added successfully");
  };

  const handleEditCard = () => {
    if (!editingCard) return;
    setCards(
      cards.map((c) =>
        c.id === editingCard.id ? { ...c, ...formData } : c
      )
    );
    setEditingCard(null);
    setFormData({ name: "", cardNumber: "", expiryDate: "", cvv: "", cardholderName: "", cardType: "visa", vaultId: undefined });
    toast.success("Card updated successfully");
  };

  const handleDeleteCard = (id: string) => {
    setCards(cards.filter((c) => c.id !== id));
    toast.success("Card deleted successfully");
  };

  const toggleFavorite = (id: string) => {
    const card = cards.find(c => c.id === id);
    setCards(cards.map(c => 
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
    toast.success("Card number copied to clipboard");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const openEditDialog = (card: Card) => {
    setEditingCard(card);
    setFormData({
      name: card.name,
      cardNumber: card.cardNumber,
      expiryDate: card.expiryDate,
      cvv: card.cvv,
      cardholderName: card.cardholderName,
      cardType: card.cardType,
      vaultId: card.vaultId,
    });
  };

  const maskCardNumber = (number: string) => {
    return `•••• •••• •••• ${number.slice(-4)}`;
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Payment Cards</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Securely store your payment cards
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" strokeWidth={1.5} />
              Add Card
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Card</DialogTitle>
            </DialogHeader>
            <CardForm
              formData={formData}
              setFormData={setFormData}
              onSubmit={handleAddCard}
              submitLabel="Add Card"
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
        <Input
          placeholder="Search cards..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredCards.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-muted/30 rounded-lg border border-border">
            <CreditCard className="w-12 h-12 mx-auto text-muted-foreground mb-4" strokeWidth={1.5} />
            <p className="text-muted-foreground">No cards found</p>
          </div>
        ) : (
          filteredCards.map((card) => {
            const isVisible = visibleCards.has(card.id);
            const isCopied = copiedId === card.id;

            const cardGradients: Record<string, string> = {
              visa: "bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900",
              mastercard: "bg-gradient-to-br from-orange-500 via-red-600 to-red-800",
              amex: "bg-gradient-to-br from-slate-600 via-slate-700 to-slate-900",
              discover: "bg-gradient-to-br from-amber-500 via-orange-600 to-orange-800",
              other: "bg-gradient-to-br from-gray-600 via-gray-700 to-gray-900",
            };

            return (
              <div
                key={card.id}
                className="bg-card border border-border rounded-xl p-4 hover:border-primary/30 transition-colors"
              >
                {/* Card Visual with Flip Animation */}
                <div className="relative aspect-[1.586/1] [perspective:1000px]">
                  <div
                    className={`relative w-full h-full transition-transform duration-500 [transform-style:preserve-3d] ${isVisible ? "[transform:rotateY(180deg)]" : ""}`}
                  >
                    {/* Front of Card */}
                    <div
                      className={`absolute inset-0 rounded-lg p-4 text-white shadow-lg overflow-hidden [backface-visibility:hidden] ${cardGradients[card.cardType] || cardGradients.other}`}
                    >
                      {/* Card Background Pattern */}
                      <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full translate-y-1/2 -translate-x-1/2" />
                      </div>

                      {/* Card Content */}
                      <div className="relative h-full flex flex-col justify-between">
                        {/* Top Section - Card Logo & Chip */}
                        <div className="flex items-start justify-between">
                          <CardLogo type={card.cardType} />
                          {/* Chip */}
                          <div className="w-10 h-7 rounded bg-gradient-to-br from-yellow-300 via-yellow-400 to-yellow-600 opacity-90" />
                        </div>

                        {/* Middle Section - Card Number (Masked) */}
                        <div>
                          <p className="font-mono text-lg md:text-xl tracking-[0.15em] text-white">
                            {maskCardNumber(card.cardNumber)}
                          </p>
                        </div>

                        {/* Bottom Section - Cardholder & Expiry */}
                        <div className="flex items-end justify-between">
                          <div>
                            <p className="text-[10px] text-white/60 uppercase tracking-wider">Card Holder</p>
                            <p className="text-sm font-medium text-white tracking-wide uppercase">{card.cardholderName}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] text-white/60 uppercase tracking-wider">Expires</p>
                            <p className="text-sm font-medium text-white">{card.expiryDate}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Back of Card */}
                    <div
                      className={`absolute inset-0 rounded-lg text-white shadow-lg overflow-hidden [backface-visibility:hidden] [transform:rotateY(180deg)] ${cardGradients[card.cardType] || cardGradients.other}`}
                    >
                      {/* Magnetic Strip */}
                      <div className="w-full h-10 bg-black/80 mt-4" />
                      
                      {/* Signature Strip & CVV */}
                      <div className="px-4 mt-6">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-10 bg-white/90 rounded flex items-center justify-end px-3">
                            <p className="font-mono text-gray-800 italic text-sm">{card.cardholderName}</p>
                          </div>
                          <div className="bg-white/90 rounded px-3 py-2">
                            <p className="text-[10px] text-gray-500 uppercase tracking-wider">CVV</p>
                            <p className="font-mono text-gray-800 font-bold text-lg">{card.cvv}</p>
                          </div>
                        </div>
                      </div>

                      {/* Full Card Number */}
                      <div className="px-4 mt-6">
                        <p className="text-[10px] text-white/60 uppercase tracking-wider mb-1">Card Number</p>
                        <p className="font-mono text-lg tracking-[0.15em] text-white">
                          {card.cardNumber.replace(/(.{4})/g, '$1 ').trim()}
                        </p>
                      </div>

                      {/* Card Logo */}
                      <div className="absolute bottom-4 right-4">
                        <CardLogo type={card.cardType} />
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
                      aria-label={isVisible ? "Hide card number" : "Show card number"}
                    >
                      {isVisible ? (
                        <EyeOff className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
                      ) : (
                        <Eye className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
                      )}
                    </button>
                    <button
                      onClick={() => copyToClipboard(card.cardNumber, card.id)}
                      className="p-2 rounded-md hover:bg-muted transition-colors"
                      aria-label="Copy card number"
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
                          aria-label="Edit card"
                        >
                          <Pencil className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
                        </button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Edit Card</DialogTitle>
                        </DialogHeader>
                        <CardForm
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
                      aria-label="Delete card"
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

interface CardFormProps {
  formData: {
    name: string;
    cardNumber: string;
    expiryDate: string;
    cvv: string;
    cardholderName: string;
    cardType: string;
    vaultId: string | undefined;
  };
  setFormData: React.Dispatch<React.SetStateAction<{
    name: string;
    cardNumber: string;
    expiryDate: string;
    cvv: string;
    cardholderName: string;
    cardType: string;
    vaultId: string | undefined;
  }>>;
  onSubmit: () => void;
  submitLabel: string;
}

function CardForm({ formData, setFormData, onSubmit, submitLabel }: CardFormProps) {
  const [showCvv, setShowCvv] = useState(false);

  return (
    <div className="space-y-4 pt-4">
      <div className="space-y-2">
        <Label htmlFor="name">Card Name</Label>
        <Input
          id="name"
          placeholder="e.g., Personal Visa"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="cardholderName">Cardholder Name</Label>
        <Input
          id="cardholderName"
          placeholder="e.g., John Doe"
          value={formData.cardholderName}
          onChange={(e) => setFormData({ ...formData, cardholderName: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="cardNumber">Card Number</Label>
        <Input
          id="cardNumber"
          placeholder="1234 5678 9012 3456"
          value={formData.cardNumber}
          onChange={(e) => setFormData({ ...formData, cardNumber: e.target.value })}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="expiryDate">Expiry Date</Label>
          <Input
            id="expiryDate"
            placeholder="MM/YY"
            value={formData.expiryDate}
            onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="cvv">CVV</Label>
          <div className="relative">
            <Input
              id="cvv"
              type={showCvv ? "text" : "password"}
              placeholder="123"
              value={formData.cvv}
              onChange={(e) => setFormData({ ...formData, cvv: e.target.value })}
            />
            <button
              type="button"
              onClick={() => setShowCvv(!showCvv)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showCvv ? (
                <EyeOff className="w-4 h-4" strokeWidth={1.5} />
              ) : (
                <Eye className="w-4 h-4" strokeWidth={1.5} />
              )}
            </button>
          </div>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="cardType">Card Type</Label>
        <Select
          value={formData.cardType}
          onValueChange={(value) => setFormData({ ...formData, cardType: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {cardTypes.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <VaultSelect
        value={formData.vaultId}
        onChange={(value) => setFormData({ ...formData, vaultId: value })}
      />
      <Button onClick={onSubmit} className="w-full">
        {submitLabel}
      </Button>
    </div>
  );
}

