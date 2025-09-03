'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Info, X } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function Banner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const bannerDismissed = localStorage.getItem('bannerDismissed');
    if (!bannerDismissed) {
      setIsVisible(true);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('bannerDismissed', 'true');
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-primary/10 border-b border-primary/20 text-primary"
        >
          <div className="max-w-6xl mx-auto px-4 py-2 text-sm flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Info className="h-4 w-4" />
              <p>
                Le site est en cours de refonte, il est possible que des projets soient manquants.
              </p>
            </div>
            <button
              onClick={handleDismiss}
              className="p-1 rounded-md hover:bg-primary/20 transition-colors"
              aria-label="Fermer la banderole"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
