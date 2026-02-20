import { useState, useEffect } from "react";
import { Wand2, Copy, RefreshCw, Check, X, AlertTriangle, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface PasswordOptions {
  length: number;
  uppercase: boolean;
  lowercase: boolean;
  numbers: boolean;
  symbols: boolean;
}

const calculateStrength = (password: string): { score: number; label: string; color: string } => {
  let score = 0;
  
  if (password.length === 0) return { score: 0, label: "No password", color: "bg-muted" };
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (password.length >= 16) score += 1;
  if (/[a-z]/.test(password)) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^a-zA-Z0-9]/.test(password)) score += 2;
  
  // Check for common patterns (reduce score)
  if (/(.)\1{2,}/.test(password)) score -= 1; // Repeated chars
  if (/^[a-zA-Z]+$/.test(password)) score -= 1; // Only letters
  if (/^[0-9]+$/.test(password)) score -= 2; // Only numbers
  
  score = Math.max(0, Math.min(8, score));
  
  if (score <= 2) return { score, label: "Weak", color: "bg-red-500" };
  if (score <= 4) return { score, label: "Fair", color: "bg-orange-500" };
  if (score <= 6) return { score, label: "Good", color: "bg-yellow-500" };
  return { score, label: "Strong", color: "bg-green-500" };
};

const getStrengthFeedback = (password: string): string[] => {
  const feedback: string[] = [];
  
  if (password.length < 8) feedback.push("Use at least 8 characters");
  if (password.length < 12) feedback.push("Consider using 12+ characters for better security");
  if (!/[a-z]/.test(password)) feedback.push("Add lowercase letters");
  if (!/[A-Z]/.test(password)) feedback.push("Add uppercase letters");
  if (!/[0-9]/.test(password)) feedback.push("Add numbers");
  if (!/[^a-zA-Z0-9]/.test(password)) feedback.push("Add special characters (!@#$%^&*)");
  if (/(.)\1{2,}/.test(password)) feedback.push("Avoid repeated characters");
  
  return feedback;
};

