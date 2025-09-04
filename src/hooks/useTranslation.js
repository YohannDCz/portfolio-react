'use client'

import { useState } from 'react'

/**
 * Simple translation hook for admin forms
 * Translates content between languages and populates form fields
 */
export function useTranslation() {
  const [translating, setTranslating] = useState(false)

  const translateFields = async (formData, setFormData, fieldMappings, showNotification = true) => {
    setTranslating(true)

    try {
      const updates = {}
      let translationCount = 0

      // Process each field mapping
      for (const { sourceField, targetFields } of fieldMappings) {
        const sourceText = formData[sourceField]

        if (!sourceText?.trim()) continue

        // Determine source language
        const sourceLang = sourceField.includes('_fr') ? 'fr' : 'en'

        // Translate to each target field
        for (const targetField of targetFields) {
          // Only translate if target field is empty
          if (formData[targetField]?.trim()) continue

          const targetLang = targetField.split('_').pop()
          if (!['en', 'fr', 'hi', 'ar'].includes(targetLang)) continue
          if (sourceLang === targetLang) continue

          try {
            const response = await fetch('/api/simple-translate', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                text: sourceText,
                source: sourceLang,
                target: targetLang
              })
            })

            const data = await response.json()

            if (data.success && data.translatedText) {
              updates[targetField] = data.translatedText
              translationCount++
            }
          } catch (error) {
            console.error(`Translation failed for ${targetField}:`, error)
          }
        }
      }

      // Apply all translations at once for better performance
      if (Object.keys(updates).length > 0) {
        setFormData(prev => ({
          ...prev,
          ...updates
        }))
      }

      // Show success notification if requested
      if (translationCount > 0 && showNotification) {
        console.log(`✅ Successfully translated ${translationCount} field(s)`)
      }

      return { success: translationCount > 0, translated: translationCount, updates }

    } catch (error) {
      console.error('Translation error:', error)
      return { success: false, error: error.message }
    } finally {
      setTranslating(false)
    }
  }

  return { translateFields, translating }
}
