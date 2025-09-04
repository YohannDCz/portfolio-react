// Main Translation Service - Orchestrates providers, cache, and analytics

import { TranslationAnalytics } from './analytics.js'
import { TranslationCache } from './cache.js'
import { TranslationProviderFactory } from './providers.js'
import { TranslationQueue } from './queue.js'

/**
 * Main Translation Service
 * Handles translation requests with caching, fallbacks, and analytics
 */
export class TranslationService {
  constructor() {
    this.cache = new TranslationCache()
    this.analytics = new TranslationAnalytics()
    this.queue = new TranslationQueue()
    this.retryAttempts = parseInt(process.env.TRANSLATION_RETRY_ATTEMPTS) || 3
    this.batchSize = parseInt(process.env.TRANSLATION_BATCH_SIZE) || 50
    this.rateLimitPerMinute = parseInt(process.env.TRANSLATION_RATE_LIMIT_PER_MINUTE) || 1000
    this.debugMode = process.env.TRANSLATION_DEBUG_MODE === 'true'

    // Rate limiting state
    this.requestCounts = new Map()
    this.lastCleanup = Date.now()
  }

  /**
   * Initialize the translation service
   */
  async initialize() {
    await Promise.all([
      this.cache.initialize(),
      this.analytics.initialize(),
      this.queue.initialize()
    ])
  }

  /**
   * Translate single text with caching and fallbacks
   */
  async translate(text, sourceLang = 'auto', targetLang, options = {}) {
    const startTime = Date.now()
    const requestId = this.generateRequestId()

    try {
      // Input validation
      if (!text || !targetLang) {
        throw new Error('Text and target language are required')
      }

      if (text.length > 5000) {
        throw new Error('Text too long. Maximum 5000 characters.')
      }

      // Rate limiting check
      if (!this.checkRateLimit()) {
        throw new Error('Rate limit exceeded. Please try again later.')
      }

      // Check cache first
      const cached = await this.cache.get(text, sourceLang, targetLang, options.provider)
      if (cached) {
        await this.analytics.logRequest({
          requestId,
          sourceLang,
          targetLang,
          provider: cached.provider,
          charactersProcessed: text.length,
          responseTime: Date.now() - startTime,
          cached: true,
          success: true
        })

        if (this.debugMode) {
          console.log(`Cache hit for request ${requestId}`)
        }

        return cached
      }

      // Get provider with fallback logic
      const providers = this.getProvidersWithFallback(options.provider)
      let lastError = null

      for (let attempt = 0; attempt < this.retryAttempts; attempt++) {
        for (const provider of providers) {
          try {
            if (this.debugMode) {
              console.log(`Attempting translation with ${provider.name} (attempt ${attempt + 1})`)
            }

            const result = await provider.translate(text, sourceLang, targetLang)

            // Cache successful result
            await this.cache.set(text, sourceLang, targetLang, result, provider.name)

            // Log analytics
            await this.analytics.logRequest({
              requestId,
              sourceLang,
              targetLang,
              provider: provider.name,
              charactersProcessed: text.length,
              responseTime: Date.now() - startTime,
              cached: false,
              success: true,
              attempt: attempt + 1
            })

            return result

          } catch (error) {
            lastError = error

            if (this.debugMode) {
              console.error(`Provider ${provider.name} failed:`, error.message)
            }

            // Log failed attempt
            await this.analytics.logRequest({
              requestId,
              sourceLang,
              targetLang,
              provider: provider.name,
              charactersProcessed: text.length,
              responseTime: Date.now() - startTime,
              cached: false,
              success: false,
              error: error.message,
              attempt: attempt + 1
            })
          }
        }
      }

      // All providers failed
      throw new Error(`All translation providers failed. Last error: ${lastError?.message}`)

    } catch (error) {
      await this.analytics.logRequest({
        requestId,
        sourceLang,
        targetLang,
        provider: 'unknown',
        charactersProcessed: text.length,
        responseTime: Date.now() - startTime,
        cached: false,
        success: false,
        error: error.message
      })

      throw error
    }
  }

