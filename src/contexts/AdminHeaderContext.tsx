'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

type AdminHeaderActions = React.ReactNode;

interface AdminHeaderContextValue {
  headerActions: AdminHeaderActions | null;
  setHeaderActions: (actions: AdminHeaderActions | null) => void;
}

const AdminHeaderContext = createContext<AdminHeaderContextValue | null>(null);

export function AdminHeaderProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [headerActions, setHeaderActionsState] =
    useState<AdminHeaderActions | null>(null);
  const setHeaderActions = useCallback((actions: AdminHeaderActions | null) => {
    setHeaderActionsState(actions);
  }, []);

  return (
    <AdminHeaderContext.Provider value={{ headerActions, setHeaderActions }}>
      {children}
    </AdminHeaderContext.Provider>
  );
}

export function useAdminHeader() {
  const ctx = useContext(AdminHeaderContext);
  if (!ctx) return { headerActions: null, setHeaderActions: () => {} };
  return ctx;
}