export function ToolsSection() {
  // Password Generator State
  const [generatedPassword, setGeneratedPassword] = useState("");
  const [options, setOptions] = useState<PasswordOptions>({
    length: 16,
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
  });

  // Password Strength Checker State
  const [passwordToCheck, setPasswordToCheck] = useState("");
  const [strength, setStrength] = useState(calculateStrength(""));
  const [feedback, setFeedback] = useState<string[]>([]);

  const generatePassword = () => {
    const uppercaseChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lowercaseChars = "abcdefghijklmnopqrstuvwxyz";
    const numberChars = "0123456789";
    const symbolChars = "!@#$%^&*()_+-=[]{}|;:,.<>?";

    let chars = "";
    if (options.uppercase) chars += uppercaseChars;
    if (options.lowercase) chars += lowercaseChars;
    if (options.numbers) chars += numberChars;
    if (options.symbols) chars += symbolChars;

    if (chars.length === 0) {
      toast.error("Please select at least one character type");
      return;
    }

    let password = "";
    
    // Ensure at least one of each selected type
    if (options.uppercase) password += uppercaseChars[Math.floor(Math.random() * uppercaseChars.length)];
    if (options.lowercase) password += lowercaseChars[Math.floor(Math.random() * lowercaseChars.length)];
    if (options.numbers) password += numberChars[Math.floor(Math.random() * numberChars.length)];
    if (options.symbols) password += symbolChars[Math.floor(Math.random() * symbolChars.length)];

    // Fill the rest
    for (let i = password.length; i < options.length; i++) {
      password += chars[Math.floor(Math.random() * chars.length)];
    }

    // Shuffle the password
    password = password.split("").sort(() => Math.random() - 0.5).join("");
    
    setGeneratedPassword(password);
  };

  const copyPassword = () => {
    if (generatedPassword) {
      navigator.clipboard.writeText(generatedPassword);
      toast.success("Password copied to clipboard");
    }
  };

  useEffect(() => {
    generatePassword();
  }, []);

  useEffect(() => {
    setStrength(calculateStrength(passwordToCheck));
    setFeedback(getStrengthFeedback(passwordToCheck));
  }, [passwordToCheck]);

  const generatedStrength = calculateStrength(generatedPassword);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Tools</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Password generation and security tools
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Password Generator */}
        <div className="bg-card border border-border rounded-lg p-6 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Wand2 className="w-5 h-5 text-primary" strokeWidth={1.5} />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Password Generator</h3>
              <p className="text-sm text-muted-foreground">Create strong, random passwords</p>
            </div>
          </div>

          {/* Generated Password Display */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-muted/50 rounded-lg p-4 font-mono text-lg text-foreground break-all border border-border">
                {generatedPassword || "Click generate to create a password"}
              </div>
              <div className="flex flex-col gap-2">
                <Button variant="outline" size="icon" onClick={copyPassword} title="Copy">
                  <Copy className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={generatePassword} title="Generate new">
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            {/* Strength indicator for generated password */}
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className={cn("h-full transition-all", generatedStrength.color)}
                  style={{ width: `${(generatedStrength.score / 8) * 100}%` }}
                />
              </div>
              <span className="text-sm text-muted-foreground">{generatedStrength.label}</span>
            </div>
          </div>

          {/* Options */}
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Length: {options.length}</Label>
              </div>
              <Slider
                value={[options.length]}
                onValueChange={([value]) => setOptions({ ...options, length: value })}
                min={8}
                max={64}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>8</span>
                <span>64</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="uppercase"
                  checked={options.uppercase}
                  onCheckedChange={(checked) => setOptions({ ...options, uppercase: !!checked })}
                />
                <Label htmlFor="uppercase" className="text-sm">Uppercase (A-Z)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="lowercase"
                  checked={options.lowercase}
                  onCheckedChange={(checked) => setOptions({ ...options, lowercase: !!checked })}
                />
                <Label htmlFor="lowercase" className="text-sm">Lowercase (a-z)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="numbers"
                  checked={options.numbers}
                  onCheckedChange={(checked) => setOptions({ ...options, numbers: !!checked })}
                />
                <Label htmlFor="numbers" className="text-sm">Numbers (0-9)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="symbols"
                  checked={options.symbols}
                  onCheckedChange={(checked) => setOptions({ ...options, symbols: !!checked })}
                />
                <Label htmlFor="symbols" className="text-sm">Symbols (!@#$)</Label>
              </div>
            </div>
          </div>

          <Button onClick={generatePassword} className="w-full">
            <RefreshCw className="w-4 h-4 mr-2" /> Generate Password
          </Button>
        </div>

        {/* Password Strength Checker */}
        <div className="bg-card border border-border rounded-lg p-6 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-primary" strokeWidth={1.5} />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Password Strength Checker</h3>
              <p className="text-sm text-muted-foreground">Check how secure your password is</p>
            </div>
          </div>

          {/* Input */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="passwordCheck">Enter password to check</Label>
              <Input
                id="passwordCheck"
                type="text"
                value={passwordToCheck}
                onChange={(e) => setPasswordToCheck(e.target.value)}
                placeholder="Type your password here..."
                className="font-mono"
              />
            </div>

            {/* Strength Meter */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Strength</span>
                <span className={cn(
                  "text-sm font-medium",
                  strength.label === "Weak" && "text-red-500",
                  strength.label === "Fair" && "text-orange-500",
                  strength.label === "Good" && "text-yellow-500",
                  strength.label === "Strong" && "text-green-500",
                )}>
                  {strength.label}
                </span>
              </div>
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <div 
                  className={cn("h-full transition-all duration-300", strength.color)}
                  style={{ width: `${(strength.score / 8) * 100}%` }}
                />
              </div>
            </div>

            {/* Strength Score */}
            <div className="flex items-center justify-center gap-1 py-4">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all",
                    i < strength.score 
                      ? `${strength.color} border-transparent` 
                      : "border-border"
                  )}
                >
                  {i < strength.score && <Check className="w-4 h-4 text-white" />}
                </div>
              ))}
            </div>

            {/* Feedback */}
            {passwordToCheck && feedback.length > 0 && (
              <div className="space-y-2 p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <AlertTriangle className="w-4 h-4" />
                  Suggestions to improve:
                </div>
                <ul className="space-y-1">
                  {feedback.map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <X className="w-3 h-3 text-red-500" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {passwordToCheck && feedback.length === 0 && (
              <div className="flex items-center gap-2 p-4 bg-green-500/10 rounded-lg text-green-600">
                <ShieldCheck className="w-5 h-5" />
                <span className="text-sm font-medium">Great! Your password is strong.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
