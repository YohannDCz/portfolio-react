// Translation Cache System - Redis-like caching with Supabase

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

/**
 * Translation Cache Manager
 * Stores translations in Supabase for persistence and fast retrieval
 */
export class TranslationCache {
  constructor() {
    this.tableName = 'translation_cache'
    this.defaultTTL = parseInt(process.env.TRANSLATION_CACHE_TTL) || 86400 // 24 hours
  }

  /**
   * Initialize cache table if it doesn't exist
   */
  async initialize() {
    const { error } = await supabase.rpc('create_translation_cache_table')
    if (error && !error.message.includes('already exists')) {
      console.error('Failed to initialize translation cache:', error)
    }
  }

  /**
   * Generate cache key for translation
   */
  generateKey(text, sourceLang, targetLang, provider = 'any') {
    const content = `${text.trim()}|${sourceLang}|${targetLang}|${provider}`
    return Buffer.from(content).toString('base64').slice(0, 64)
  }

  /**
   * Get cached translation
   */
  async get(text, sourceLang, targetLang, provider = 'any') {
    try {
      const key = this.generateKey(text, sourceLang, targetLang, provider)

      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('cache_key', key)
        .gt('expires_at', new Date().toISOString())
        .single()

      if (error || !data) {
        return null
      }

      // Update last accessed
      await this.updateLastAccessed(key)

      return {
        translatedText: data.translated_text,
        detectedSourceLanguage: data.detected_source_language,
        provider: data.provider,
        cached: true,
        cachedAt: data.created_at
      }
    } catch (error) {
      console.error('Cache get error:', error)
      return null
    }
  }

  /**
   * Store translation in cache
   */
  async set(text, sourceLang, targetLang, result, provider, ttl = null) {
    try {
      const key = this.generateKey(text, sourceLang, targetLang, provider)
      const expiresAt = new Date(Date.now() + (ttl || this.defaultTTL) * 1000)

      const { error } = await supabase
        .from(this.tableName)
        .upsert({
          cache_key: key,
          source_text: text.slice(0, 1000), // Limit for storage
          source_language: sourceLang,
          target_language: targetLang,
          translated_text: result.translatedText,
          detected_source_language: result.detectedSourceLanguage,
          provider: provider,
          characters_count: text.length,
          expires_at: expiresAt.toISOString(),
          last_accessed_at: new Date().toISOString(),
          access_count: 1
        }, {
          onConflict: 'cache_key'
        })

      if (error) {
        console.error('Cache set error:', error)
      }
    } catch (error) {
      console.error('Cache set error:', error)
    }
  }

  /**
   * Get cached translations for batch
   */
  async getBatch(items) {
    try {
      const keys = items.map(item =>
        this.generateKey(item.text, item.source, item.target, item.provider || 'any')
      )

      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .in('cache_key', keys)
        .gt('expires_at', new Date().toISOString())

      if (error || !data) {
        return []
      }

      // Map results back to original items
      const cached = {}
      data.forEach(row => {
        cached[row.cache_key] = {
          translatedText: row.translated_text,
          detectedSourceLanguage: row.detected_source_language,
          provider: row.provider,
          cached: true,
          cachedAt: row.created_at
        }
      })

      return items.map(item => {
        const key = this.generateKey(item.text, item.source, item.target, item.provider || 'any')
        return cached[key] || null
      })
    } catch (error) {
      console.error('Cache getBatch error:', error)
      return []
    }
  }

  /**
   * Store batch translations in cache
   */
  async setBatch(items, results) {
    try {
      const cacheEntries = items.map((item, index) => {
        const result = results[index]
        if (!result || !result.translatedText) return null

        const key = this.generateKey(item.text, item.source, item.target, result.provider)
        const expiresAt = new Date(Date.now() + this.defaultTTL * 1000)

        return {
          cache_key: key,
          source_text: item.text.slice(0, 1000),
          source_language: item.source,
          target_language: item.target,
          translated_text: result.translatedText,
          detected_source_language: result.detectedSourceLanguage,
          provider: result.provider,
          characters_count: item.text.length,
          expires_at: expiresAt.toISOString(),
          last_accessed_at: new Date().toISOString(),
          access_count: 1
        }
      }).filter(Boolean)

      if (cacheEntries.length > 0) {
        const { error } = await supabase
          .from(this.tableName)
          .upsert(cacheEntries, { onConflict: 'cache_key' })

        if (error) {
          console.error('Cache setBatch error:', error)
        }
      }
    } catch (error) {
      console.error('Cache setBatch error:', error)
    }
  }

  /**
   * Update last accessed time
   */
  async updateLastAccessed(key) {
    try {
      await supabase
        .from(this.tableName)
        .update({
          last_accessed_at: new Date().toISOString(),
        })
        .eq('cache_key', key)
        .gte('access_count', 0) // Increment access count
    } catch (error) {
      console.error('Cache updateLastAccessed error:', error)
    }
  }

  /**
   * Clean expired cache entries
   */
  async cleanExpired() {
    try {
      const { error } = await supabase
        .from(this.tableName)
        .delete()
        .lt('expires_at', new Date().toISOString())

      return !error
    } catch (error) {
      console.error('Cache cleanExpired error:', error)
      return false
    }
  }

  /**
   * Get cache statistics
   */
  async getStats() {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('provider, characters_count, access_count, created_at')
        .gt('expires_at', new Date().toISOString())

      if (error || !data) {
        return {
          totalEntries: 0,
          totalCharacters: 0,
          totalAccesses: 0,
          providerStats: {},
          hitRate: 0
        }
      }

      const stats = {
        totalEntries: data.length,
        totalCharacters: data.reduce((sum, row) => sum + (row.characters_count || 0), 0),
        totalAccesses: data.reduce((sum, row) => sum + (row.access_count || 0), 0),
        providerStats: {},
        hitRate: 0
      }

      // Provider breakdown
      data.forEach(row => {
        if (!stats.providerStats[row.provider]) {
          stats.providerStats[row.provider] = {
            entries: 0,
            characters: 0,
            accesses: 0
          }
        }
        stats.providerStats[row.provider].entries++
        stats.providerStats[row.provider].characters += row.characters_count || 0
        stats.providerStats[row.provider].accesses += row.access_count || 0
      })

      return stats
    } catch (error) {
      console.error('Cache getStats error:', error)
      return { totalEntries: 0, totalCharacters: 0, totalAccesses: 0, providerStats: {}, hitRate: 0 }
    }
  }

  /**
   * Clear all cache entries
   */
  async clear() {
    try {
      const { error } = await supabase
        .from(this.tableName)
        .delete()
        .neq('cache_key', '')

      return !error
    } catch (error) {
      console.error('Cache clear error:', error)
      return false
    }
  }

  /**
   * Invalidate cache for specific pattern
   */
  async invalidate(pattern = {}) {
    try {
      let query = supabase.from(this.tableName).delete()

      if (pattern.sourceLang) {
        query = query.eq('source_language', pattern.sourceLang)
      }
      if (pattern.targetLang) {
        query = query.eq('target_language', pattern.targetLang)
      }
      if (pattern.provider) {
        query = query.eq('provider', pattern.provider)
      }
      if (pattern.text) {
        query = query.ilike('source_text', `%${pattern.text}%`)
      }

      const { error } = await query

      return !error
    } catch (error) {
      console.error('Cache invalidate error:', error)
      return false
    }
  }
}
