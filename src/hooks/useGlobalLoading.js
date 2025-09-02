'use client';

import { useCallback, useEffect, useState } from 'react';

export function useGlobalLoading() {
  const [isLoading, setIsLoading] = useState(true);
  const [loadingStates, setLoadingStates] = useState({});

  // Fonction pour enregistrer un état de chargement (mémorisée)
  const registerLoading = useCallback((key, loading) => {
    setLoadingStates(prev => ({
      ...prev,
      [key]: loading
    }));
  }, []);

  // Effet pour déterminer si le chargement global est terminé
  useEffect(() => {
    const allStates = Object.values(loadingStates);
    const hasAnyLoading = allStates.some(state => state === true);
    const hasStates = allStates.length > 0;

    // Si on a au moins un état et qu'aucun n'est en cours de chargement
    if (hasStates && !hasAnyLoading) {
      // Délai minimum pour l'écran de chargement (pour éviter le flash)
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 1500); // 1.5 secondes minimum

      return () => clearTimeout(timer);
    }
  }, [loadingStates]);

  return {
    isLoading,
    registerLoading,
    loadingStates
  };
}
