// src/context/LoadingContext.tsx
"use client";

import React, { createContext, useState, useContext, ReactNode, useEffect, useRef, useCallback } from 'react';

type LoadingType = 'fullPage' | 'popup' | null;

interface LoadingContextType {
  isLoading: boolean;
  loadingType: LoadingType;
  hints: string[];
  startLoading: (type: LoadingType, hints?: string[]) => void;
  stopLoading: (isRouteChange?: boolean) => void; // Add optional flag
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const LoadingProvider = ({ children }: { children: ReactNode }) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingType, setLoadingType] = useState<LoadingType>(null);
  const [hints, setHints] = useState<string[]>([]);
  const [currentHintIndex, setCurrentHintIndex] = useState(0);
  const hintIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const justStartedLoading = useRef<boolean>(false); // Flag to prevent immediate stop

  // Hint cycling effect (no changes)
  useEffect(() => {
    if (isLoading && hints.length > 0) {
      hintIntervalRef.current = setInterval(() => {
        setCurrentHintIndex((prevIndex) => (prevIndex + 1) % hints.length);
      }, 4000);
    } else {
      if (hintIntervalRef.current) { clearInterval(hintIntervalRef.current); hintIntervalRef.current = null; }
      setCurrentHintIndex(0);
    }
    return () => { if (hintIntervalRef.current) { clearInterval(hintIntervalRef.current); } };
  }, [isLoading, hints]);

  // startLoading (no changes)
  const startLoading = useCallback((type: LoadingType, hints: string[] = []) => {
    console.log(`>>> Loading Started: type=${type}`);
    setHints(hints);
    setLoadingType(type);
    setCurrentHintIndex(0);
    setIsLoading(true);
    justStartedLoading.current = true; // Set flag when starting

    // Reset the flag shortly after starting
    // This allows subsequent stopLoading calls (like from NavigationEvents) to work
    setTimeout(() => {
        justStartedLoading.current = false;
    }, 50); // Allow 50ms before stopLoading can take effect

  }, []); // No dependencies needed for start

  const stopLoading = useCallback((isRouteChange: boolean = false) => {
    // Only stop if loading AND the justStarted flag is false OR it's a route change stop
     if (isLoading && (!justStartedLoading.current || isRouteChange)) {
        console.log(`>>> Stopping Loading (Route Change: ${isRouteChange})`);
        setIsLoading(false);
        setLoadingType(null);
        setHints([]);
        justStartedLoading.current = false; // Ensure flag is reset
     } else if (isLoading && justStartedLoading.current && !isRouteChange) {
         console.log(">>> Stop Loading Ignored (Just Started)");
     }
  }, [isLoading]); // Depend on isLoading

  const value = { isLoading, loadingType, hints: hints.length > 0 ? [hints[currentHintIndex]] : [], startLoading, stopLoading };

  return (
    <LoadingContext.Provider value={value}>
      {children}
    </LoadingContext.Provider>
  );
};

export const useLoading = (): LoadingContextType => {
  const context = useContext(LoadingContext);
  if (context === undefined) { throw new Error('useLoading must be used within an LoadingProvider'); }
  return context;
};