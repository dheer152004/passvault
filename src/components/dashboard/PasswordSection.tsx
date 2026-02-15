import { useState } from "react";
import { 
  Search, 
  Plus, 
  Eye, 
  EyeOff, 
  Copy, 
  Pencil, 
  Trash2,
  Globe,
  CreditCard,
  Mail,
  Smartphone,
  Key,
  Check,
  Tag,
  X,
  Heart
} from "lucide-react";
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

export interface Password {
  id: string;
  name: string;
  username: string;
  password: string;
  url: string;
  category: string;
  createdAt: string;
  isFavorite?: boolean;
  vaultId?: string;
}

export interface Category {
  value: string;
  label: string;
  icon: typeof Globe;
  isCustom?: boolean;
}

export const defaultCategories: Category[] = [
  { value: "social", label: "Social Media", icon: Globe },
  { value: "finance", label: "Finance", icon: CreditCard },
  { value: "email", label: "Email", icon: Mail },
  { value: "apps", label: "Apps", icon: Smartphone },
  { value: "other", label: "Other", icon: Key },
];

interface PasswordsSectionProps {
  passwords: Password[];
  setPasswords: React.Dispatch<React.SetStateAction<Password[]>>;
  customCategories: Category[];
  setCustomCategories: React.Dispatch<React.SetStateAction<Category[]>>;
  showFavoritesOnly?: boolean;
  activeVaultId?: string;
}

