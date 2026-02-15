import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface User {
  id: string;
  email: string;
  name: string;
  username?: string;
  usernameLastUpdated?: string;
}

interface LoginSession {
  id: string;
  loginAt: string;
  browser: string;
  os: string;
  deviceType: string;
  ipAddress: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loginSessions: LoginSession[];
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateProfile: (name: string, email: string) => Promise<{ success: boolean; error?: string }>;
  updateUsername: (username: string) => Promise<{ success: boolean; error?: string; daysUntilNextChange?: number }>;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Dummy credentials for testing
const DUMMY_USERS = [
  { id: "1", email: "demo@digilock.com", password: "demo123", name: "Demo User", username: "demo_user" },
  { id: "2", email: "test@example.com", password: "test123", name: "Test User", username: "test_user" },
];

// Helper to detect device info
function getDeviceInfo(): Omit<LoginSession, "id" | "loginAt"> {
  const userAgent = navigator.userAgent;
  
  // Detect browser
  let browser = "Unknown Browser";
  if (userAgent.includes("Firefox")) browser = "Firefox";
  else if (userAgent.includes("Chrome")) browser = "Chrome";
  else if (userAgent.includes("Safari")) browser = "Safari";
  else if (userAgent.includes("Edge")) browser = "Edge";
  
  // Detect OS
  let os = "Unknown OS";
  if (userAgent.includes("Windows")) os = "Windows";
  else if (userAgent.includes("Mac")) os = "macOS";
  else if (userAgent.includes("Linux")) os = "Linux";
  else if (userAgent.includes("Android")) os = "Android";
  else if (userAgent.includes("iOS") || userAgent.includes("iPhone") || userAgent.includes("iPad")) os = "iOS";
  
  // Detect device type
  let deviceType = "Desktop";
  if (/Mobi|Android|iPhone|iPad|iPod/i.test(userAgent)) {
    deviceType = /iPad/i.test(userAgent) ? "Tablet" : "Mobile Phone";
  }
  
  // Simulated IP (in real app, this would come from server)
  const ipAddress = `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
  
  return { browser, os, deviceType, ipAddress };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loginSessions, setLoginSessions] = useState<LoginSession[]>([]);

  useEffect(() => {
    // Check for existing session on mount
    const storedUser = localStorage.getItem("digilock_user");
    const storedSessions = localStorage.getItem("digilock_sessions");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    if (storedSessions) {
      setLoginSessions(JSON.parse(storedSessions));
    }
  }, []);

  const login = async (identifier: string, password: string): Promise<{ success: boolean; error?: string }> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Check if identifier is email or username
    const foundUser = DUMMY_USERS.find(
      (u) => (u.email.toLowerCase() === identifier.toLowerCase() || 
              u.username?.toLowerCase() === identifier.toLowerCase()) && 
              u.password === password
    );

    // Also check localStorage for users with custom usernames
    if (!foundUser) {
      const storedUser = localStorage.getItem("digilock_user");
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        // For demo purposes, accept any password for stored users with matching username
        if (parsedUser.username?.toLowerCase() === identifier.toLowerCase()) {
          setUser(parsedUser);
          
          const deviceInfo = getDeviceInfo();
          const newSession: LoginSession = {
            id: Date.now().toString(),
            loginAt: new Date().toISOString(),
            ...deviceInfo,
          };
          
          const updatedSessions = [newSession, ...loginSessions].slice(0, 10);
          setLoginSessions(updatedSessions);
          localStorage.setItem("digilock_sessions", JSON.stringify(updatedSessions));
          
          return { success: true };
        }
      }
    }

    if (foundUser) {
      const userData = { id: foundUser.id, email: foundUser.email, name: foundUser.name, username: foundUser.username };
      setUser(userData);
      localStorage.setItem("digilock_user", JSON.stringify(userData));
      
      // Create new login session
      const deviceInfo = getDeviceInfo();
      const newSession: LoginSession = {
        id: Date.now().toString(),
        loginAt: new Date().toISOString(),
        ...deviceInfo,
      };
      
      const updatedSessions = [newSession, ...loginSessions].slice(0, 10); // Keep last 10 sessions
      setLoginSessions(updatedSessions);
      localStorage.setItem("digilock_sessions", JSON.stringify(updatedSessions));
      
      return { success: true };
    }

    return { success: false, error: "Invalid email/username or password" };
  };

  const signup = async (name: string, email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Check if user already exists
    const existingUser = DUMMY_USERS.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (existingUser) {
      return { success: false, error: "An account with this email already exists" };
    }

    // Create new user (in demo mode, just simulate success)
    const newUser = { id: Date.now().toString(), email, name };
    setUser(newUser);
    localStorage.setItem("digilock_user", JSON.stringify(newUser));
    
    // Create initial login session
    const deviceInfo = getDeviceInfo();
    const newSession: LoginSession = {
      id: Date.now().toString(),
      loginAt: new Date().toISOString(),
      ...deviceInfo,
    };
    setLoginSessions([newSession]);
    localStorage.setItem("digilock_sessions", JSON.stringify([newSession]));
    
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("digilock_user");
    // Keep sessions for history, clear on next login with different user
  };

  const updateProfile = async (name: string, email: string): Promise<{ success: boolean; error?: string }> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    
    if (!user) {
      return { success: false, error: "Not authenticated" };
    }
    
    const updatedUser = { ...user, name, email };
    setUser(updatedUser);
    localStorage.setItem("digilock_user", JSON.stringify(updatedUser));
    
    return { success: true };
  };

  const updateUsername = async (username: string): Promise<{ success: boolean; error?: string; daysUntilNextChange?: number }> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    
    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    // Check if 45 days have passed since last update
    if (user.usernameLastUpdated) {
      const lastUpdate = new Date(user.usernameLastUpdated);
      const now = new Date();
      const daysDiff = Math.floor((now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff < 45) {
        return { 
          success: false, 
          error: `You can change your username again in ${45 - daysDiff} days`,
          daysUntilNextChange: 45 - daysDiff
        };
      }
    }

    const updatedUser = { 
      ...user, 
      username, 
      usernameLastUpdated: new Date().toISOString() 
    };
    setUser(updatedUser);
    localStorage.setItem("digilock_user", JSON.stringify(updatedUser));
    
    return { success: true };
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, loginSessions, login, signup, logout, updateProfile, updateUsername }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
