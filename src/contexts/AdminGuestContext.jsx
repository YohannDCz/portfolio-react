'use client';

import { createContext, useContext, useEffect, useState } from 'react';

const AdminGuestContext = createContext();

export function AdminGuestProvider({ children }) {
  const [isGuest, setIsGuest] = useState(false);
  const [wasVisitor, setWasVisitor] = useState(false);

  useEffect(() => {
    const guestMode = localStorage.getItem('guestMode') === 'true';
    const visitorFlag = localStorage.getItem('wasVisitor') === 'true';
    setIsGuest(guestMode);
    setWasVisitor(visitorFlag);
  }, []);

  const loginGuest = () => {
    localStorage.setItem('guestMode', 'true');
    localStorage.setItem('wasVisitor', 'true');
    setIsGuest(true);
    setWasVisitor(true);
  };

  const logoutGuest = () => {
    localStorage.removeItem('guestMode');
    setIsGuest(false);
    // Keep wasVisitor flag for session handling
  };

  const clearVisitorSession = () => {
    localStorage.removeItem('wasVisitor');
    setWasVisitor(false);
  };

  const transitionToAdmin = () => {
    // If user was visitor and now logs in as admin, clear visitor mode immediately
    if (wasVisitor && isGuest) {
      localStorage.removeItem('guestMode');
      setIsGuest(false);
    }
  };

  return (
    <AdminGuestContext.Provider value={{ isGuest, wasVisitor, loginGuest, logoutGuest, clearVisitorSession, transitionToAdmin }}>
      {children}
    </AdminGuestContext.Provider>
  );
}

export function useAdminGuest() {
  return useContext(AdminGuestContext);
}
