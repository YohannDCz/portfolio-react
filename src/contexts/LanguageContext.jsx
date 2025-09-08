'use client';

import { createContext, useContext, useEffect, useState } from 'react';

// ——————————————————————————————————————————————
// CONTEXTE MULTILINGUE ET RTL
// ——————————————————————————————————————————————

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [currentLang, setCurrentLang] = useState('fr');
  const [isRTL, setIsRTL] = useState(false);

  const switchLanguage = (lang) => {
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
    const savedLang = localStorage.getItem('portfolio_language') || 'fr';
    switchLanguage(savedLang);
  }, []);

  // Configuration des langues disponibles
  const languages = [
    { code: 'fr', name: 'Français', flag: '🇫🇷', dir: 'ltr' },
    { code: 'en', name: 'English', flag: '🇺🇸', dir: 'ltr' },
    { code: 'hi', name: 'हिन्दी', flag: '🇮🇳', dir: 'ltr' },
    { code: 'ar', name: 'العربية', flag: '🇸🇦', dir: 'rtl' },
    { code: 'zh', name: '简体中文', flag: '🇨🇳', dir: 'ltr' }
  ];

  const currentLanguage = languages.find(lang => lang.code === currentLang);

  const value = {
    currentLang,
    isRTL,
    languages,
    currentLanguage,
    switchLanguage
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

// ——————————————————————————————————————————————
// HOOK POUR LES CLASSES CSS DIRECTIONNELLES
// ——————————————————————————————————————————————

export function useDirectionalClasses() {
  const { isRTL } = useLanguage();
  
  const getDirectionalClass = (ltrClass, rtlClass = null) => {
    if (!rtlClass) {
      // Auto-génération des classes RTL communes
      const rtlMappings = {
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

  const getFlexDirection = (direction = 'row') => {
    if (!isRTL) return direction;
    
    const directionMappings = {
      'row': 'row-reverse',
      'row-reverse': 'row',
      'flex-row': 'flex-row-reverse',
      'flex-row-reverse': 'flex-row'
    };
    
    return directionMappings[direction] || direction;
  };

  const getTextAlign = (align = 'left') => {
    if (!isRTL) return align;
    
    const alignMappings = {
      'left': 'right',
      'right': 'left',
      'text-left': 'text-right',
      'text-right': 'text-left'
    };
    
    return alignMappings[align] || align;
  };

  const getMarginPadding = (property, value) => {
    if (!isRTL) return `${property}-${value}`;
    
    const mappings = {
      'ml': 'mr',
      'mr': 'ml',
      'pl': 'pr',
      'pr': 'pl'
    };
    
    return `${mappings[property] || property}-${value}`;
  };

  const getBorderRadius = (radius) => {
    if (!isRTL) return radius;
    
    const radiusMappings = {
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
