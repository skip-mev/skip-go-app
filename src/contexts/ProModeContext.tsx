import React, { createContext, useContext, useCallback, useEffect, useState, ReactNode } from "react";

const PRO_MODE_KEY = "skip-pro-mode";

interface ProModeContextType {
  isProMode: boolean;
  setProMode: (value: boolean) => void;
  toggleProMode: () => void;
  isLoaded: boolean;
}

const ProModeContext = createContext<ProModeContextType | undefined>(undefined);

interface ProModeProviderProps {
  children: ReactNode;
}

export function ProModeProvider({ children }: ProModeProviderProps) {
  const [isProMode, setIsProModeState] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(PRO_MODE_KEY);
      if (stored !== null) {
        setIsProModeState(stored === "true");
      }
      setIsLoaded(true);
    }
  }, []);

  const setProMode = useCallback((value: boolean) => {
    setIsProModeState(value);
    if (typeof window !== "undefined") {
      localStorage.setItem(PRO_MODE_KEY, value.toString());
    }
  }, []);

  const toggleProMode = useCallback(() => {
    setIsProModeState(prevState => {
      const newValue = !prevState;
      if (typeof window !== "undefined") {
        localStorage.setItem(PRO_MODE_KEY, newValue.toString());
      }
      return newValue;
    });
  }, []);

  const value = {
    isProMode,
    setProMode,
    toggleProMode,
    isLoaded,
  };

  return (
    <ProModeContext.Provider value={value}>
      {children}
    </ProModeContext.Provider>
  );
}

export function useProMode() {
  const context = useContext(ProModeContext);
  if (context === undefined) {
    throw new Error('useProMode must be used within a ProModeProvider');
  }
  return context;
}