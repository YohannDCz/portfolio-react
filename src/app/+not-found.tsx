'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { ArrowLeft, Home, Search } from 'lucide-react';
import Link from 'next/link';

// =====================================
// ADMIN NOT FOUND PAGE COMPONENT
// =====================================

/**
 * Admin section 404 page with animations and navigation options
 * @returns JSX Element for admin not found page
 */
export default function NotFound(): JSX.Element {
  /**
   * Handle browser back navigation
   */
  const handleGoBack = (): void => {
    window.history.back();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full"
      >
        <Card className="text-center border-none shadow-2xl bg-background/80 backdrop-blur">
          <CardContent className="pt-12 pb-8 px-8">
            {/* Animated 404 */}
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{
                duration: 0.6,
                type: 'spring',
                stiffness: 100,
              }}
              className="mb-6"
            >
              <div className="text-8xl font-bold text-primary/20 mb-2">404</div>
              <div className="text-2xl font-semibold text-foreground mb-2">Page introuvable</div>
              <p className="text-muted-foreground">
                Oups ! Cette page semble s'être égarée dans le cyberespace.
              </p>
            </motion.div>

            {/* Fun animation */}
            <motion.div
              animate={{
                rotate: [0, 10, -10, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: 'reverse',
              }}
              className="mb-8"
            >
              <Search className="w-16 h-16 mx-auto text-primary/60" />
            </motion.div>

            {/* Action buttons */}
            <div className="space-y-3">
              <Link href="/" className="w-full">
                <Button className="w-full gap-2" size="lg">
                  <Home className="w-4 h-4" />
                  Retour à l'accueil
                </Button>
              </Link>

              <Button variant="outline" className="w-full gap-2" onClick={handleGoBack}>
                <ArrowLeft className="w-4 h-4" />
                Page précédente
              </Button>
            </div>

            {/* Easter egg */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="text-xs text-muted-foreground mt-6"
            >
              💡 Conseil : Vérifiez l'URL ou utilisez la navigation principale
            </motion.p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
