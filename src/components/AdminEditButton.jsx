'use client';

import { Button } from "@/components/ui/button";
import { useAdminGuest } from "@/contexts/AdminGuestContext";
import { useAuth } from "@/lib/supabase";
import { Edit } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function AdminEditButton({ 
  href, 
  size = "sm", 
  variant = "outline",
  className = "",
  children,
  ...props 
}) {
  const { isAuthenticated } = useAuth();
  const { isGuest } = useAdminGuest();
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    // Show button if user is authenticated or in guest mode
    setShowButton(isAuthenticated || isGuest);
  }, [isAuthenticated, isGuest]);

  // Don't render anything if not authenticated
  if (!showButton) {
    return null;
  }

  return (
    <Link href={href} passHref>
      <Button
        variant={variant}
        size={size}
        className={`admin-edit-button ${className}`}
        disabled={isGuest}
        title={isGuest ? "Modification non disponible en mode invité" : "Modifier ce projet"}
        {...props}
      >
        <Edit className="w-4 h-4" />
        {children && <span className="ml-1">{children}</span>}
      </Button>
    </Link>
  );
}

// Quick access component for project edit
export function ProjectEditButton({ projectId, className = "" }) {
  return (
    <AdminEditButton
      href={`/admin/projects/edit/${projectId}`}
      className={`absolute top-2 right-2 z-10 bg-white/90 hover:bg-white shadow-sm border ${className}`}
      size="sm"
    >
      Modifier
    </AdminEditButton>
  );
}

// Auth status indicator for development
export function AuthStatusIndicator() {
  const { isAuthenticated } = useAuth();
  const { isGuest } = useAdminGuest();

  if (!isAuthenticated && !isGuest) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 bg-white dark:bg-gray-800 border rounded-lg px-3 py-2 shadow-lg text-xs">
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${isAuthenticated ? 'bg-green-500' : 'bg-blue-500'}`} />
        <span className="text-muted-foreground">
          {isAuthenticated ? 'Admin connecté' : 'Mode invité'}
        </span>
      </div>
    </div>
  );
}
