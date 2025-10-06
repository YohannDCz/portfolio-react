'use client';

import { useCallback, useEffect, useState } from 'react';

// =====================================
// TYPE DEFINITIONS
// =====================================

interface LoadingStates {
  [key: string]: boolean;
}

interface UseGlobalLoadingReturn {
  isLoading: boolean;
  registerLoading: (key: string, loading: boolean) => void;
  loadingStates: LoadingStates;
}

// =====================================
// GLOBAL LOADING HOOK
// =====================================

/**
 * Hook to manage global loading state across multiple components
 * @returns Object with global loading state and registration function
 */
export function useGlobalLoading(): UseGlobalLoadingReturn {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadingStates, setLoadingStates] = useState<LoadingStates>({});

  /**
   * Function to register a loading state (memoized)
   * @param key - Unique identifier for the loading state
   * @param loading - Loading status (true/false)
   */
  const registerLoading = useCallback((key: string, loading: boolean): void => {
    setLoadingStates((prev) => ({
      ...prev,
      [key]: loading,
    }));
  }, []);

  // Effect to determine if global loading is completed
  useEffect(() => {
    const allStates = Object.values(loadingStates);
    const hasAnyLoading = allStates.some((state) => state === true);
    const hasStates = allStates.length > 0;

    // If we have at least one state and none are loading
    if (hasStates && !hasAnyLoading) {
      // Minimum delay for loading screen (to avoid flash)
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 1500); // 1.5 seconds minimum

      return () => clearTimeout(timer);
    }
  }, [loadingStates]);

  return {
    isLoading,
    registerLoading,
    loadingStates,
  };
}
