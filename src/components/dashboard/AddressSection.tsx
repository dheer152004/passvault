import { useState } from "react";
import { Plus, MapPin, Pencil, Trash2, Search, Heart, Copy, Check } from "lucide-react";
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

export interface Address {
  id: string;
  name: string;
  fullName: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone?: string;
  createdAt: string;
  isFavorite?: boolean;
}

interface AddressesSectionProps {
  addresses: Address[];
  setAddresses: React.Dispatch<React.SetStateAction<Address[]>>;
  showFavoritesOnly?: boolean;
}

export function AddressesSection({ addresses, setAddresses, showFavoritesOnly = false }: AddressesSectionProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    fullName: "",
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
    phone: "",
  });

  const filteredAddresses = addresses.filter((a) => {
    const matchesSearch = 
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.city.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFavorite = !showFavoritesOnly || a.isFavorite;
    return matchesSearch && matchesFavorite;
  });

  const handleAddAddress = () => {
    if (!formData.name.trim() || !formData.street.trim()) {
      toast.error("Please fill in required fields");
      return;
    }
    const newAddress: Address = {
      id: Date.now().toString(),
      ...formData,
      createdAt: new Date().toISOString().split("T")[0],
      isFavorite: false,
    };
    setAddresses([...addresses, newAddress]);
    setFormData({ name: "", fullName: "", street: "", city: "", state: "", zipCode: "", country: "", phone: "" });
    setIsAddDialogOpen(false);
    toast.success("Address added successfully");
  };

  const handleEditAddress = () => {
    if (!editingAddress) return;
    setAddresses(
      addresses.map((a) =>
        a.id === editingAddress.id ? { ...a, ...formData } : a
      )
    );
    setEditingAddress(null);
    setFormData({ name: "", fullName: "", street: "", city: "", state: "", zipCode: "", country: "", phone: "" });
    toast.success("Address updated successfully");
  };

  const handleDeleteAddress = (id: string) => {
    setAddresses(addresses.filter((a) => a.id !== id));
    toast.success("Address deleted successfully");
  };

  const toggleFavorite = (id: string) => {
    const address = addresses.find(a => a.id === id);
    setAddresses(addresses.map(a => 
      a.id === id ? { ...a, isFavorite: !a.isFavorite } : a
    ));
    toast.success(address?.isFavorite ? "Removed from favorites" : "Added to favorites");
  };

  const copyToClipboard = async (address: Address) => {
    const fullAddress = `${address.fullName}\n${address.street}\n${address.city}, ${address.state} ${address.zipCode}\n${address.country}`;
    await navigator.clipboard.writeText(fullAddress);
    setCopiedId(address.id);
    toast.success("Address copied to clipboard");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const openEditDialog = (address: Address) => {
    setEditingAddress(address);
    setFormData({
      name: address.name,
      fullName: address.fullName,
      street: address.street,
      city: address.city,
      state: address.state,
      zipCode: address.zipCode,
      country: address.country,
      phone: address.phone || "",
    });
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Addresses</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Store addresses for quick autofill
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" strokeWidth={1.5} />
              Add Address
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Address</DialogTitle>
            </DialogHeader>
            <AddressForm
              formData={formData}
              setFormData={setFormData}
              onSubmit={handleAddAddress}
              submitLabel="Add Address"
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
        <Input
          placeholder="Search addresses..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Addresses List */}
      <div className="space-y-3">
        {filteredAddresses.length === 0 ? (
          <div className="text-center py-12 bg-muted/30 rounded-lg border border-border">
            <MapPin className="w-12 h-12 mx-auto text-muted-foreground mb-4" strokeWidth={1.5} />
            <p className="text-muted-foreground">No addresses found</p>
          </div>
        ) : (
          filteredAddresses.map((address) => {
            const isCopied = copiedId === address.id;

            return (
              <div
                key={address.id}
                className="bg-background border border-border rounded-lg p-4 hover:border-primary/30 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-muted-foreground" strokeWidth={1.5} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-medium text-foreground">{address.name}</h3>
                        <p className="text-sm text-muted-foreground">{address.fullName}</p>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => toggleFavorite(address.id)}
                          className="p-2 rounded-md hover:bg-muted transition-colors"
                          aria-label={address.isFavorite ? "Remove from favorites" : "Add to favorites"}
                        >
                          <Heart 
                            className={`w-4 h-4 transition-colors ${address.isFavorite ? "fill-destructive text-destructive" : "text-muted-foreground"}`} 
                            strokeWidth={1.5} 
                          />
                        </button>
                        <button
                          onClick={() => copyToClipboard(address)}
                          className="p-2 rounded-md hover:bg-muted transition-colors"
                          aria-label="Copy address"
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
                              onClick={() => openEditDialog(address)}
                              className="p-2 rounded-md hover:bg-muted transition-colors"
                              aria-label="Edit address"
                            >
                              <Pencil className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
                            </button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Edit Address</DialogTitle>
                            </DialogHeader>
                            <AddressForm
                              formData={formData}
                              setFormData={setFormData}
                              onSubmit={handleEditAddress}
                              submitLabel="Save Changes"
                            />
                          </DialogContent>
                        </Dialog>
                        <button
                          onClick={() => handleDeleteAddress(address.id)}
                          className="p-2 rounded-md hover:bg-muted transition-colors"
                          aria-label="Delete address"
                        >
                          <Trash2 className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
                        </button>
                      </div>
                    </div>
                    
                    <div className="mt-2 text-sm text-muted-foreground">
                      <p>{address.street}</p>
                      <p>{address.city}, {address.state} {address.zipCode}</p>
                      <p>{address.country}</p>
                    </div>
                    
                    {address.phone && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Phone: {address.phone}
                      </p>
                    )}
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

interface AddressFormProps {
  formData: {
    name: string;
    fullName: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    phone: string;
  };
  setFormData: React.Dispatch<React.SetStateAction<{
    name: string;
    fullName: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    phone: string;
  }>>;
  onSubmit: () => void;
  submitLabel: string;
}

function AddressForm({ formData, setFormData, onSubmit, submitLabel }: AddressFormProps) {
  return (
    <div className="space-y-4 pt-4">
      <div className="space-y-2">
        <Label htmlFor="name">Address Label</Label>
        <Input
          id="name"
          placeholder="e.g., Home, Work"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
      <div className="space-y-2">
        <Label htmlFor="street">Street Address</Label>
        <Input
          id="street"
          placeholder="e.g., 123 Main St"
          value={formData.street}
          onChange={(e) => setFormData({ ...formData, street: e.target.value })}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="city">City</Label>
          <Input
            id="city"
            placeholder="e.g., New York"
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="state">State</Label>
          <Input
            id="state"
            placeholder="e.g., NY"
            value={formData.state}
            onChange={(e) => setFormData({ ...formData, state: e.target.value })}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="zipCode">Zip Code</Label>
          <Input
            id="zipCode"
            placeholder="e.g., 10001"
            value={formData.zipCode}
            onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="country">Country</Label>
          <Input
            id="country"
            placeholder="e.g., USA"
            value={formData.country}
            onChange={(e) => setFormData({ ...formData, country: e.target.value })}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone">Phone (optional)</Label>
        <Input
          id="phone"
          placeholder="e.g., +1 234 567 8900"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
        />
      </div>
      <Button onClick={onSubmit} className="w-full">
        {submitLabel}
      </Button>
    </div>
  );
}