export function PasswordsSection({ 
  passwords, 
  setPasswords, 
  customCategories, 
  setCustomCategories,
  showFavoritesOnly = false,
  activeVaultId
}: PasswordsSectionProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [visiblePasswords, setVisiblePasswords] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingPassword, setEditingPassword] = useState<Password | null>(null);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  
  const allCategories = [...defaultCategories, ...customCategories];
  
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    password: "",
    url: "",
    category: "other",
    vaultId: undefined as string | undefined,
  });

  const filteredPasswords = passwords.filter((p) => {
    const matchesSearch = 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.username.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || p.category === selectedCategory;
    const matchesFavorite = !showFavoritesOnly || p.isFavorite;
    const matchesVault = !activeVaultId || p.vaultId === activeVaultId;
    return matchesSearch && matchesCategory && matchesFavorite && matchesVault;
  });

  const toggleFavorite = (id: string) => {
    const password = passwords.find(p => p.id === id);
    setPasswords(passwords.map(p => 
      p.id === id ? { ...p, isFavorite: !p.isFavorite } : p
    ));
    toast.success(password?.isFavorite ? "Removed from favorites" : "Added to favorites");
  };

  const togglePasswordVisibility = (id: string) => {
    setVisiblePasswords((prev) => {
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
    toast.success("Password copied to clipboard");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleAddPassword = () => {
    const newPassword: Password = {
      id: Date.now().toString(),
      ...formData,
      createdAt: new Date().toISOString().split("T")[0],
      isFavorite: false,
      vaultId: activeVaultId || formData.vaultId,
    };
    setPasswords([...passwords, newPassword]);
    setFormData({ name: "", username: "", password: "", url: "", category: "other", vaultId: undefined });
    setIsAddDialogOpen(false);
    toast.success("Password added successfully");
  };

  const handleEditPassword = () => {
    if (!editingPassword) return;
    setPasswords(
      passwords.map((p) =>
        p.id === editingPassword.id ? { ...editingPassword, ...formData } : p
      )
    );
    setEditingPassword(null);
    setFormData({ name: "", username: "", password: "", url: "", category: "other", vaultId: undefined });
    toast.success("Password updated successfully");
  };

  const handleDeletePassword = (id: string) => {
    setPasswords(passwords.filter((p) => p.id !== id));
    toast.success("Password deleted successfully");
  };

  const openEditDialog = (password: Password) => {
    setEditingPassword(password);
    setFormData({
      name: password.name,
      username: password.username,
      password: password.password,
      url: password.url,
      category: password.category,
      vaultId: password.vaultId,
    });
  };

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) {
      toast.error("Please enter a category name");
      return;
    }
    
    const value = newCategoryName.toLowerCase().replace(/\s+/g, "-");
    
    if (allCategories.some(c => c.value === value)) {
      toast.error("Category already exists");
      return;
    }
    
    const newCategory: Category = {
      value,
      label: newCategoryName.trim(),
      icon: Tag,
      isCustom: true,
    };
    
    const updatedCustomCategories = [...customCategories, newCategory];
    setCustomCategories(updatedCustomCategories);
    
    localStorage.setItem(
      "digilock_custom_categories",
      JSON.stringify(updatedCustomCategories.map(c => ({ value: c.value, label: c.label })))
    );
    
    setNewCategoryName("");
    toast.success("Category created successfully");
  };

  const handleDeleteCategory = (categoryValue: string) => {
    const updatedCustomCategories = customCategories.filter(c => c.value !== categoryValue);
    setCustomCategories(updatedCustomCategories);
    
    localStorage.setItem(
      "digilock_custom_categories",
      JSON.stringify(updatedCustomCategories.map(c => ({ value: c.value, label: c.label })))
    );
    
    setPasswords(passwords.map(p => 
      p.category === categoryValue ? { ...p, category: "other" } : p
    ));
    
    if (selectedCategory === categoryValue) {
      setSelectedCategory("all");
    }
    
    toast.success("Category deleted");
  };

  const getCategoryIcon = (category: string) => {
    const cat = allCategories.find((c) => c.value === category);
    return cat ? cat.icon : Key;
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Passwords</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your saved passwords
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" strokeWidth={1.5} />
              Add Password
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Password</DialogTitle>
            </DialogHeader>
            <PasswordForm
              formData={formData}
              setFormData={setFormData}
              onSubmit={handleAddPassword}
              submitLabel="Add Password"
              categories={allCategories}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
          <Input
            placeholder="Search passwords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {allCategories.map((cat) => (
              <SelectItem key={cat.value} value={cat.value}>
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="icon">
              <Tag className="w-4 h-4" strokeWidth={1.5} />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Manage Categories</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="flex gap-2">
                <Input
                  placeholder="New category name..."
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddCategory()}
                />
                <Button onClick={handleAddCategory}>
                  <Plus className="w-4 h-4" strokeWidth={1.5} />
                </Button>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Default Categories</p>
                {defaultCategories.map((cat) => {
                  const Icon = cat.icon;
                  return (
                    <div key={cat.value} className="flex items-center gap-3 p-2 bg-muted/30 rounded-lg">
                      <Icon className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
                      <span className="text-sm text-foreground">{cat.label}</span>
                    </div>
                  );
                })}
              </div>
              
              {customCategories.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Custom Categories</p>
                  {customCategories.map((cat) => {
                    const Icon = cat.icon;
                    return (
                      <div key={cat.value} className="flex items-center justify-between gap-3 p-2 bg-muted/30 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Icon className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
                          <span className="text-sm text-foreground">{cat.label}</span>
                        </div>
                        <button
                          onClick={() => handleDeleteCategory(cat.value)}
                          className="p-1 rounded hover:bg-destructive/10 transition-colors"
                          aria-label="Delete category"
                        >
                          <X className="w-4 h-4 text-destructive" strokeWidth={1.5} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Password List */}
      <div className="space-y-3">
        {filteredPasswords.length === 0 ? (
          <div className="text-center py-12 bg-muted/30 rounded-lg border border-border">
            <Key className="w-12 h-12 mx-auto text-muted-foreground mb-4" strokeWidth={1.5} />
            <p className="text-muted-foreground">No passwords found</p>
          </div>
        ) : (
          filteredPasswords.map((password) => {
            const CategoryIcon = getCategoryIcon(password.category);
            const isVisible = visiblePasswords.has(password.id);
            const isCopied = copiedId === password.id;

            return (
              <div
                key={password.id}
                className="bg-background border border-border rounded-lg p-4 hover:border-primary/30 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                    <CategoryIcon className="w-5 h-5 text-muted-foreground" strokeWidth={1.5} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-medium text-foreground">{password.name}</h3>
                        <p className="text-sm text-muted-foreground">{password.username}</p>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => toggleFavorite(password.id)}
                          className="p-2 rounded-md hover:bg-muted transition-colors"
                          aria-label={password.isFavorite ? "Remove from favorites" : "Add to favorites"}
                        >
                          <Heart 
                            className={`w-4 h-4 transition-colors ${password.isFavorite ? "fill-destructive text-destructive" : "text-muted-foreground"}`} 
                            strokeWidth={1.5} 
                          />
                        </button>
                        <button
                          onClick={() => togglePasswordVisibility(password.id)}
                          className="p-2 rounded-md hover:bg-muted transition-colors"
                          aria-label={isVisible ? "Hide password" : "Show password"}
                        >
                          {isVisible ? (
                            <EyeOff className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
                          ) : (
                            <Eye className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
                          )}
                        </button>
                        <button
                          onClick={() => copyToClipboard(password.password, password.id)}
                          className="p-2 rounded-md hover:bg-muted transition-colors"
                          aria-label="Copy password"
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
                              onClick={() => openEditDialog(password)}
                              className="p-2 rounded-md hover:bg-muted transition-colors"
                              aria-label="Edit password"
                            >
                              <Pencil className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
                            </button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Edit Password</DialogTitle>
                            </DialogHeader>
                            <PasswordForm
                              formData={formData}
                              setFormData={setFormData}
                              onSubmit={handleEditPassword}
                              submitLabel="Save Changes"
                              categories={allCategories}
                            />
                          </DialogContent>
                        </Dialog>
                        <button
                          onClick={() => handleDeletePassword(password.id)}
                          className="p-2 rounded-md hover:bg-muted transition-colors"
                          aria-label="Delete password"
                        >
                          <Trash2 className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
                        </button>
                      </div>
                    </div>
                    
                    <div className="mt-2">
                      <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
                        {isVisible ? password.password : "••••••••••••"}
                      </code>
                    </div>
                    
                    {password.url && (
                      <a
                        href={password.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline mt-2 inline-block"
                      >
                        {password.url}
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
        <div className="bg-muted/30 border border-border rounded-lg p-4 text-center">
          <p className="text-2xl font-semibold text-foreground">{passwords.length}</p>
          <p className="text-sm text-muted-foreground">Total Passwords</p>
        </div>
        {allCategories.slice(0, 3).map((cat) => {
          const count = passwords.filter((p) => p.category === cat.value).length;
          return (
            <div key={cat.value} className="bg-muted/30 border border-border rounded-lg p-4 text-center">
              <p className="text-2xl font-semibold text-foreground">{count}</p>
              <p className="text-sm text-muted-foreground">{cat.label}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface PasswordFormProps {
  formData: {
    name: string;
    username: string;
    password: string;
    url: string;
    category: string;
    vaultId?: string;
  };
  setFormData: React.Dispatch<React.SetStateAction<{
    name: string;
    username: string;
    password: string;
    url: string;
    category: string;
    vaultId?: string;
  }>>;
  onSubmit: () => void;
  submitLabel: string;
  categories: Category[];
}

function PasswordForm({ formData, setFormData, onSubmit, submitLabel, categories }: PasswordFormProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="space-y-4 pt-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          placeholder="e.g., Google Account"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="username">Username / Email</Label>
        <Input
          id="username"
          placeholder="e.g., john@example.com"
          value={formData.username}
          onChange={(e) => setFormData({ ...formData, username: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Enter password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4" strokeWidth={1.5} />
            ) : (
              <Eye className="w-4 h-4" strokeWidth={1.5} />
            )}
          </button>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="url">Website URL (optional)</Label>
        <Input
          id="url"
          placeholder="https://example.com"
          value={formData.url}
          onChange={(e) => setFormData({ ...formData, url: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="category">Category</Label>
        <Select
          value={formData.category}
          onValueChange={(value) => setFormData({ ...formData, category: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat.value} value={cat.value}>
                {cat.label}
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
