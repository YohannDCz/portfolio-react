// Translation Queue - Async job processing for bulk translations

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

/**
 * Translation Queue Manager
 * Handles async translation jobs for bulk processing
 */
export class TranslationQueue {
  constructor() {
    this.tableName = 'translation_jobs'
    this.maxRetries = 3
    this.processingTimeout = 300000 // 5 minutes
  }

  /**
   * Initialize queue table
   */
  async initialize() {
    const { error } = await supabase.rpc('create_translation_queue_table')
    if (error && !error.message.includes('already exists')) {
      console.error('Failed to initialize translation queue:', error)
    }
  }

  /**
   * Add translation job to queue
   */
  async addJob(jobData) {
    try {
      const jobId = this.generateJobId()

      const job = {
        job_id: jobId,
        job_type: jobData.type || 'bulk_translate',
        status: 'pending',
        priority: jobData.priority || 1,
        source_language: jobData.sourceLang,
        target_language: jobData.targetLang,
        preferred_provider: jobData.provider || null,
        input_data: jobData.data, // JSON data
        metadata: jobData.metadata || {},
        retry_count: 0,
        created_at: new Date().toISOString(),
        scheduled_at: jobData.scheduleAt ? new Date(jobData.scheduleAt).toISOString() : new Date().toISOString()
      }

      const { data, error } = await supabase
        .from(this.tableName)
        .insert(job)
        .select()
        .single()

      if (error) {
        throw new Error(`Failed to add job to queue: ${error.message}`)
      }

      return {
        jobId,
        status: 'queued',
        estimatedProcessingTime: this.estimateProcessingTime(jobData)
      }

    } catch (error) {
      console.error('Queue addJob error:', error)
      throw error
    }
  }

