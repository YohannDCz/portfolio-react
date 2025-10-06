'use client';

import type { Language } from '@/types';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

// ——————————————————————————————————————————————
// TYPE DEFINITIONS
// ——————————————————————————————————————————————

interface LanguageInfo {
  code: Language;
  name: string;
  flag: string;
  dir: 'ltr' | 'rtl';
}

interface LanguageContextType {
  currentLang: Language;
  isRTL: boolean;
  languages: LanguageInfo[];
  currentLanguage: LanguageInfo | undefined;
  switchLanguage: (lang: Language) => void;
}

interface LanguageProviderProps {
  children: ReactNode;
}

interface DirectionalClassesHook {
  getDirectionalClass: (ltrClass: string, rtlClass?: string | null) => string;
  getFlexDirection: (direction?: string) => string;
  getTextAlign: (align?: string) => string;
  getMarginPadding: (property: string, value: string) => string;
  getBorderRadius: (radius: string) => string;
  isRTL: boolean;
}

// ——————————————————————————————————————————————
// CONTEXTE MULTILINGUE ET RTL
// ——————————————————————————————————————————————

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

/**
 * Language Context Provider
 * Manages language switching and RTL support
 * @param children - React children components
 */
export function LanguageProvider({ children }: LanguageProviderProps): JSX.Element {
  const [currentLang, setCurrentLang] = useState<Language>('fr');
  const [isRTL, setIsRTL] = useState<boolean>(false);

  /**
   * Switch application language and update HTML attributes
   * @param lang - Target language code
   */
  const switchLanguage = (lang: Language): void => {
    setCurrentLang(lang);
    setIsRTL(lang === 'ar');
    localStorage.setItem('portfolio_language', lang);

    // Mettre à jour les attributs HTML
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';

    // Ajouter classe CSS pour RTL
    if (lang === 'ar') {
      document.documentElement.classList.add('rtl');
    } else {
      document.documentElement.classList.remove('rtl');
    }
  };

  useEffect(() => {
    const savedLang = (localStorage.getItem('portfolio_language') as Language) || 'fr';
    switchLanguage(savedLang);
  }, []);

  // Configuration des langues disponibles
  const languages: LanguageInfo[] = [
    { code: 'fr', name: 'Français', flag: '🇫🇷', dir: 'ltr' },
    { code: 'en', name: 'English', flag: '🇺🇸', dir: 'ltr' },
    { code: 'hi', name: 'हिन्दी', flag: '🇮🇳', dir: 'ltr' },
    { code: 'ar', name: 'العربية', flag: '🇸🇦', dir: 'rtl' },
    { code: 'zh', name: '简体中文', flag: '🇨🇳', dir: 'ltr' }
  ];

  const currentLanguage = languages.find(lang => lang.code === currentLang);

  const contextValue: LanguageContextType = {
    currentLang,
    isRTL,
    languages,
    currentLanguage,
    switchLanguage
  };

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
}

/**
 * Hook to use the Language context
 * @returns Language context value
 * @throws Error if used outside of LanguageProvider
 */
export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

// ——————————————————————————————————————————————
// HOOK POUR LES CLASSES CSS DIRECTIONNELLES
// ——————————————————————————————————————————————

/**
 * Hook for managing directional CSS classes (LTR/RTL)
 * @returns Object with directional utility functions
 */
export function useDirectionalClasses(): DirectionalClassesHook {
  const { isRTL } = useLanguage();

  /**
   * Get directional CSS class based on current text direction
   * @param ltrClass - CSS class for left-to-right text
   * @param rtlClass - CSS class for right-to-left text (optional, auto-generated if not provided)
   * @returns Appropriate CSS class for current direction
   */
  const getDirectionalClass = (ltrClass: string, rtlClass?: string | null): string => {
    if (!rtlClass) {
      // Auto-génération des classes RTL communes
      const rtlMappings: Record<string, string> = {
        'text-left': 'text-right',
        'text-right': 'text-left',
        'mr-': 'ml-',
        'ml-': 'mr-',
        'pr-': 'pl-',
        'pl-': 'pr-',
        'border-l': 'border-r',
        'border-r': 'border-l',
        'rounded-l': 'rounded-r',
        'rounded-r': 'rounded-l',
        'left-': 'right-',
        'right-': 'left-',
        'float-left': 'float-right',
        'float-right': 'float-left'
      };

      for (const [ltr, rtl] of Object.entries(rtlMappings)) {
        if (ltrClass.includes(ltr)) {
          rtlClass = ltrClass.replace(new RegExp(ltr, 'g'), rtl);
          break;
        }
      }
    }

    return isRTL ? (rtlClass || ltrClass) : ltrClass;
  };

  /**
   * Get flex direction class based on current text direction
   * @param direction - Base flex direction
   * @returns Directional flex class
   */
  const getFlexDirection = (direction: string = 'row'): string => {
    if (!isRTL) return direction;

    const directionMappings: Record<string, string> = {
      'row': 'row-reverse',
      'row-reverse': 'row',
      'flex-row': 'flex-row-reverse',
      'flex-row-reverse': 'flex-row'
    };

    return directionMappings[direction] || direction;
  };

  /**
   * Get text alignment class based on current text direction
   * @param align - Base text alignment
   * @returns Directional text alignment class
   */
  const getTextAlign = (align: string = 'left'): string => {
    if (!isRTL) return align;

    const alignMappings: Record<string, string> = {
      'left': 'right',
      'right': 'left',
      'text-left': 'text-right',
      'text-right': 'text-left'
    };

    return alignMappings[align] || align;
  };

  /**
   * Get margin/padding class based on current text direction
   * @param property - CSS property prefix (ml, mr, pl, pr)
   * @param value - CSS value
   * @returns Directional margin/padding class
   */
  const getMarginPadding = (property: string, value: string): string => {
    if (!isRTL) return `${property}-${value}`;

    const mappings: Record<string, string> = {
      'ml': 'mr',
      'mr': 'ml',
      'pl': 'pr',
      'pr': 'pl'
    };

    return `${mappings[property] || property}-${value}`;
  };

  /**
   * Get border radius class based on current text direction
   * @param radius - Base border radius class
   * @returns Directional border radius class
   */
  const getBorderRadius = (radius: string): string => {
    if (!isRTL) return radius;

    const radiusMappings: Record<string, string> = {
      'rounded-l': 'rounded-r',
      'rounded-r': 'rounded-l',
      'rounded-tl': 'rounded-tr',
      'rounded-tr': 'rounded-tl',
      'rounded-bl': 'rounded-br',
      'rounded-br': 'rounded-bl',
      'rounded-l-lg': 'rounded-r-lg',
      'rounded-r-lg': 'rounded-l-lg'
    };

    return radiusMappings[radius] || radius;
  };

  return {
    getDirectionalClass,
    getFlexDirection,
    getTextAlign,
    getMarginPadding,
    getBorderRadius,
    isRTL
  };
}
