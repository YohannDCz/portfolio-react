// Field Mapping Service - Automatic translation of database fields

import { createClient } from '@supabase/supabase-js'
import { TranslationService } from './service.js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

/**
 * Field Mapping Service
 * Automatically translates database fields based on configuration
 */
export class FieldMappingService {
  constructor() {
    this.translationService = new TranslationService()
    this.mappingTable = 'translation_field_mappings'
    this.initialized = false
  }

  /**
   * Initialize the service
   */
  async initialize() {
    if (!this.initialized) {
      await this.translationService.initialize()
      this.initialized = true
    }
  }

  /**
   * Get field mappings for a table
   */
  async getTableMappings(tableName) {
    try {
      const { data: mappings, error } = await supabase
        .from(this.mappingTable)
        .select('*')
        .eq('table_name', tableName)
        .eq('auto_translate', true)
        .order('priority', { ascending: false })

      if (error) {
        console.error('Failed to get table mappings:', error)
        return []
      }

      return mappings || []
    } catch (error) {
      console.error('Error getting table mappings:', error)
      return []
    }
  }

  /**
   * Auto-translate a record when inserted/updated
   */
  async autoTranslateRecord(tableName, record, sourceLanguage = 'fr') {
    try {
      await this.initialize()

      const mappings = await this.getTableMappings(tableName)
      if (mappings.length === 0) {
        return record // No mappings, return original
      }

      const translationTasks = []
      const updatedRecord = { ...record }

      for (const mapping of mappings) {
        const sourceField = `${mapping.field_name}_${sourceLanguage}`
        const sourceText = record[sourceField]

        if (!sourceText) {
          continue // No source text to translate
        }

        for (const targetLang of mapping.target_languages) {
          if (targetLang === sourceLanguage) {
            continue // Skip source language
          }

          const targetField = `${mapping.field_name}_${targetLang}`

          // Only translate if target field is empty or doesn't exist
          if (!record[targetField]) {
            translationTasks.push({
              sourceText,
              sourceLang: sourceLanguage,
              targetLang,
              targetField,
              fieldType: mapping.field_type,
              priority: mapping.priority
            })
          }
        }
      }

      if (translationTasks.length === 0) {
        return record // Nothing to translate
      }

      // Sort by priority and process in batches
      translationTasks.sort((a, b) => b.priority - a.priority)

      const batchSize = 10 // Process 10 translations at once
      for (let i = 0; i < translationTasks.length; i += batchSize) {
        const batch = translationTasks.slice(i, i + batchSize)

        const batchItems = batch.map(task => ({
          text: task.sourceText,
          source: task.sourceLang,
          target: task.targetLang
        }))

        try {
          const results = await this.translationService.translateBatch(batchItems)

          // Apply translations to record
          batch.forEach((task, index) => {
            const result = results[index]
            if (result && result.translatedText) {
              updatedRecord[task.targetField] = this.processTranslationByType(
                result.translatedText,
                task.fieldType
              )
            }
          })
        } catch (error) {
          console.error('Batch translation failed:', error)
          // Continue with next batch instead of failing completely
        }
      }

      return updatedRecord
    } catch (error) {
      console.error('Auto-translate record error:', error)
      return record // Return original on error
    }
  }

  /**
   * Process translation based on field type
   */
  processTranslationByType(translatedText, fieldType) {
    switch (fieldType) {
      case 'html':
        // Preserve HTML structure (basic cleanup)
        return this.preserveHtmlStructure(translatedText)

      case 'markdown':
        // Preserve markdown formatting
        return this.preserveMarkdownStructure(translatedText)

      case 'text':
      default:
        return translatedText.trim()
    }
  }

  /**
   * Preserve HTML structure in translations
   */
  preserveHtmlStructure(text) {
    // Basic HTML preservation - this could be enhanced
    return text
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .trim()
  }

  /**
   * Preserve markdown structure in translations
   */
  preserveMarkdownStructure(text) {
    // Basic markdown preservation - this could be enhanced
    return text.trim()
  }

