'use client';

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/supabase";
import { Loader2, Shield } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AdminLogin() {
  const { user, loading, signIn, isAuthenticated } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  // Rediriger si déjà connecté
  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.push('/admin/dashboard');
    }
  }, [loading, isAuthenticated, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    const result = await signIn(email, password);
    
    if (result.success) {
      router.push('/admin/dashboard');
    } else {
      setError(result.error);
    }
    
    setIsSubmitting(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Shield className="mx-auto h-12 w-12 text-primary" />
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Administration Portfolio
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Connectez-vous pour gérer votre contenu
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Connexion Admin</CardTitle>
            <CardDescription>
              Saisissez vos identifiants d'administrateur
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Connexion...
                  </>
                ) : (
                  'Se connecter'
                )}
              </Button>
            </form>

            <div className="mt-4 text-center text-sm">
              <Button 
                variant="link" 
                className="text-gray-600"
                onClick={() => {
                  // Clear guest mode completely when returning to public site
                  localStorage.removeItem('guestMode');
                  localStorage.removeItem('wasVisitor');
                  router.push('/');
                }}
              >
                Retour sur le site
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="text-center text-sm text-gray-500">
          <p>Interface d'administration sécurisée</p>
          <p>Accès restreint aux administrateurs autorisés</p>
        </div>
      </div>
    </div>
  );
}