  /**
   * Get next job from queue
   */
  async getNextJob() {
    try {
      // Get highest priority pending job
      const { data: job, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('status', 'pending')
        .lte('scheduled_at', new Date().toISOString())
        .order('priority', { ascending: false })
        .order('created_at', { ascending: true })
        .limit(1)
        .single()

      if (error || !job) {
        return null
      }

      // Mark as processing
      const { error: updateError } = await supabase
        .from(this.tableName)
        .update({
          status: 'processing',
          started_at: new Date().toISOString(),
          processing_node: this.getProcessingNodeId()
        })
        .eq('job_id', job.job_id)

      if (updateError) {
        console.error('Failed to update job status:', updateError)
        return null
      }

      return job

    } catch (error) {
      console.error('Queue getNextJob error:', error)
      return null
    }
  }

  /**
   * Update job progress
   */
  async updateJobProgress(jobId, progress, metadata = {}) {
    try {
      const { error } = await supabase
        .from(this.tableName)
        .update({
          progress: Math.min(100, Math.max(0, progress)),
          metadata: metadata,
          updated_at: new Date().toISOString()
        })
        .eq('job_id', jobId)

      return !error
    } catch (error) {
      console.error('Queue updateJobProgress error:', error)
      return false
    }
  }

  /**
   * Complete job with results
   */
  async completeJob(jobId, results, metadata = {}) {
    try {
      const { error } = await supabase
        .from(this.tableName)
        .update({
          status: 'completed',
          progress: 100,
          output_data: results,
          metadata: { ...metadata, completedAt: new Date().toISOString() },
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('job_id', jobId)

      return !error
    } catch (error) {
      console.error('Queue completeJob error:', error)
      return false
    }
  }

  /**
   * Fail job with error
   */
  async failJob(jobId, error, retry = true) {
    try {
      const { data: job } = await supabase
        .from(this.tableName)
        .select('retry_count')
        .eq('job_id', jobId)
        .single()

      const retryCount = (job?.retry_count || 0) + 1
      const shouldRetry = retry && retryCount <= this.maxRetries

      const updateData = {
        status: shouldRetry ? 'pending' : 'failed',
        retry_count: retryCount,
        error_message: error.message || error,
        metadata: {
          error: error.message || error,
          failedAt: new Date().toISOString(),
          willRetry: shouldRetry
        },
        updated_at: new Date().toISOString()
      }

      if (shouldRetry) {
        // Schedule retry with exponential backoff
        const retryDelay = Math.pow(2, retryCount) * 60000 // 2^n minutes
        updateData.scheduled_at = new Date(Date.now() + retryDelay).toISOString()
      } else {
        updateData.failed_at = new Date().toISOString()
      }

      const { error: updateError } = await supabase
        .from(this.tableName)
        .update(updateData)
        .eq('job_id', jobId)

      return !updateError
    } catch (error) {
      console.error('Queue failJob error:', error)
      return false
    }
  }

  /**
   * Get job status
   */
  async getJobStatus(jobId) {
    try {
      const { data: job, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('job_id', jobId)
        .single()

      if (error || !job) {
        return { status: 'not_found' }
      }

      const status = {
        jobId: job.job_id,
        status: job.status,
        progress: job.progress || 0,
        createdAt: job.created_at,
        startedAt: job.started_at,
        completedAt: job.completed_at,
        failedAt: job.failed_at,
        retryCount: job.retry_count,
        errorMessage: job.error_message,
        metadata: job.metadata || {},
        estimatedCompletion: null
      }

      // Calculate estimated completion time
      if (job.status === 'processing' && job.started_at) {
        const elapsed = Date.now() - new Date(job.started_at).getTime()
        const progress = Math.max(1, job.progress || 1)
        const totalEstimated = (elapsed / progress) * 100
        const remaining = totalEstimated - elapsed
        status.estimatedCompletion = new Date(Date.now() + remaining).toISOString()
      }

      // Add results if completed
      if (job.status === 'completed' && job.output_data) {
        status.results = job.output_data
      }

      return status

    } catch (error) {
      console.error('Queue getJobStatus error:', error)
      return { status: 'error', error: error.message }
    }
  }

  /**
   * Cancel job
   */
  async cancelJob(jobId) {
    try {
      const { error } = await supabase
        .from(this.tableName)
        .update({
          status: 'cancelled',
          cancelled_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('job_id', jobId)
        .in('status', ['pending', 'processing'])

      return !error
    } catch (error) {
      console.error('Queue cancelJob error:', error)
      return false
    }
  }

  /**
   * Get queue statistics
   */
  async getQueueStats() {
    try {
      const { data: stats, error } = await supabase
        .from(this.tableName)
        .select('status, job_type, priority, created_at')

      if (error || !stats) {
        return this.getEmptyQueueStats()
      }

      const queueStats = {
        totalJobs: stats.length,
        pending: stats.filter(j => j.status === 'pending').length,
        processing: stats.filter(j => j.status === 'processing').length,
        completed: stats.filter(j => j.status === 'completed').length,
        failed: stats.filter(j => j.status === 'failed').length,
        cancelled: stats.filter(j => j.status === 'cancelled').length,
        byType: {},
        byPriority: {},
        avgProcessingTime: 0
      }

      // Group by job type
      stats.forEach(job => {
        if (!queueStats.byType[job.job_type]) {
          queueStats.byType[job.job_type] = 0
        }
        queueStats.byType[job.job_type]++
      })

      // Group by priority
      stats.forEach(job => {
        if (!queueStats.byPriority[job.priority]) {
          queueStats.byPriority[job.priority] = 0
        }
        queueStats.byPriority[job.priority]++
      })

      return queueStats

    } catch (error) {
      console.error('Queue getQueueStats error:', error)
      return this.getEmptyQueueStats()
    }
  }

  /**
   * Clean old completed jobs
   */
  async cleanOldJobs(retentionDays = 7) {
    try {
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - retentionDays)

      const { error } = await supabase
        .from(this.tableName)
        .delete()
        .in('status', ['completed', 'failed', 'cancelled'])
        .lt('completed_at', cutoffDate.toISOString())

      return !error
    } catch (error) {
      console.error('Queue cleanOldJobs error:', error)
      return false
    }
  }

  /**
   * Reset stuck jobs (processing for too long)
   */
  async resetStuckJobs() {
    try {
      const stuckCutoff = new Date(Date.now() - this.processingTimeout)

      const { error } = await supabase
        .from(this.tableName)
        .update({
          status: 'pending',
          started_at: null,
          processing_node: null,
          error_message: 'Job was stuck in processing state and was reset',
          updated_at: new Date().toISOString()
        })
        .eq('status', 'processing')
        .lt('started_at', stuckCutoff.toISOString())

      return !error
    } catch (error) {
      console.error('Queue resetStuckJobs error:', error)
      return false
    }
  }

  /**
   * Estimate processing time based on job data
   */
  estimateProcessingTime(jobData) {
    const baseTime = 5000 // 5 seconds base
    const perItemTime = 1000 // 1 second per item
    const perCharacterTime = 10 // 10ms per character

    let itemCount = 0
    let totalCharacters = 0

    if (Array.isArray(jobData.data)) {
      itemCount = jobData.data.length
      totalCharacters = jobData.data.reduce((sum, item) => {
        return sum + (typeof item === 'string' ? item.length : JSON.stringify(item).length)
      }, 0)
    } else {
      itemCount = 1
      totalCharacters = typeof jobData.data === 'string' ? jobData.data.length : JSON.stringify(jobData.data).length
    }

    return baseTime + (itemCount * perItemTime) + (totalCharacters * perCharacterTime)
  }

  /**
   * Generate unique job ID
   */
  generateJobId() {
    return `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Get processing node identifier
   */
  getProcessingNodeId() {
    return `node_${process.pid}_${Date.now()}`
  }

  /**
   * Get empty queue stats
   */
  getEmptyQueueStats() {
    return {
      totalJobs: 0,
      pending: 0,
      processing: 0,
      completed: 0,
      failed: 0,
      cancelled: 0,
      byType: {},
      byPriority: {},
      avgProcessingTime: 0
    }
  }
}
