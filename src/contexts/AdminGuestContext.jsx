'use client';

import { createContext, useContext, useEffect, useState } from 'react';

const AdminGuestContext = createContext();

export function AdminGuestProvider({ children }) {
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    const guestMode = localStorage.getItem('guestMode') === 'true';
    setIsGuest(guestMode);
  }, []);

  const logoutGuest = () => {
    localStorage.removeItem('guestMode');
    setIsGuest(false);
  };

  return (
    <AdminGuestContext.Provider value={{ isGuest, logoutGuest }}>
      {children}
    </AdminGuestContext.Provider>
  );
}

export function useAdminGuest() {
  return useContext(AdminGuestContext);
}
