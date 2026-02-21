import { useState, useEffect } from "react";
import { Users, Plus, Search, Trash2, Send, User, Key, FileText, CreditCard, MapPin, Inbox, Clock, CheckCircle, Loader2, Shield, Terminal, Bitcoin, Building2, Package, IdCard, Eye, Copy, Lock, LockOpen } from "lucide-react";
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useSharing, RecipientInfo, SharedItem } from "@/hooks/useSharing";
import { Password } from "./PasswordSection";
import { Note } from "./NotesSection";
import { Card } from "./CardSection";
import { Address } from "./AddressSection";
import { TOTP } from "./TOTPSection";
import { IDCard } from "./IDCardSection";
import { SSHKey } from "./SSHKeysSection";
import { CryptoWallet } from "./CryptoSection";
import { BankAccount } from "./BankInfoSection";
import { SoftwareLicense } from "./SoftwareLicensesSection";

import type { LucideIcon } from "lucide-react";

const typeIcons: Record<string, LucideIcon> = {
  password: Key,
  note: FileText,
  card: CreditCard,
  address: MapPin,
  totp: Shield,
  idcard: IdCard,
  sshkey: Terminal,
  crypto: Bitcoin,
  bank: Building2,
  software: Package,
};

const typeLabels: Record<string, string> = {
  password: "Password",
  note: "Secure Note",
  card: "Payment Card",
  address: "Address",
  totp: "TOTP Code",
  idcard: "ID Card",
  sshkey: "SSH Key",
  crypto: "Crypto Wallet",
  bank: "Bank Account",
  software: "Software License",
};

type ShareableItemType = "password" | "note" | "card" | "address" | "totp" | "idcard" | "sshkey" | "crypto" | "bank" | "software";

interface ShareSectionProps {
  passwords: Password[];
  notes: Note[];
  cards: Card[];
  addresses: Address[];
  totps: TOTP[];
  idCards: IDCard[];
  sshKeys: SSHKey[];
  cryptoWallets: CryptoWallet[];
  bankAccounts: BankAccount[];
  softwareLicenses: SoftwareLicense[];
}