  /**
   * Bulk translate existing records
   */
  async bulkTranslateTable(tableName, sourceLanguage = 'fr', options = {}) {
    try {
      await this.initialize()

      const mappings = await this.getTableMappings(tableName)
      if (mappings.length === 0) {
        return { success: false, error: 'No field mappings found for table' }
      }

      // Get records that need translation
      const { data: records, error: fetchError } = await supabase
        .from(tableName)
        .select('*')
        .limit(options.limit || 100)
        .range(options.offset || 0, (options.offset || 0) + (options.limit || 100) - 1)

      if (fetchError) {
        throw new Error(`Failed to fetch records: ${fetchError.message}`)
      }

      if (!records || records.length === 0) {
        return { success: true, translated: 0, message: 'No records to translate' }
      }

      let translated = 0
      const errors = []

      // Process records in batches
      const batchSize = 10
      for (let i = 0; i < records.length; i += batchSize) {
        const batch = records.slice(i, i + batchSize)

        for (const record of batch) {
          try {
            const translatedRecord = await this.autoTranslateRecord(
              tableName,
              record,
              sourceLanguage
            )

            // Check if any translations were added
            let hasTranslations = false
            for (const mapping of mappings) {
              for (const targetLang of mapping.target_languages) {
                const targetField = `${mapping.field_name}_${targetLang}`
                if (translatedRecord[targetField] !== record[targetField]) {
                  hasTranslations = true
                  break
                }
              }
              if (hasTranslations) break
            }

            if (hasTranslations) {
              // Update record in database
              const { error: updateError } = await supabase
                .from(tableName)
                .update(translatedRecord)
                .eq('id', record.id)

              if (updateError) {
                errors.push({
                  recordId: record.id,
                  error: updateError.message
                })
              } else {
                translated++
              }
            }
          } catch (error) {
            errors.push({
              recordId: record.id,
              error: error.message
            })
          }
        }

        // Small delay between batches to avoid overwhelming the system
        if (i + batchSize < records.length) {
          await new Promise(resolve => setTimeout(resolve, 1000))
        }
      }

      return {
        success: true,
        translated,
        errors: errors.length > 0 ? errors : undefined,
        message: `Translated ${translated} records`
      }

    } catch (error) {
      console.error('Bulk translate table error:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  /**
   * Create or update field mapping
   */
  async setFieldMapping(tableName, fieldName, config) {
    try {
      const mapping = {
        table_name: tableName,
        field_name: fieldName,
        field_type: config.fieldType || 'text',
        auto_translate: config.autoTranslate !== false,
        priority: config.priority || 1,
        source_language: config.sourceLanguage || 'fr',
        target_languages: config.targetLanguages || ['en', 'hi', 'ar']
      }

      const { data, error } = await supabase
        .from(this.mappingTable)
        .upsert(mapping, { onConflict: 'table_name,field_name' })
        .select()
        .single()

      if (error) {
        throw new Error(`Failed to set field mapping: ${error.message}`)
      }

      return { success: true, mapping: data }
    } catch (error) {
      console.error('Set field mapping error:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Remove field mapping
   */
  async removeFieldMapping(tableName, fieldName) {
    try {
      const { error } = await supabase
        .from(this.mappingTable)
        .delete()
        .eq('table_name', tableName)
        .eq('field_name', fieldName)

      if (error) {
        throw new Error(`Failed to remove field mapping: ${error.message}`)
      }

      return { success: true }
    } catch (error) {
      console.error('Remove field mapping error:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Get all field mappings
   */
  async getAllMappings() {
    try {
      const { data: mappings, error } = await supabase
        .from(this.mappingTable)
        .select('*')
        .order('table_name')
        .order('priority', { ascending: false })

      if (error) {
        throw new Error(`Failed to get mappings: ${error.message}`)
      }

      // Group by table
      const grouped = {}
      mappings.forEach(mapping => {
        if (!grouped[mapping.table_name]) {
          grouped[mapping.table_name] = []
        }
        grouped[mapping.table_name].push(mapping)
      })

      return { success: true, mappings: grouped }
    } catch (error) {
      console.error('Get all mappings error:', error)
      return { success: false, error: error.message, mappings: {} }
    }
  }

  /**
   * Sync translations for specific record
   */
  async syncRecordTranslations(tableName, recordId, sourceLanguage = 'fr', force = false) {
    try {
      await this.initialize()

      // Get the record
      const { data: record, error: fetchError } = await supabase
        .from(tableName)
        .select('*')
        .eq('id', recordId)
        .single()

      if (fetchError || !record) {
        throw new Error(`Failed to fetch record: ${fetchError?.message || 'Record not found'}`)
      }

      // Get mappings
      const mappings = await this.getTableMappings(tableName)
      if (mappings.length === 0) {
        return { success: false, error: 'No field mappings found' }
      }

      // Force retranslation or only translate missing fields
      const translatedRecord = { ...record }
      const translationTasks = []

      for (const mapping of mappings) {
        const sourceField = `${mapping.field_name}_${sourceLanguage}`
        const sourceText = record[sourceField]

        if (!sourceText) continue

        for (const targetLang of mapping.target_languages) {
          if (targetLang === sourceLanguage) continue

          const targetField = `${mapping.field_name}_${targetLang}`

          // Translate if force=true or field is empty
          if (force || !record[targetField]) {
            translationTasks.push({
              sourceText,
              sourceLang: sourceLanguage,
              targetLang,
              targetField,
              fieldType: mapping.field_type
            })
          }
        }
      }

      if (translationTasks.length === 0) {
        return { success: true, message: 'No translations needed' }
      }

      // Process translations
      const batchItems = translationTasks.map(task => ({
        text: task.sourceText,
        source: task.sourceLang,
        target: task.targetLang
      }))

      const results = await this.translationService.translateBatch(batchItems)

      // Apply translations
      translationTasks.forEach((task, index) => {
        const result = results[index]
        if (result && result.translatedText) {
          translatedRecord[task.targetField] = this.processTranslationByType(
            result.translatedText,
            task.fieldType
          )
        }
      })

      // Update record
      const { error: updateError } = await supabase
        .from(tableName)
        .update(translatedRecord)
        .eq('id', recordId)

      if (updateError) {
        throw new Error(`Failed to update record: ${updateError.message}`)
      }

      return {
        success: true,
        translated: translationTasks.length,
        message: `Synced ${translationTasks.length} translations`
      }

    } catch (error) {
      console.error('Sync record translations error:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Test field mapping configuration
   */
  async testFieldMapping(tableName, fieldName, sampleText, targetLanguages) {
    try {
      await this.initialize()

      const batchItems = targetLanguages.map(lang => ({
        text: sampleText,
        source: 'auto',
        target: lang
      }))

      const results = await this.translationService.translateBatch(batchItems)

      const testResults = {}
      targetLanguages.forEach((lang, index) => {
        const result = results[index]
        testResults[lang] = {
          success: !!result.translatedText,
          translation: result.translatedText || 'Translation failed',
          provider: result.provider,
          cached: result.cached || false,
          error: result.error
        }
      })

      return { success: true, results: testResults }
    } catch (error) {
      console.error('Test field mapping error:', error)
      return { success: false, error: error.message }
    }
  }
}
