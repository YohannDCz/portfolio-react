'use client';

import type { Language } from '@/types';
import { Dispatch, SetStateAction, useState } from 'react';

// =====================================
// TYPE DEFINITIONS
// =====================================

interface FieldMapping {
  sourceField: string;
  targetFields: string[];
}

interface TranslationResult {
  success: boolean;
  translated?: number;
  updates?: Record<string, string>;
  error?: string;
  failedFields?: string[];
  shouldNotify?: boolean;
}

interface UseTranslationReturn {
  translateFields: (
    formData: Record<string, any>,
    setFormData: Dispatch<SetStateAction<Record<string, any>>>,
    fieldMappings: FieldMapping[],
    showNotification?: boolean,
  ) => Promise<TranslationResult>;
  translating: boolean;
}

// Supported languages for translation
const SUPPORTED_LANGUAGES: Language[] = ['en', 'fr', 'hi', 'ar', 'zh'] as const;

// =====================================
// TRANSLATION HOOK
// =====================================

/**
 * Simple translation hook for admin forms
 * Translates content between languages and populates form fields
 * @returns Object with translation function and loading state
 */
export function useTranslation(): UseTranslationReturn {
  const [translating, setTranslating] = useState<boolean>(false);

  /**
   * Translate form fields based on field mappings
   * @param formData - Current form data
   * @param setFormData - Form data setter function
   * @param fieldMappings - Array of field mapping configurations
   * @param showNotification - Whether to show success notification (default: true)
   * @returns Promise with translation result
   */
  const translateFields = async (
    formData: Record<string, any>,
    setFormData: Dispatch<SetStateAction<Record<string, any>>>,
    fieldMappings: FieldMapping[],
    showNotification: boolean = true,
  ): Promise<TranslationResult> => {
    setTranslating(true);

    try {
      const updates: Record<string, string> = {};
      let translationCount = 0;
      const failedFields: string[] = [];

      // Process each field mapping
      for (const { sourceField, targetFields } of fieldMappings) {
        const sourceText = formData[sourceField];

        if (!sourceText?.trim()) continue;

        // Determine source language
        const sourceLang = sourceField.includes('_fr') ? 'fr' : 'en';

        // Translate to each target field
        for (const targetField of targetFields) {
          const targetLang = targetField.split('_').pop() as Language;

          if (!SUPPORTED_LANGUAGES.includes(targetLang)) continue;
          if (sourceLang === targetLang) continue;

          // For FR <-> EN bidirectional translation, always translate (overwrite existing content)
          // For other languages (HI, AR, ZH), only translate if target field is empty
          const isFrEnBidirectional =
            (sourceLang === 'fr' && targetLang === 'en') ||
            (sourceLang === 'en' && targetLang === 'fr');

          if (!isFrEnBidirectional && formData[targetField]?.trim()) continue;

          try {
            const response = await fetch('/api/simple-translate', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                text: sourceText,
                source: sourceLang,
                target: targetLang,
              }),
            });

            if (!response.ok) {
              failedFields.push(targetField);
              continue;
            }

            const data = await response.json();

            if (data.success && data.translatedText) {
              updates[targetField] = data.translatedText;
              translationCount++;
            } else {
              failedFields.push(targetField);
            }
          } catch (error) {
            failedFields.push(targetField);
          }
        }
      }

      // Apply all translations at once for better performance
      if (Object.keys(updates).length > 0) {
        setFormData((prev) => ({
          ...prev,
          ...updates,
        }));
      }

      const shouldNotify = translationCount > 0 && showNotification;

      return {
        success: translationCount > 0,
        translated: translationCount,
        updates,
        failedFields: failedFields.length > 0 ? failedFields : undefined,
        shouldNotify,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      return { success: false, error: errorMessage, shouldNotify: false };
    } finally {
      setTranslating(false);
    }
  };

  return { translateFields, translating };
}
