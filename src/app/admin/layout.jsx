'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AdminGuestProvider, useAdminGuest } from "@/contexts/AdminGuestContext";
import { useAuth } from "@/lib/supabase";
import {
  Award,
  Eye,
  FolderOpen,
  Globe,
  Kanban,
  LayoutDashboard,
  Loader2,
  LogOut,
  Mail,
  Settings,
  User
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

const navigation = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Projets', href: '/admin/projects', icon: FolderOpen },
  { name: 'Certifications', href: '/admin/certifications', icon: Award },
  { name: 'Compétences', href: '/admin/skills', icon: Settings },
  { name: 'Profil', href: '/admin/profile', icon: User },
  { name: 'Plateformes', href: '/admin/platforms', icon: Globe },
  { name: 'Messages', href: '/admin/contact', icon: Mail },
  { name: 'Kanban', href: '/admin/kanban', icon: Kanban }
];

function AdminLayoutContent({ children }) {
  const { user, loading, signOut, isAuthenticated } = useAuth();
  const { isGuest, logoutGuest } = useAdminGuest();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !isAuthenticated && !isGuest && pathname !== '/admin') {
      router.push('/admin');
    }
  }, [loading, isAuthenticated, isGuest, router, pathname]);

  const handleSignOut = async () => {
    if (isGuest) {
      logoutGuest();
    } else {
      await signOut();
    }
    router.push('/admin');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Page de connexion
  if ((!isAuthenticated && !isGuest) || pathname === '/admin') {
    return children;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg">
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex h-16 items-center gap-3 px-6 border-b">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <LayoutDashboard className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-semibold">Admin Portfolio</h1>
              <p className="text-xs text-gray-500">Panel d'administration</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6">
            <ul className="space-y-2">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={`
                        flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                        ${isActive 
                          ? 'bg-primary text-primary-foreground' 
                          : 'text-gray-700 hover:bg-gray-100'
                        }
                      `}
                    >
                      <item.icon className="h-5 w-5" />
                      {item.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* User info et déconnexion */}
          <div className="px-4 py-4 border-t">
            <Card className="p-3">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {isGuest ? "Invité" : user?.email}
                  </p>
                  <p className="text-xs text-gray-500">
                    {isGuest ? "Lecture seule" : "Administrateur"}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSignOut}
                  className="ml-2"
                  title={isGuest ? "Quitter le mode invité" : "Se déconnecter"}
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="pl-64">
        <main className="p-6">
          {isGuest && (
            <Card className="mb-6 bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800/30">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center">
                  <Eye className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-3" />
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    Vous êtes en mode visiteur. Bonne découverte ! 😉
                  </p>
                </div>
                <Button variant="ghost" size="sm" onClick={handleSignOut}>
                  Quitter le mode visiteur
                </Button>
              </CardContent>
            </Card>
          )}
          {children}
        </main>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }) {
  return (
    <AdminGuestProvider>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </AdminGuestProvider>
  );
}

