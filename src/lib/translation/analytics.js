// Translation Analytics - Track usage, performance, and errors

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

/**
 * Translation Analytics Manager
 * Tracks translation requests, performance metrics, and usage patterns
 */
export class TranslationAnalytics {
  constructor() {
    this.tableName = 'translation_analytics'
    this.metricsTable = 'translation_metrics'
  }

  /**
   * Initialize analytics tables
   */
  async initialize() {
    const { error } = await supabase.rpc('create_translation_analytics_tables')
    if (error && !error.message.includes('already exists')) {
      console.error('Failed to initialize translation analytics:', error)
    }
  }

  /**
   * Log translation request
   */
  async logRequest(requestData) {
    try {
      const logEntry = {
        request_id: requestData.requestId,
        source_language: requestData.sourceLang,
        target_language: requestData.targetLang,
        provider: requestData.provider,
        characters_processed: requestData.charactersProcessed || 0,
        response_time_ms: requestData.responseTime || 0,
        was_cached: requestData.cached || false,
        success: requestData.success || false,
        error_message: requestData.error || null,
        attempt_number: requestData.attempt || 1,
        batch_size: requestData.batchSize || null,
        user_ip: requestData.userIp || null,
        user_agent: requestData.userAgent || null,
        created_at: new Date().toISOString()
      }

      const { error } = await supabase
        .from(this.tableName)
        .insert(logEntry)

      if (error) {
        console.error('Analytics logging error:', error)
      }

      // Update metrics in background
      this.updateMetrics(requestData).catch(console.error)

    } catch (error) {
      console.error('Analytics logRequest error:', error)
    }
  }

  /**
   * Update aggregated metrics
   */
  async updateMetrics(requestData) {
    try {
      const today = new Date().toISOString().split('T')[0]
      const hour = new Date().getHours()

      const metricsKey = {
        date: today,
        hour,
        provider: requestData.provider,
        source_language: requestData.sourceLang,
        target_language: requestData.targetLang
      }

      // Try to update existing metric
      const { data: existing } = await supabase
        .from(this.metricsTable)
        .select('*')
        .match(metricsKey)
        .single()

      if (existing) {
        // Update existing metrics
        const { error } = await supabase
          .from(this.metricsTable)
          .update({
            total_requests: existing.total_requests + 1,
            successful_requests: existing.successful_requests + (requestData.success ? 1 : 0),
            failed_requests: existing.failed_requests + (requestData.success ? 0 : 1),
            cached_requests: existing.cached_requests + (requestData.cached ? 1 : 0),
            total_characters: existing.total_characters + (requestData.charactersProcessed || 0),
            total_response_time_ms: existing.total_response_time_ms + (requestData.responseTime || 0),
            avg_response_time_ms: Math.round((existing.total_response_time_ms + (requestData.responseTime || 0)) / (existing.total_requests + 1)),
            updated_at: new Date().toISOString()
          })
          .match(metricsKey)

        if (error) {
          console.error('Metrics update error:', error)
        }
      } else {
        // Create new metrics entry
        const { error } = await supabase
          .from(this.metricsTable)
          .insert({
            ...metricsKey,
            total_requests: 1,
            successful_requests: requestData.success ? 1 : 0,
            failed_requests: requestData.success ? 0 : 1,
            cached_requests: requestData.cached ? 1 : 0,
            total_characters: requestData.charactersProcessed || 0,
            total_response_time_ms: requestData.responseTime || 0,
            avg_response_time_ms: requestData.responseTime || 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })

        if (error) {
          console.error('Metrics insert error:', error)
        }
      }
    } catch (error) {
      console.error('Analytics updateMetrics error:', error)
    }
  }

