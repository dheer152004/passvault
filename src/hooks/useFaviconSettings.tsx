import { useState, useEffect, createContext, useContext, ReactNode } from "react";

interface FaviconSettingsContextType {
  faviconEnabled: boolean;
  setFaviconEnabled: (enabled: boolean) => void;
  getFaviconUrl: (websiteUrl: string) => string | null;
}

const FaviconSettingsContext = createContext<FaviconSettingsContextType | undefined>(undefined);

const FAVICON_SETTINGS_KEY = "digilock_favicon_settings";

export function FaviconSettingsProvider({ children }: { children: ReactNode }) {
  const [faviconEnabled, setFaviconEnabledState] = useState<boolean>(() => {
    const saved = localStorage.getItem(FAVICON_SETTINGS_KEY);
    return saved ? JSON.parse(saved) : true;
  });

  useEffect(() => {
    localStorage.setItem(FAVICON_SETTINGS_KEY, JSON.stringify(faviconEnabled));
  }, [faviconEnabled]);

  const setFaviconEnabled = (enabled: boolean) => {
    setFaviconEnabledState(enabled);
  };

  const getFaviconUrl = (websiteUrl: string): string | null => {
    if (!faviconEnabled || !websiteUrl) return null;
    
    try {
      // Clean and parse the URL
      let url = websiteUrl.trim();
      if (!url.startsWith("http://") && !url.startsWith("https://")) {
        url = `https://${url}`;
      }
      
      const parsedUrl = new URL(url);
      const domain = parsedUrl.hostname;
      
      // Use Google's favicon service (reliable and fast)
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
    } catch {
      return null;
    }
  };

  return (
    <FaviconSettingsContext.Provider value={{ faviconEnabled, setFaviconEnabled, getFaviconUrl }}>
      {children}
    </FaviconSettingsContext.Provider>
  );
}

export function useFaviconSettings() {
  const context = useContext(FaviconSettingsContext);
  if (context === undefined) {
    throw new Error("useFaviconSettings must be used within a FaviconSettingsProvider");
  }
  return context;
}