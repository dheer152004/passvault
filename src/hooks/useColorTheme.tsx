import { useState, useEffect, createContext, useContext, ReactNode } from "react";

export type ColorTheme = "blue" | "green" | "purple" | "rose" | "orange" | "teal";

interface ColorThemeContextType {
  colorTheme: ColorTheme;
  setColorTheme: (theme: ColorTheme) => void;
}

const ColorThemeContext = createContext<ColorThemeContextType | undefined>(undefined);

const STORAGE_KEY = "digilock_color_theme";

// Theme color definitions (HSL values)
const themeColors: Record<ColorTheme, { primary: string; ring: string }> = {
  blue: {
    primary: "221 83% 53%",
    ring: "221 83% 53%",
  },
  green: {
    primary: "142 71% 45%",
    ring: "142 71% 45%",
  },
  purple: {
    primary: "262 83% 58%",
    ring: "262 83% 58%",
  },
  rose: {
    primary: "346 77% 50%",
    ring: "346 77% 50%",
  },
  orange: {
    primary: "25 95% 53%",
    ring: "25 95% 53%",
  },
  teal: {
    primary: "173 80% 40%",
    ring: "173 80% 40%",
  },
};

export const themeLabels: Record<ColorTheme, string> = {
  blue: "Blue",
  green: "Green",
  purple: "Purple",
  rose: "Rose",
  orange: "Orange",
  teal: "Teal",
};

// Preview colors for the theme selector (hex values for display)
export const themePreviewColors: Record<ColorTheme, string> = {
  blue: "#3b82f6",
  green: "#22c55e",
  purple: "#8b5cf6",
  rose: "#e11d48",
  orange: "#f97316",
  teal: "#14b8a6",
};

function applyTheme(theme: ColorTheme) {
  const colors = themeColors[theme];
  const root = document.documentElement;
  
  root.style.setProperty("--primary", colors.primary);
  root.style.setProperty("--ring", colors.ring);
  root.style.setProperty("--sidebar-primary", colors.primary);
  root.style.setProperty("--sidebar-ring", colors.ring);
}

export function ColorThemeProvider({ children }: { children: ReactNode }) {
  const [colorTheme, setColorThemeState] = useState<ColorTheme>("blue");

  useEffect(() => {
    // Load saved theme from localStorage
    const savedTheme = localStorage.getItem(STORAGE_KEY) as ColorTheme | null;
    if (savedTheme && themeColors[savedTheme]) {
      setColorThemeState(savedTheme);
      applyTheme(savedTheme);
    }
  }, []);

  const setColorTheme = (theme: ColorTheme) => {
    setColorThemeState(theme);
    localStorage.setItem(STORAGE_KEY, theme);
    applyTheme(theme);
  };

  return (
    <ColorThemeContext.Provider value={{ colorTheme, setColorTheme }}>
      {children}
    </ColorThemeContext.Provider>
  );
}

export function useColorTheme() {
  const context = useContext(ColorThemeContext);
  if (context === undefined) {
    throw new Error("useColorTheme must be used within a ColorThemeProvider");
  }
  return context;
}
