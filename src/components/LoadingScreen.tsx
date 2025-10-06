'use client';

import { useLanguage } from "@/contexts/LanguageContext";
import type { Language } from "@/types";
import { motion } from "framer-motion";

// =====================================
// TYPE DEFINITIONS
// =====================================

interface TranslationsType {
  [key: string]: string;
}

// =====================================
// CONSTANTS
// =====================================

const TRANSLATIONS: Record<Language, string> = {
  fr: "Chargement...",
  en: "Loading...",
  hi: "लोड हो रहा है...",
  ar: "جاري التحميل...",
  zh: "加载中..."
};

// =====================================
// LOADING SCREEN COMPONENT
// =====================================

/**
 * Loading screen component with animated dots and localized text
 * @returns JSX Element for loading screen
 */
export default function LoadingScreen(): JSX.Element {
  const { currentLang } = useLanguage();
  const loadingText = TRANSLATIONS[currentLang] || TRANSLATIONS.fr;

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-background via-background/95 to-muted/30 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex flex-col items-center gap-4">
        {/* Trois points animés */}
        <div className="flex gap-2">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="w-3 h-3 bg-primary rounded-full"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.2,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>

        {/* Texte de chargement */}
        <p className="text-lg font-medium text-muted-foreground">
          {loadingText}
        </p>
      </div>
    </motion.div>
  );
}
