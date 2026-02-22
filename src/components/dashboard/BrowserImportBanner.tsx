import { useState } from "react";
import { X, Upload, Chrome, Monitor, FileText, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { useEncryption } from "@/hooks/useEncryption";
import { supabase } from "@/integrations/supabase/client";
import { encrypt } from "@/lib/crypto";
import { toast } from "sonner";

const BANNER_DISMISSED_KEY = "digilock_import_banner_dismissed";

interface BrowserPassword {
  name: string;
  url: string;
  username: string;
  password: string;
  notes?: string;
}

export function BrowserImportBanner() {
  const [isDismissed, setIsDismissed] = useState(() => 
    localStorage.getItem(BANNER_DISMISSED_KEY) === "true"
  );
  const [showDialog, setShowDialog] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ success: number; failed: number } | null>(null);
  const { user } = useAuth();
  const { encryptionKey, isUnlocked } = useEncryption();

  const handleDismiss = () => {
    localStorage.setItem(BANNER_DISMISSED_KEY, "true");
    setIsDismissed(true);
  };

  const parseCSV = (content: string): BrowserPassword[] => {
    const lines = content.split("\n").filter(line => line.trim());
    if (lines.length < 2) return [];

    const headers = lines[0].toLowerCase().split(",").map(h => h.trim().replace(/"/g, ""));
    const passwords: BrowserPassword[] = [];

    // Find column indices for different browser formats
    const nameIdx = headers.findIndex(h => h.includes("name") || h.includes("title"));
    const urlIdx = headers.findIndex(h => h.includes("url") || h.includes("website") || h.includes("origin"));
    const usernameIdx = headers.findIndex(h => h.includes("username") || h.includes("user") || h.includes("login"));
    const passwordIdx = headers.findIndex(h => h.includes("password") || h.includes("pass"));
    const notesIdx = headers.findIndex(h => h.includes("note") || h.includes("comment"));

    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i]);
      if (values.length < 3) continue;

      const url = urlIdx >= 0 ? values[urlIdx] : "";
      const name = nameIdx >= 0 ? values[nameIdx] : extractDomain(url);
      const username = usernameIdx >= 0 ? values[usernameIdx] : "";
      const password = passwordIdx >= 0 ? values[passwordIdx] : "";
      const notes = notesIdx >= 0 ? values[notesIdx] : "";

      if (password) {
        passwords.push({
          name: name || extractDomain(url) || "Imported Password",
          url,
          username,
          password,
          notes,
        });
      }
    }

    return passwords;
  };

  const parseCSVLine = (line: string): string[] => {
    const values: string[] = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === "," && !inQuotes) {
        values.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
    values.push(current.trim());
    return values;
  };

  const extractDomain = (url: string): string => {
    try {
      const domain = new URL(url).hostname.replace("www.", "");
      return domain.charAt(0).toUpperCase() + domain.slice(1);
    } catch {
      return "";
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user || !encryptionKey || !isUnlocked) return;

    setIsImporting(true);
    setImportResult(null);

    try {
      const content = await file.text();
      const passwords = parseCSV(content);

      if (passwords.length === 0) {
        toast.error("No passwords found in the file. Please check the format.");
        setIsImporting(false);
        return;
      }

      let success = 0;
      let failed = 0;

      for (const pwd of passwords) {
        try {
          const encryptedPassword = await encrypt(pwd.password, encryptionKey);
          const encryptedUsername = pwd.username ? await encrypt(pwd.username, encryptionKey) : null;
          const encryptedNotes = pwd.notes ? await encrypt(pwd.notes, encryptionKey) : null;
          const encryptedUrl = pwd.url ? await encrypt(pwd.url, encryptionKey) : null;

          const { error } = await supabase.from("passwords").insert({
            user_id: user.id,
            name: pwd.name,
            url: encryptedUrl,
            username: encryptedUsername,
            password: encryptedPassword,
            notes: encryptedNotes,
            category: "imported",
          });

          if (error) {
            failed++;
          } else {
            success++;
          }
        } catch {
          failed++;
        }
      }

      setImportResult({ success, failed });
      if (success > 0) {
        toast.success(`Successfully imported ${success} passwords!`);
      }
    } catch (error) {
      console.error("Import error:", error);
      toast.error("Failed to parse the file");
    }

    setIsImporting(false);
    // Reset file input
    e.target.value = "";
  };

  if (isDismissed) return null;

  return (
    <>
      <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/20 rounded-lg">
            <Upload className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">
              Import your saved passwords from your browser
            </p>
            <p className="text-xs text-muted-foreground">
              Easily migrate from Chrome, Firefox, Edge, or Safari
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={() => setShowDialog(true)}>
            Import Now
          </Button>
          <button
            onClick={handleDismiss}
            className="p-1 text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Import Passwords from Browser</DialogTitle>
            <DialogDescription>
              Export your passwords from your browser and import them securely into DigiLock.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {/* Browser Instructions */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-foreground">Step 1: Export from your browser</h4>
              
              <div className="space-y-2">
                <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                  <Chrome className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Chrome / Edge</p>
                    <p className="text-xs text-muted-foreground">
                      Settings → Passwords → ⋮ → Export passwords → Save as CSV
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                  <Monitor className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Firefox</p>
                    <p className="text-xs text-muted-foreground">
                      Settings → Privacy & Security → Logins → ⋮ → Export Logins
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                  <Monitor className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Safari</p>
                    <p className="text-xs text-muted-foreground">
                      Preferences → Passwords → ⋯ → Export All Passwords
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Upload Section */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-foreground">Step 2: Upload the CSV file</h4>
              
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary hover:bg-muted/50 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <FileText className="w-8 h-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    {isImporting ? "Importing..." : "Click to upload CSV file"}
                  </p>
                </div>
                <input
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={handleFileUpload}
                  disabled={isImporting || !isUnlocked}
                />
              </label>

              {!isUnlocked && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  Vault is locked. Please log in again to import.
                </p>
              )}
            </div>

            {/* Import Result */}
            {importResult && (
              <div className="p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium">Import Complete</p>
                    <p className="text-xs text-muted-foreground">
                      {importResult.success} imported successfully
                      {importResult.failed > 0 && `, ${importResult.failed} failed`}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Security Note */}
            <div className="p-3 bg-primary/10 rounded-lg">
              <p className="text-xs text-muted-foreground">
                🔒 Your passwords are encrypted locally before being stored. The CSV file is processed 
                entirely in your browser and never sent to our servers.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}