  /**
   * Get analytics statistics
   */
  async getStats(period = '7d') {
    try {
      const endDate = new Date()
      const startDate = new Date()

      switch (period) {
        case '1h':
          startDate.setHours(startDate.getHours() - 1)
          break
        case '24h':
          startDate.setHours(startDate.getHours() - 24)
          break
        case '7d':
          startDate.setDate(startDate.getDate() - 7)
          break
        case '30d':
          startDate.setDate(startDate.getDate() - 30)
          break
        default:
          startDate.setDate(startDate.getDate() - 7)
      }

      // Get aggregated metrics
      const { data: metrics, error } = await supabase
        .from(this.metricsTable)
        .select('*')
        .gte('date', startDate.toISOString().split('T')[0])
        .lte('date', endDate.toISOString().split('T')[0])

      if (error) {
        console.error('Analytics getStats error:', error)
        return this.getEmptyStats()
      }

      if (!metrics || metrics.length === 0) {
        return this.getEmptyStats()
      }

      // Aggregate the data
      const stats = {
        totalRequests: metrics.reduce((sum, m) => sum + m.total_requests, 0),
        successfulRequests: metrics.reduce((sum, m) => sum + m.successful_requests, 0),
        failedRequests: metrics.reduce((sum, m) => sum + m.failed_requests, 0),
        cachedRequests: metrics.reduce((sum, m) => sum + m.cached_requests, 0),
        totalCharacters: metrics.reduce((sum, m) => sum + m.total_characters, 0),
        avgResponseTime: 0,
        successRate: 0,
        cacheHitRate: 0,
        providerStats: {},
        languagePairs: {},
        hourlyStats: {},
        errorStats: {}
      }

      // Calculate derived metrics
      if (stats.totalRequests > 0) {
        stats.successRate = (stats.successfulRequests / stats.totalRequests) * 100
        stats.cacheHitRate = (stats.cachedRequests / stats.totalRequests) * 100

        const totalResponseTime = metrics.reduce((sum, m) => sum + m.total_response_time_ms, 0)
        stats.avgResponseTime = Math.round(totalResponseTime / stats.totalRequests)
      }

      // Provider breakdown
      metrics.forEach(metric => {
        if (!stats.providerStats[metric.provider]) {
          stats.providerStats[metric.provider] = {
            requests: 0,
            success: 0,
            failed: 0,
            characters: 0,
            avgResponseTime: 0
          }
        }

        const providerStat = stats.providerStats[metric.provider]
        providerStat.requests += metric.total_requests
        providerStat.success += metric.successful_requests
        providerStat.failed += metric.failed_requests
        providerStat.characters += metric.total_characters

        if (providerStat.requests > 0) {
          providerStat.avgResponseTime = Math.round(
            (providerStat.avgResponseTime * (providerStat.requests - metric.total_requests) +
              metric.total_response_time_ms) / providerStat.requests
          )
        }
      })

      // Language pairs
      metrics.forEach(metric => {
        const pair = `${metric.source_language} → ${metric.target_language}`
        if (!stats.languagePairs[pair]) {
          stats.languagePairs[pair] = 0
        }
        stats.languagePairs[pair] += metric.total_requests
      })

      // Hourly breakdown (last 24 hours)
      const last24h = metrics.filter(m => {
        const metricDate = new Date(`${m.date}T${String(m.hour).padStart(2, '0')}:00:00`)
        return metricDate >= new Date(Date.now() - 24 * 60 * 60 * 1000)
      })

      last24h.forEach(metric => {
        const hour = `${metric.date}T${String(metric.hour).padStart(2, '0')}:00`
        if (!stats.hourlyStats[hour]) {
          stats.hourlyStats[hour] = 0
        }
        stats.hourlyStats[hour] += metric.total_requests
      })

      return stats

    } catch (error) {
      console.error('Analytics getStats error:', error)
      return this.getEmptyStats()
    }
  }

