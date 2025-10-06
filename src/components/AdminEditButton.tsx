'use client';

import { Button } from '@/components/ui/button';
import { useAdminGuest } from '@/contexts/AdminGuestContext';
import { useAuth } from '@/lib/supabase';
import { Edit } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState, type ButtonHTMLAttributes, type ReactNode } from 'react';

// =====================================
// TYPE DEFINITIONS
// =====================================

interface AdminEditButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'size'> {
  href: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'outline' | 'default' | 'ghost' | 'secondary';
  className?: string;
  children?: ReactNode;
}

interface ProjectEditButtonProps {
  projectId: string;
  className?: string;
}

// =====================================
// ADMIN EDIT BUTTON COMPONENT
// =====================================

/**
 * Generic admin edit button component with authentication checks
 * @param props - Admin edit button properties
 * @returns JSX Element for admin edit button or null
 */
export default function AdminEditButton({
  href,
  size = 'sm',
  variant = 'outline',
  className = '',
  children,
  ...props
}: AdminEditButtonProps): JSX.Element | null {
  const { isAuthenticated } = useAuth();
  const { isGuest } = useAdminGuest();
  const [showButton, setShowButton] = useState<boolean>(false);

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
        title={isGuest ? 'Modification non disponible en mode invité' : 'Modifier ce projet'}
        {...props}
      >
        <Edit className="w-4 h-4" />
        {children && <span className="ml-1">{children}</span>}
      </Button>
    </Link>
  );
}

// =====================================
// PROJECT EDIT BUTTON COMPONENT
// =====================================

/**
 * Quick access component for project edit
 * @param props - Project edit button properties
 * @returns JSX Element for project edit button
 */
export function ProjectEditButton({ projectId, className = '' }: ProjectEditButtonProps): JSX.Element | null {
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

// =====================================
// AUTH STATUS INDICATOR COMPONENT
// =====================================

/**
 * Auth status indicator for development
 * @returns JSX Element for auth status indicator or null
 */
export function AuthStatusIndicator(): JSX.Element | null {
  const { isAuthenticated } = useAuth();
  const { isGuest } = useAdminGuest();

  if (!isAuthenticated && !isGuest) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 bg-white dark:bg-gray-800 border rounded-lg px-3 py-2 shadow-lg text-xs">
      <div className="flex items-center gap-2">
        <div
          className={`w-2 h-2 rounded-full ${isAuthenticated ? 'bg-green-500' : 'bg-blue-500'}`}
        />
        <span className="text-muted-foreground">
          {isAuthenticated ? 'Admin connecté' : 'Mode invité'}
        </span>
      </div>
    </div>
  );
}
