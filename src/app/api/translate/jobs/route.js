'use server'

import { TranslationService } from '@/lib/translation/service.js'

const translationService = new TranslationService()

// Create new translation job
export async function POST(request) {
  try {
    await translationService.initialize()

    const jobData = await request.json()

    // Validate required fields
    if (!jobData.data || !jobData.targetLang) {
      return new Response(JSON.stringify({
        error: 'Job data and target language are required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const result = await translationService.queueTranslation(jobData)

    return new Response(JSON.stringify(result), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Job creation API error:', error)
    return new Response(JSON.stringify({
      error: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

// Get job queue statistics
export async function GET() {
  try {
    await translationService.initialize()

    const queueStats = await translationService.queue.getQueueStats()

    return new Response(JSON.stringify(queueStats), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Queue stats API error:', error)
    return new Response(JSON.stringify({
      error: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