  /**
   * Get error analytics
   */
  async getErrorStats(period = '24h') {
    try {
      const endDate = new Date()
      const startDate = new Date()

      switch (period) {
        case '1h':
          startDate.setHours(startDate.getHours() - 1)
          break
        case '24h':
          startDate.setHours(startDate.getHours() - 24)
          break
        case '7d':
          startDate.setDate(startDate.getDate() - 7)
          break
      }

      const { data: errors, error } = await supabase
        .from(this.tableName)
        .select('provider, error_message, source_language, target_language, created_at')
        .eq('success', false)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .order('created_at', { ascending: false })
        .limit(100)

      if (error) {
        console.error('Error stats query error:', error)
        return { errors: [], errorCounts: {}, providerErrors: {} }
      }

      // Group errors by type
      const errorCounts = {}
      const providerErrors = {}

      errors.forEach(err => {
        // Count by error message
        if (!errorCounts[err.error_message]) {
          errorCounts[err.error_message] = 0
        }
        errorCounts[err.error_message]++

        // Count by provider
        if (!providerErrors[err.provider]) {
          providerErrors[err.provider] = {}
        }
        if (!providerErrors[err.provider][err.error_message]) {
          providerErrors[err.provider][err.error_message] = 0
        }
        providerErrors[err.provider][err.error_message]++
      })

      return {
        errors: errors.slice(0, 20), // Recent errors
        errorCounts,
        providerErrors
      }

    } catch (error) {
      console.error('Analytics getErrorStats error:', error)
      return { errors: [], errorCounts: {}, providerErrors: {} }
    }
  }

  /**
   * Get usage trends
   */
  async getUsageTrends(days = 7) {
    try {
      const endDate = new Date()
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)

      const { data: dailyMetrics, error } = await supabase
        .from(this.metricsTable)
        .select('date, total_requests, successful_requests, cached_requests, total_characters')
        .gte('date', startDate.toISOString().split('T')[0])
        .lte('date', endDate.toISOString().split('T')[0])
        .order('date', { ascending: true })

      if (error) {
        console.error('Usage trends query error:', error)
        return { trends: [], summary: {} }
      }

      // Aggregate by date
      const dailyTotals = {}
      dailyMetrics.forEach(metric => {
        if (!dailyTotals[metric.date]) {
          dailyTotals[metric.date] = {
            date: metric.date,
            requests: 0,
            success: 0,
            cached: 0,
            characters: 0
          }
        }

        dailyTotals[metric.date].requests += metric.total_requests
        dailyTotals[metric.date].success += metric.successful_requests
        dailyTotals[metric.date].cached += metric.cached_requests
        dailyTotals[metric.date].characters += metric.total_characters
      })

      const trends = Object.values(dailyTotals)

      // Calculate summary
      const summary = {
        totalRequests: trends.reduce((sum, day) => sum + day.requests, 0),
        avgDailyRequests: Math.round(trends.reduce((sum, day) => sum + day.requests, 0) / trends.length),
        totalCharacters: trends.reduce((sum, day) => sum + day.characters, 0),
        avgDailyCharacters: Math.round(trends.reduce((sum, day) => sum + day.characters, 0) / trends.length),
        overallCacheHitRate: trends.reduce((sum, day) => sum + day.cached, 0) / trends.reduce((sum, day) => sum + day.requests, 0) * 100
      }

      return { trends, summary }

    } catch (error) {
      console.error('Analytics getUsageTrends error:', error)
      return { trends: [], summary: {} }
    }
  }

  /**
   * Clean old analytics data
   */
  async cleanOldData(retentionDays = 30) {
    try {
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - retentionDays)

      // Clean analytics logs
      const { error: analyticsError } = await supabase
        .from(this.tableName)
        .delete()
        .lt('created_at', cutoffDate.toISOString())

      // Clean metrics older than retention period
      const { error: metricsError } = await supabase
        .from(this.metricsTable)
        .delete()
        .lt('date', cutoffDate.toISOString().split('T')[0])

      return !analyticsError && !metricsError
    } catch (error) {
      console.error('Analytics cleanOldData error:', error)
      return false
    }
  }

  /**
   * Get empty stats structure
   */
  getEmptyStats() {
    return {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      cachedRequests: 0,
      totalCharacters: 0,
      avgResponseTime: 0,
      successRate: 0,
      cacheHitRate: 0,
      providerStats: {},
      languagePairs: {},
      hourlyStats: {},
      errorStats: {}
    }
  }
}
