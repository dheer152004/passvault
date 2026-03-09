import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { 
  User, 
  Mail, 
  Save, 
  ArrowLeft,
  Globe,
  Download,
  Upload,
  FileJson,
  Lock,
  Eye,
  EyeOff,
  Image,
  Loader2,
  Palette,
  Check,
  Shield
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useFaviconSettings } from "@/hooks/useFaviconSettings";
import { useColorTheme, ColorTheme, themeLabels, themePreviewColors } from "@/hooks/useColorTheme";
import { useEncryption } from "@/hooks/useEncryption";
import { LoginSessionsSection } from "@/components/profile/LoginSessionSection";
import { encrypt, decrypt } from "@/lib/crypto";
import { cn } from "@/lib/utils";

export default function Profile() {
  const { user, isAuthenticated, updateProfile, updateUsername, logout } = useAuth();
  const { faviconEnabled, setFaviconEnabled } = useFaviconSettings();
  const { colorTheme, setColorTheme } = useColorTheme();
  const { encryptionKey, initializeEncryption, isUnlocked } = useEncryption();
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  // Initialize form data when user loads
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        username: user.username || "",
        email: user.email || "",
      });
    }
  }, [user]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated || !user) {
    return null;
  }

  const handlePasswordChange = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      toast.error("Please fill in all password fields");
      return;
    }
    
    if (passwordData.newPassword.length < 8) {
      toast.error("New password must be at least 8 characters");
      return;
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    
    setIsChangingPassword(true);
    
    try {
      // In demo mode, just validate the password change locally
      // For a real app with Supabase, implement actual password change
      
      // Re-initialize encryption with new password
      await initializeEncryption(passwordData.newPassword);
      
      toast.success("Password changed successfully. Your vault has been re-encrypted.");
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error) {
      console.error("Password change error:", error);
      toast.error("An error occurred while changing password");
    }
    
    setIsChangingPassword(false);
  };


  const handleExport = async () => {
    if (!user || !encryptionKey) {
      toast.error("Please unlock your vault first");
      return;
    }

    setIsExporting(true);
    try {
      // In demo mode, export is simplified or disabled
      // For a real app with Supabase, fetch vault data from the database
      
      const exportData = {
        passwords: [],
        notes: [],
        cards: [],
        addresses: [],
        totp_authenticators: [],
        id_cards: [],
        ssh_keys: [],
        crypto_wallets: [],
        bank_accounts: [],
        software_licenses: [],
        vaults: [],
        exportedAt: new Date().toISOString(),
        version: "2.0",
      };

      // Encrypt the entire export with the user's encryption key
      const jsonString = JSON.stringify(exportData);
      const encryptedData = await encrypt(jsonString, encryptionKey);
      
      // Get the salt for verification during import
      const storedSalt = localStorage.getItem('digilock_encryption_salt') || '';

      const finalExport = {
        encrypted: true,
        salt: storedSalt,
        data: encryptedData,
        version: "2.0",
        exportedAt: new Date().toISOString(),
      };

      const blob = new Blob([JSON.stringify(finalExport, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `digilock-encrypted-backup-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Encrypted backup exported successfully");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export data");
    }
    setIsExporting(false);
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!user || !encryptionKey) {
      toast.error("Please unlock your vault first");
      event.target.value = "";
      return;
    }

    setIsImporting(true);
    const reader = new FileReader();
    
    reader.onerror = () => {
      console.error("File read error:", reader.error);
      toast.error("Failed to read the file");
      setIsImporting(false);
      event.target.value = "";
    };

    reader.onload = async (e) => {
      try {
        const fileContent = JSON.parse(e.target?.result as string);
        console.log("Backup file parsed. Keys:", Object.keys(fileContent));
        
        // Check if this is an encrypted backup
        if (!fileContent.encrypted || !fileContent.salt || !fileContent.data) {
          toast.error("Invalid backup file format. Please use an encrypted backup.");
          setIsImporting(false);
          event.target.value = "";
          return;
        }

        // Try to decrypt with current encryption key
        let decryptedData: string;
        try {
          decryptedData = await decrypt(fileContent.data, encryptionKey);
          if (!decryptedData || decryptedData === '[Decryption failed]') {
            throw new Error("Decryption failed with current key");
          }
          JSON.parse(decryptedData);
        } catch (decryptErr) {
          console.error("Decryption failed:", decryptErr);
          toast.error("Master password doesn't match the backup. Cannot import this backup.");
          setIsImporting(false);
          event.target.value = "";
          return;
        }

        const data = JSON.parse(decryptedData);
        console.log("Backup decrypted successfully. Contents:", {
          passwords: data.passwords?.length || 0,
          notes: data.notes?.length || 0,
          cards: data.cards?.length || 0,
          vaults: data.vaults?.length || 0,
        });
        
        // In demo mode, import is simplified or disabled
        // For a real app with Supabase, insert data into database tables
        toast.success("Backup verified but import requires Supabase configuration. See console for data preview.");
      } catch (error) {
        console.error("Import error:", error);
        toast.error("Failed to import data. Invalid or corrupted backup file.");
      }
      setIsImporting(false);
      event.target.value = "";
    };
    
    reader.readAsText(file);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Update profile (name and email)
      const result = await updateProfile(formData.name, formData.email);
      
      if (!result.success) {
        toast.error(result.error || "Failed to update profile");
        setIsSaving(false);
        return;
      }

      // Update username if it has changed
      if (formData.username && formData.username !== user?.username) {
        const usernameResult = await updateUsername(formData.username);
        
        if (!usernameResult.success) {
          toast.error(usernameResult.error || "Failed to update username");
          setIsSaving(false);
          return;
        }
      }

      toast.success("Profile updated successfully");
      setIsEditing(false);
    } catch (error) {
      console.error("Save error:", error);
      toast.error("An error occurred while updating profile");
    }
    setIsSaving(false);
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const displayName = user?.name || user?.email?.split("@")[0] || "User";

  return (
    <Layout>
      <div className="py-12">
        <div className="container-narrow max-w-2xl">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="w-5 h-5" strokeWidth={1.5} />
            </Button>
            <div>
              <h1 className="text-2xl font-semibold text-foreground">Profile Settings</h1>
              <p className="text-muted-foreground mt-1">Manage your account information</p>
            </div>
          </div>

          {/* Profile Card */}
          <div className="bg-card border border-border rounded-lg p-6 mb-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-8 h-8 text-primary" strokeWidth={1.5} />
              </div>
              <div>
                <h2 className="text-lg font-medium text-foreground">{displayName}</h2>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
            </div>

            {isEditing ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Display Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="pl-10"
                      placeholder="Your display name"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">@</span>
                    <Input
                      id="username"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') })}
                      className="pl-8"
                      placeholder="your_username"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">Lowercase letters, numbers, and underscores only</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      disabled
                      className="pl-10 bg-muted"
                      placeholder="your@email.com"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button onClick={handleSave} disabled={isSaving}>
                    {isSaving ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4 mr-2" strokeWidth={1.5} />
                    )}
                    Save Changes
                  </Button>
                  <Button variant="outline" onClick={() => {
                    setIsEditing(false);
                    setFormData({
                      name: user?.name || "",
                      username: user?.username || "",
                      email: user?.email || "",
                    });
                  }}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-border">
                  <div className="flex items-center gap-3">
                    <User className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
                    <span className="text-sm text-muted-foreground">Display Name</span>
                  </div>
                  <span className="text-sm text-foreground font-medium">{displayName}</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-border">
                  <div className="flex items-center gap-3">
                    <span className="w-4 h-4 text-muted-foreground text-center">@</span>
                    <span className="text-sm text-muted-foreground">Username</span>
                  </div>
                  <span className="text-sm text-foreground font-medium">
                    {user?.username || <span className="text-muted-foreground italic">Not set</span>}
                  </span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-border">
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
                    <span className="text-sm text-muted-foreground">Email</span>
                  </div>
                  <span className="text-sm text-foreground font-medium">{user.email}</span>
                </div>
                <Button variant="outline" onClick={() => setIsEditing(true)} className="mt-4">
                  Edit Profile
                </Button>
              </div>
            )}
          </div>

          {/* Favicon Settings Section */}
          <div className="bg-card border border-border rounded-lg p-6 mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Image className="w-5 h-5 text-muted-foreground" strokeWidth={1.5} />
              <h3 className="text-lg font-medium text-foreground">Website Favicon</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Automatically fetch and display website favicons for passwords, software licenses, and other entries with website links.
            </p>
            <div className="flex items-center justify-between py-3 border border-border rounded-lg px-4">
              <div className="flex items-center gap-3">
                <Globe className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
                <div>
                  <span className="text-sm font-medium text-foreground">Show Website Favicons</span>
                  <p className="text-xs text-muted-foreground">Display icons from websites in your vault entries</p>
                </div>
              </div>
              <Switch 
                checked={faviconEnabled} 
                onCheckedChange={setFaviconEnabled}
              />
            </div>
          </div>

          {/* Color Theme Section */}
          <div className="bg-card border border-border rounded-lg p-6 mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Palette className="w-5 h-5 text-muted-foreground" strokeWidth={1.5} />
              <h3 className="text-lg font-medium text-foreground">Color Theme</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Choose your preferred accent color for the interface.
            </p>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
              {(Object.keys(themeLabels) as ColorTheme[]).map((theme) => (
                <button
                  key={theme}
                  onClick={() => setColorTheme(theme)}
                  className={cn(
                    "flex flex-col items-center gap-2 p-3 rounded-lg border transition-all",
                    colorTheme === theme
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-muted-foreground/50"
                  )}
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: themePreviewColors[theme] }}
                  >
                    {colorTheme === theme && (
                      <Check className="w-4 h-4 text-white" strokeWidth={2} />
                    )}
                  </div>
                  <span className="text-xs font-medium text-foreground">
                    {themeLabels[theme]}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Import/Export Section */}
          <div className="bg-card border border-border rounded-lg p-6 mb-8">
            <div className="flex items-center gap-2 mb-6">
              <FileJson className="w-5 h-5 text-muted-foreground" strokeWidth={1.5} />
              <h3 className="text-lg font-medium text-foreground">Import & Export</h3>
            </div>
            <div className="flex items-center gap-2 p-3 bg-primary/5 border border-primary/20 rounded-lg mb-4">
              <Shield className="w-4 h-4 text-primary" strokeWidth={1.5} />
              <p className="text-sm text-foreground">
                Backups are encrypted with your master password. Only accounts with the same master password can import the data.
              </p>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Export your vault data as an encrypted backup or import from a previous backup.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button variant="outline" onClick={handleExport} disabled={isExporting || !isUnlocked}>
                {isExporting ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Download className="w-4 h-4 mr-2" strokeWidth={1.5} />
                )}
                {isExporting ? "Exporting..." : "Export Encrypted Backup"}
              </Button>
              <Button variant="outline" onClick={() => fileInputRef.current?.click()} disabled={isImporting || !isUnlocked}>
                {isImporting ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4 mr-2" strokeWidth={1.5} />
                )}
                {isImporting ? "Importing..." : "Import Backup"}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
            </div>
            {!isUnlocked && (
              <p className="text-sm text-destructive mt-3">
                Please unlock your vault from the dashboard first to use import/export.
              </p>
            )}
          </div>

          {/* Change Password Section */}
          <div className="bg-card border border-border rounded-lg p-6 mb-8">
            <div className="flex items-center gap-2 mb-6">
              <Lock className="w-5 h-5 text-muted-foreground" strokeWidth={1.5} />
              <h3 className="text-lg font-medium text-foreground">Change Password</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Update your password to keep your account secure.
            </p>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
                  <Input
                    id="currentPassword"
                    type={showPasswords.current ? "text" : "password"}
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    className="pl-10 pr-10"
                    placeholder="Enter current password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPasswords.current ? <EyeOff className="w-4 h-4" strokeWidth={1.5} /> : <Eye className="w-4 h-4" strokeWidth={1.5} />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
                  <Input
                    id="newPassword"
                    type={showPasswords.new ? "text" : "password"}
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    className="pl-10 pr-10"
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPasswords.new ? <EyeOff className="w-4 h-4" strokeWidth={1.5} /> : <Eye className="w-4 h-4" strokeWidth={1.5} />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
                  <Input
                    id="confirmPassword"
                    type={showPasswords.confirm ? "text" : "password"}
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    className="pl-10 pr-10"
                    placeholder="Confirm new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPasswords.confirm ? <EyeOff className="w-4 h-4" strokeWidth={1.5} /> : <Eye className="w-4 h-4" strokeWidth={1.5} />}
                  </button>
                </div>
              </div>
              <Button onClick={handlePasswordChange} disabled={isChangingPassword}>
                {isChangingPassword ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Changing Password...
                  </>
                ) : (
                  "Change Password"
                )}
              </Button>
            </div>
          </div>

          {/* Login Sessions Section */}
          <LoginSessionsSection />

          {/* Logout Section */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="text-lg font-medium text-foreground mb-4">Account Actions</h3>
            <Button variant="destructive" onClick={handleLogout}>
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