  /**
   * Translate multiple texts in batch with optimization
   */
  async translateBatch(items, options = {}) {
    const startTime = Date.now()
    const requestId = this.generateRequestId()

    try {
      // Input validation
      if (!Array.isArray(items) || items.length === 0) {
        throw new Error('Items array is required and cannot be empty')
      }

      // Limit batch size
      if (items.length > this.batchSize) {
        throw new Error(`Batch size too large. Maximum ${this.batchSize} items.`)
      }

      // Rate limiting check
      if (!this.checkRateLimit(items.length)) {
        throw new Error('Rate limit exceeded. Please try again later.')
      }

      // Check cache for all items
      const cachedResults = await this.cache.getBatch(items)
      const uncachedItems = []
      const results = []

      items.forEach((item, index) => {
        if (cachedResults[index]) {
          results[index] = cachedResults[index]
        } else {
          uncachedItems.push({ ...item, originalIndex: index })
        }
      })

      if (this.debugMode) {
        console.log(`Batch translation: ${cachedResults.filter(Boolean).length} cached, ${uncachedItems.length} to translate`)
      }

      // Translate uncached items
      if (uncachedItems.length > 0) {
        const providers = this.getProvidersWithFallback(options.provider)
        let translatedItems = []
        let lastError = null

        for (let attempt = 0; attempt < this.retryAttempts; attempt++) {
          for (const provider of providers) {
            try {
              if (this.debugMode) {
                console.log(`Batch translating ${uncachedItems.length} items with ${provider.name} (attempt ${attempt + 1})`)
              }

              translatedItems = await provider.translateBatch(uncachedItems)

              // Cache successful results
              await this.cache.setBatch(uncachedItems, translatedItems)

              break // Success, exit provider loop
            } catch (error) {
              lastError = error

              if (this.debugMode) {
                console.error(`Batch provider ${provider.name} failed:`, error.message)
              }
            }
          }

          if (translatedItems.length > 0) {
            break // Success, exit retry loop
          }
        }

        if (translatedItems.length === 0) {
          throw new Error(`Batch translation failed: ${lastError?.message}`)
        }

        // Merge translated items back into results
        translatedItems.forEach(item => {
          results[item.originalIndex] = item
        })
      }

      // Log analytics
      await this.analytics.logRequest({
        requestId,
        batchSize: items.length,
        provider: results[0]?.provider || 'unknown',
        charactersProcessed: items.reduce((sum, item) => sum + item.text.length, 0),
        responseTime: Date.now() - startTime,
        cached: cachedResults.filter(Boolean).length,
        success: true
      })

      return results

    } catch (error) {
      await this.analytics.logRequest({
        requestId,
        batchSize: items?.length || 0,
        provider: 'unknown',
        charactersProcessed: items?.reduce((sum, item) => sum + item.text.length, 0) || 0,
        responseTime: Date.now() - startTime,
        cached: 0,
        success: false,
        error: error.message
      })

      throw error
    }
  }

  /**
   * Queue translation job for async processing
   */
  async queueTranslation(jobData) {
    return await this.queue.addJob(jobData)
  }

  /**
   * Get translation job status
   */
  async getJobStatus(jobId) {
    return await this.queue.getJobStatus(jobId)
  }

  /**
   * Get providers with fallback logic
   */
  getProvidersWithFallback(preferredProvider = null) {
    const availableProviders = TranslationProviderFactory.getAvailableProviders()
      .filter(p => p.available)
      .map(p => p.provider)

    if (preferredProvider) {
      const preferred = availableProviders.find(p => p.name === preferredProvider)
      if (preferred) {
        // Put preferred provider first, then others
        return [preferred, ...availableProviders.filter(p => p.name !== preferredProvider)]
      }
    }

    // Default priority: DeepL > Google > LibreTranslate
    const priority = ['deepl', 'google', 'libretranslate']
    const sorted = []

    priority.forEach(name => {
      const provider = availableProviders.find(p => p.name === name)
      if (provider) sorted.push(provider)
    })

    // Add any remaining providers
    availableProviders.forEach(provider => {
      if (!sorted.includes(provider)) {
        sorted.push(provider)
      }
    })

    return sorted
  }

  /**
   * Rate limiting check
   */
  checkRateLimit(requestCount = 1) {
    const now = Date.now()
    const minute = Math.floor(now / 60000)

    // Cleanup old entries every 5 minutes
    if (now - this.lastCleanup > 300000) {
      const currentMinute = Math.floor(now / 60000)
      for (const [key] of this.requestCounts) {
        if (key < currentMinute - 1) {
          this.requestCounts.delete(key)
        }
      }
      this.lastCleanup = now
    }

    const currentCount = this.requestCounts.get(minute) || 0
    const newCount = currentCount + requestCount

    if (newCount > this.rateLimitPerMinute) {
      return false
    }

    this.requestCounts.set(minute, newCount)
    return true
  }

  /**
   * Generate unique request ID
   */
  generateRequestId() {
    return `tr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Get service statistics
   */
  async getStats() {
    const [cacheStats, analyticsStats] = await Promise.all([
      this.cache.getStats(),
      this.analytics.getStats()
    ])

    return {
      cache: cacheStats,
      analytics: analyticsStats,
      providers: TranslationProviderFactory.getAvailableProviders().map(p => ({
        name: p.name,
        available: p.available
      })),
      rateLimit: {
        currentMinute: Math.floor(Date.now() / 60000),
        requestCounts: Object.fromEntries(this.requestCounts)
      }
    }
  }

  /**
   * Health check
   */
  async healthCheck() {
    const providers = TranslationProviderFactory.getAvailableProviders()
    const healthStatus = {
      status: 'healthy',
      providers: {},
      cache: false,
      analytics: false
    }

    // Test each provider
    for (const { name, provider } of providers) {
      try {
        if (provider.isAvailable()) {
          // Test with simple translation
          await provider.translate('Hello', 'en', 'fr')
          healthStatus.providers[name] = 'healthy'
        } else {
          healthStatus.providers[name] = 'unavailable'
        }
      } catch (error) {
        healthStatus.providers[name] = 'error'
        healthStatus.status = 'degraded'
      }
    }

    // Test cache
    try {
      await this.cache.getStats()
      healthStatus.cache = true
    } catch (error) {
      healthStatus.cache = false
      healthStatus.status = 'degraded'
    }

    // Test analytics
    try {
      await this.analytics.getStats()
      healthStatus.analytics = true
    } catch (error) {
      healthStatus.analytics = false
      healthStatus.status = 'degraded'
    }

    return healthStatus
  }
}
