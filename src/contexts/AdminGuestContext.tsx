'use client';

import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

// =====================================
// TYPE DEFINITIONS
// =====================================

interface AdminGuestContextType {
  isGuest: boolean;
  wasVisitor: boolean;
  loginGuest: () => void;
  logoutGuest: () => void;
  clearVisitorSession: () => void;
  transitionToAdmin: () => void;
}

interface AdminGuestProviderProps {
  children: ReactNode;
}

// =====================================
// ADMIN GUEST CONTEXT
// =====================================

const AdminGuestContext = createContext<AdminGuestContextType | undefined>(undefined);

/**
 * Admin Guest Context Provider
 * Manages guest mode and visitor session state for admin access
 * @param children - React children components
 */
export function AdminGuestProvider({ children }: AdminGuestProviderProps): JSX.Element {
  const [isGuest, setIsGuest] = useState<boolean>(false);
  const [wasVisitor, setWasVisitor] = useState<boolean>(false);

  useEffect(() => {
    const guestMode = localStorage.getItem('guestMode') === 'true';
    const visitorFlag = localStorage.getItem('wasVisitor') === 'true';
    setIsGuest(guestMode);
    setWasVisitor(visitorFlag);
  }, []);

  /**
   * Enable guest mode and set visitor flag
   */
  const loginGuest = (): void => {
    localStorage.setItem('guestMode', 'true');
    localStorage.setItem('wasVisitor', 'true');
    setIsGuest(true);
    setWasVisitor(true);
  };

  /**
   * Disable guest mode but keep visitor session
   */
  const logoutGuest = (): void => {
    localStorage.removeItem('guestMode');
    setIsGuest(false);
    // Keep wasVisitor flag for session handling
  };

  /**
   * Clear visitor session completely
   */
  const clearVisitorSession = (): void => {
    localStorage.removeItem('wasVisitor');
    setWasVisitor(false);
  };

  /**
   * Transition from guest mode to admin mode
   * If user was visitor and now logs in as admin, clear visitor mode immediately
   */
  const transitionToAdmin = (): void => {
    if (wasVisitor && isGuest) {
      localStorage.removeItem('guestMode');
      setIsGuest(false);
    }
  };

  const contextValue: AdminGuestContextType = {
    isGuest,
    wasVisitor,
    loginGuest,
    logoutGuest,
    clearVisitorSession,
    transitionToAdmin
  };

  return (
    <AdminGuestContext.Provider value={contextValue}>
      {children}
    </AdminGuestContext.Provider>
  );
}

/**
 * Hook to use the Admin Guest context
 * @returns Admin guest context value
 * @throws Error if used outside of AdminGuestProvider
 */
export function useAdminGuest(): AdminGuestContextType {
  const context = useContext(AdminGuestContext);

  if (context === undefined) {
    throw new Error('useAdminGuest must be used within an AdminGuestProvider');
  }

  return context;
}
