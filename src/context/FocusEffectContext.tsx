// src/context/FocusEffectContext.tsx
"use client";

import React, { createContext, useState, useContext, ReactNode } from 'react';

interface FocusEffectContextType {
  isBlurEnabled: boolean;
  setIsBlurEnabled: React.Dispatch<React.SetStateAction<boolean>>;
}

const FocusEffectContext = createContext<FocusEffectContextType | undefined>(undefined);

export const FocusEffectProvider = ({ children }: { children: ReactNode }) => {
  // Default to blur being enabled
  const [isBlurEnabled, setIsBlurEnabled] = useState<boolean>(true);

  const value = { isBlurEnabled, setIsBlurEnabled };

  return (
    <FocusEffectContext.Provider value={value}>
      {children}
    </FocusEffectContext.Provider>
  );
};

export const useFocusEffect = (): FocusEffectContextType => {
  const context = useContext(FocusEffectContext);
  if (context === undefined) {
    throw new Error('useFocusEffect must be used within a FocusEffectProvider');
  }
  return context;
};