export function ShareSection({
  passwords,
  notes,
  cards,
  addresses,
  totps,
  idCards,
  sshKeys,
  cryptoWallets,
  bankAccounts,
  softwareLicenses,
}: ShareSectionProps) {
  const {
    isLoading,
    sentItems,
    receivedItems,
    newShareCount,
    findRecipient,
    shareItem,
    fetchSentItems,
    fetchReceivedItems,
    revokeShare,
    acceptShare,
    decryptSharedItem,
    clearNewShareCount
  } = useSharing();

  const [searchQuery, setSearchQuery] = useState("");
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [isSearchingRecipient, setIsSearchingRecipient] = useState(false);
  const [recipientInfo, setRecipientInfo] = useState<RecipientInfo | null>(null);
  const [shareForm, setShareForm] = useState({
    type: "password" as ShareableItemType,
    itemId: "",
    recipient: "",
    expiresIn: "never",
    sharePassword: "",
    shareKeyHint: "",
    usePassword: false,
  });
  
  // State for viewing shared item content
  const [viewingItem, setViewingItem] = useState<SharedItem | null>(null);
  const [viewPassword, setViewPassword] = useState("");
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [decryptedContent, setDecryptedContent] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    fetchSentItems();
    fetchReceivedItems();
  }, [fetchSentItems, fetchReceivedItems]);

  const getItemsForType = (type: string) => {
    switch (type) {
      case "password":
        return passwords.map((p) => ({ id: p.id, name: p.name, data: p }));
      case "note":
        return notes.map((n) => ({ id: n.id, name: n.title, data: n }));
      case "card":
        return cards.map((c) => ({ id: c.id, name: c.name, data: c }));
      case "address":
        return addresses.map((a) => ({ id: a.id, name: a.name, data: a }));
      case "totp":
        return totps.map((t) => ({ id: t.id, name: t.name, data: t }));
      case "idcard":
        return idCards.map((c) => ({ id: c.id, name: c.name, data: c }));
      case "sshkey":
        return sshKeys.map((k) => ({ id: k.id, name: k.name, data: k }));
      case "crypto":
        return cryptoWallets.map((w) => ({ id: w.id, name: w.name, data: w }));
      case "bank":
        return bankAccounts.map((a) => ({ id: a.id, name: a.name, data: a }));
      case "software":
        return softwareLicenses.map((l) => ({ id: l.id, name: l.name, data: l }));
      default:
        return [];
    }
  };

  const handleSearchRecipient = async () => {
    if (!shareForm.recipient.trim()) {
      toast.error("Please enter a username or email");
      return;
    }

    setIsSearchingRecipient(true);
    const result = await findRecipient(shareForm.recipient);
    setIsSearchingRecipient(false);

    if (result) {
      setRecipientInfo(result);
      toast.success(`Found user: ${result.displayName || result.username || 'User'}`);
    } else {
      setRecipientInfo(null);
      toast.error("User not found. Make sure they have an account.");
    }
  };

  const handleShare = async () => {
    if (!recipientInfo || !shareForm.itemId) {
      toast.error("Please select a recipient and an item");
      return;
    }

    const items = getItemsForType(shareForm.type);
    const selectedItem = items.find((i) => i.id === shareForm.itemId);

    if (!selectedItem) {
      toast.error("Selected item not found");
      return;
    }

    // Convert item data to a plain object for sharing
    const itemData: Record<string, unknown> = { ...selectedItem.data };

    const expiresInDays = shareForm.expiresIn !== "never" 
      ? parseInt(shareForm.expiresIn) 
      : undefined;

    const success = await shareItem(
      shareForm.type,
      shareForm.itemId,
      selectedItem.name,
      itemData,
      recipientInfo.userId,
      shareForm.usePassword ? shareForm.sharePassword : undefined,
      shareForm.usePassword ? (shareForm.shareKeyHint || undefined) : undefined,
      expiresInDays
    );

    if (success) {
      setShareForm({ type: "password", itemId: "", recipient: "", expiresIn: "never", sharePassword: "", shareKeyHint: "", usePassword: false });
      setRecipientInfo(null);
      setIsShareDialogOpen(false);
    }
  };

  const isPasswordProtected = (item: SharedItem) => {
    return !item.encryptedData.startsWith('NOPASS:');
  };

  const handleViewContent = async (skipPassword = false) => {
    if (!viewingItem) return;
    
    // For non-password-protected items, decrypt immediately
    if (!isPasswordProtected(viewingItem) || skipPassword) {
      setIsDecrypting(true);
      const content = await decryptSharedItem(viewingItem.encryptedData);
      setIsDecrypting(false);

      if (content) {
        setDecryptedContent(content);
      } else {
        toast.error("Failed to decode content");
      }
      return;
    }

    // For password-protected items
    if (!viewPassword) {
      toast.error("Please enter the share password");
      return;
    }

    setIsDecrypting(true);
    const content = await decryptSharedItem(viewingItem.encryptedData, viewPassword);
    setIsDecrypting(false);

    if (content) {
      setDecryptedContent(content);
      toast.success("Content decrypted successfully");
    } else {
      toast.error("Incorrect password or decryption failed");
    }
  };

  // Auto-decrypt when opening non-password-protected items
  useEffect(() => {
    if (viewingItem && !isPasswordProtected(viewingItem) && !decryptedContent) {
      handleViewContent(true);
    }
  }, [viewingItem]);

  const closeViewDialog = () => {
    setViewingItem(null);
    setViewPassword("");
    setDecryptedContent(null);
  };

  const handleRevokeShare = async (id: string) => {
    await revokeShare(id);
  };

  const handleAcceptShare = async (id: string) => {
    await acceptShare(id);
  };

  const filteredSentItems = sentItems.filter(
    (item) =>
      item.itemName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredReceivedItems = receivedItems.filter(
    (item) =>
      item.itemName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const isExpired = (expiresAt?: string) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
            <Users className="w-5 h-5" strokeWidth={1.5} />
            Family Sharing
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Share credentials securely with other users
          </p>
        </div>
        <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" strokeWidth={1.5} />
              Share Item
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Share with User</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              {/* Find Recipient */}
              <div className="space-y-2">
                <Label>Find User (Username or Email)</Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <User
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
                      strokeWidth={1.5}
                    />
                    <Input
                      type="text"
                      value={shareForm.recipient}
                      onChange={(e) => {
                        setShareForm({ ...shareForm, recipient: e.target.value });
                        setRecipientInfo(null);
                      }}
                      className="pl-10"
                      placeholder="username or email@example.com"
                    />
                  </div>
                  <Button 
                    variant="secondary" 
                    onClick={handleSearchRecipient}
                    disabled={isSearchingRecipient}
                  >
                    {isSearchingRecipient ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Search className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                {recipientInfo && (
                  <div className="flex items-center gap-2 p-2 bg-primary/10 rounded-lg text-sm">
                    <CheckCircle className="w-4 h-4 text-primary" />
                    <span>
                      Sharing with: <strong>{recipientInfo.displayName || recipientInfo.username || 'User'}</strong>
                      {recipientInfo.username && ` (@${recipientInfo.username})`}
                    </span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>Item Type</Label>
                <Select
                  value={shareForm.type}
                  onValueChange={(value: ShareableItemType) =>
                    setShareForm({ ...shareForm, type: value, itemId: "" })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="password">Password</SelectItem>
                    <SelectItem value="note">Secure Note</SelectItem>
                    <SelectItem value="card">Payment Card</SelectItem>
                    <SelectItem value="address">Address</SelectItem>
                    <SelectItem value="totp">TOTP Code</SelectItem>
                    <SelectItem value="idcard">ID Card</SelectItem>
                    <SelectItem value="sshkey">SSH Key</SelectItem>
                    <SelectItem value="crypto">Crypto Wallet</SelectItem>
                    <SelectItem value="bank">Bank Account</SelectItem>
                    <SelectItem value="software">Software License</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Select Item</Label>
                <Select
                  value={shareForm.itemId}
                  onValueChange={(value) =>
                    setShareForm({ ...shareForm, itemId: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose an item to share" />
                  </SelectTrigger>
                  <SelectContent>
                    {getItemsForType(shareForm.type).map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Password Protection Toggle */}
              <div 
                className={cn(
                  "flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors",
                  shareForm.usePassword ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground/50"
                )}
                onClick={() => setShareForm({ ...shareForm, usePassword: !shareForm.usePassword, sharePassword: "", shareKeyHint: "" })}
              >
                <div className="flex items-center gap-3">
                  {shareForm.usePassword ? (
                    <Lock className="w-4 h-4 text-primary" strokeWidth={1.5} />
                  ) : (
                    <LockOpen className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
                  )}
                  <div>
                    <p className="text-sm font-medium">Password Protection</p>
                    <p className="text-xs text-muted-foreground">
                      {shareForm.usePassword ? "Recipient needs a password" : "No password required"}
                    </p>
                  </div>
                </div>
                <div className={cn(
                  "w-10 h-6 rounded-full transition-colors relative",
                  shareForm.usePassword ? "bg-primary" : "bg-muted"
                )}>
                  <div className={cn(
                    "absolute top-1 w-4 h-4 rounded-full bg-background shadow transition-transform",
                    shareForm.usePassword ? "translate-x-5" : "translate-x-1"
                  )} />
                </div>
              </div>

              {shareForm.usePassword && (
                <>
                  <div className="space-y-2">
                    <Label>Share Password</Label>
                    <Input
                      type="password"
                      value={shareForm.sharePassword}
                      onChange={(e) =>
                        setShareForm({ ...shareForm, sharePassword: e.target.value })
                      }
                      placeholder="Create a password for this share"
                    />
                    <p className="text-xs text-muted-foreground">
                      The recipient will need this password to view the content
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Password Hint (Optional)</Label>
                    <Input
                      type="text"
                      value={shareForm.shareKeyHint}
                      onChange={(e) =>
                        setShareForm({ ...shareForm, shareKeyHint: e.target.value })
                      }
                      placeholder="e.g., Our anniversary date"
                    />
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label>Access Duration</Label>
                <Select
                  value={shareForm.expiresIn}
                  onValueChange={(value) =>
                    setShareForm({ ...shareForm, expiresIn: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="never">Never expires</SelectItem>
                    <SelectItem value="1">1 day</SelectItem>
                    <SelectItem value="7">7 days</SelectItem>
                    <SelectItem value="30">30 days</SelectItem>
                    <SelectItem value="90">90 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button 
                onClick={handleShare} 
                className="w-full"
                disabled={!recipientInfo || !shareForm.itemId || (shareForm.usePassword && (!shareForm.sharePassword || shareForm.sharePassword.length < 4)) || isLoading}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Send className="w-4 h-4 mr-2" strokeWidth={1.5} />
                )}
                Share Item
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
          strokeWidth={1.5}
        />
        <Input
          placeholder="Search shared items..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Tabs for Sent/Received */}
      <Tabs defaultValue="sent" className="w-full" onValueChange={(value) => {
        if (value === 'received') {
          clearNewShareCount();
        }
      }}>
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="sent" className="flex items-center gap-2">
            <Send className="w-4 h-4" />
            Sent ({sentItems.length})
          </TabsTrigger>
          <TabsTrigger value="received" className="flex items-center gap-2 relative">
            <Inbox className="w-4 h-4" />
            Received ({receivedItems.length})
            {newShareCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center">
                {newShareCount > 9 ? '9+' : newShareCount}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sent" className="mt-4">
          {filteredSentItems.length === 0 ? (
            <div className="text-center py-12 bg-muted/30 rounded-lg border border-border">
              <Send className="w-12 h-12 text-muted-foreground mx-auto mb-4" strokeWidth={1} />
              <p className="text-muted-foreground">
                {searchQuery
                  ? "No shared items match your search"
                  : "No items shared yet. Click 'Share Item' to get started."}
              </p>
            </div>
          ) : (
            <div className="grid gap-3">
              {filteredSentItems.map((item) => {
                const Icon = typeIcons[item.itemType as keyof typeof typeIcons] || Key;
                const expired = isExpired(item.expiresAt);

                return (
                  <div
                    key={item.id}
                    className={cn(
                      "p-4 rounded-lg border bg-card transition-all",
                      expired ? "border-destructive/50 opacity-60" : "border-border"
                    )}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-5 h-5 text-primary" strokeWidth={1.5} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-foreground truncate">
                            {item.itemName}
                          </h3>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground capitalize">
                            {item.itemType}
                          </span>
                          {expired && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-destructive/10 text-destructive">
                              Expired
                            </span>
                          )}
                          {item.isAccepted && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                              Accepted
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Shared: {formatDate(item.sharedAt)}
                          </span>
                          {item.expiresAt && (
                            <span>
                              Expires: {formatDate(item.expiresAt)}
                            </span>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRevokeShare(item.id)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="received" className="mt-4">
          {filteredReceivedItems.length === 0 ? (
            <div className="text-center py-12 bg-muted/30 rounded-lg border border-border">
              <Inbox className="w-12 h-12 text-muted-foreground mx-auto mb-4" strokeWidth={1} />
              <p className="text-muted-foreground">
                {searchQuery
                  ? "No received items match your search"
                  : "No items shared with you yet."}
              </p>
            </div>
          ) : (
            <div className="grid gap-3">
              {filteredReceivedItems.map((item) => {
                const Icon = typeIcons[item.itemType as keyof typeof typeIcons] || Key;
                const expired = isExpired(item.expiresAt);

                return (
                  <div
                    key={item.id}
                    className={cn(
                      "p-4 rounded-lg border bg-card transition-all",
                      expired ? "border-destructive/50 opacity-60" : "border-border"
                    )}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-secondary/50 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-5 h-5 text-secondary-foreground" strokeWidth={1.5} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-foreground truncate">
                            {item.itemName}
                          </h3>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground capitalize">
                            {item.itemType}
                          </span>
                          {expired && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-destructive/10 text-destructive">
                              Expired
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            From: {item.senderName || 'Unknown'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDate(item.sharedAt)}
                          </span>
                          {item.expiresAt && (
                            <span>
                              Expires: {formatDate(item.expiresAt)}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {!expired && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setViewingItem(item)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                        )}
                        {!item.isAccepted && !expired && (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleAcceptShare(item.id)}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Accept
                          </Button>
                        )}
                        {item.isAccepted && (
                          <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                            Accepted
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* View Shared Content Dialog */}
      <Dialog open={!!viewingItem} onOpenChange={(open) => !open && closeViewDialog()}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5" />
              View Shared Content
            </DialogTitle>
          </DialogHeader>
          
          {viewingItem && (
            <div className="space-y-4 mt-4">
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-sm font-medium">{viewingItem.itemName}</p>
                <p className="text-xs text-muted-foreground capitalize">{typeLabels[viewingItem.itemType] || viewingItem.itemType}</p>
              </div>

              {viewingItem.shareKeyHint && isPasswordProtected(viewingItem) && (
                <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
                  <p className="text-xs text-muted-foreground">Password Hint:</p>
                  <p className="text-sm font-medium text-primary">{viewingItem.shareKeyHint}</p>
                </div>
              )}

              {isDecrypting ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : !decryptedContent && isPasswordProtected(viewingItem) ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Share Password</Label>
                    <Input
                      type="password"
                      value={viewPassword}
                      onChange={(e) => setViewPassword(e.target.value)}
                      placeholder="Enter the password provided by the sender"
                      onKeyDown={(e) => e.key === 'Enter' && handleViewContent()}
                    />
                  </div>
                  <Button 
                    onClick={() => handleViewContent()} 
                    className="w-full"
                    disabled={!viewPassword || isDecrypting}
                  >
                    {isDecrypting ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Eye className="w-4 h-4 mr-2" />
                    )}
                    Decrypt & View
                  </Button>
                </div>
              ) : decryptedContent ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-primary">Decrypted Content</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(JSON.stringify(decryptedContent, null, 2));
                        toast.success("Content copied to clipboard");
                      }}
                    >
                      <Copy className="w-4 h-4 mr-1" />
                      Copy All
                    </Button>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-4 space-y-2 max-h-[300px] overflow-y-auto">
                    {Object.entries(decryptedContent).map(([key, value]) => {
                      // Skip internal fields
                      if (key === 'id' || key === 'createdAt' || key === 'isFavorite' || key === 'vaultId') return null;
                      
                      const displayValue = typeof value === 'object' ? JSON.stringify(value) : String(value || '');
                      if (!displayValue) return null;
                      
                      return (
                        <div key={key} className="flex flex-col gap-1 p-2 bg-background rounded border border-border">
                          <span className="text-xs text-muted-foreground capitalize">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </span>
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-sm font-mono break-all">{displayValue}</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 flex-shrink-0"
                              onClick={() => {
                                navigator.clipboard.writeText(displayValue);
                                toast.success(`${key} copied`);
                              }}
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
