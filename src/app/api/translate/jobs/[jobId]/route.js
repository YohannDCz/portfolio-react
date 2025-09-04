'use server'

import { TranslationService } from '@/lib/translation/service.js'

const translationService = new TranslationService()

// Get job status
export async function GET(request, { params }) {
  try {
    await translationService.initialize()

    const { jobId } = params
    const status = await translationService.getJobStatus(jobId)

    return new Response(JSON.stringify(status), {
      status: status.status === 'not_found' ? 404 : 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Job status API error:', error)
    return new Response(JSON.stringify({
      error: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

// Cancel job
export async function DELETE(request, { params }) {
  try {
    await translationService.initialize()

    const { jobId } = params
    const success = await translationService.queue.cancelJob(jobId)

    return new Response(JSON.stringify({
      success,
      message: success ? 'Job cancelled successfully' : 'Failed to cancel job'
    }), {
      status: success ? 200 : 404,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Job cancel API error:', error)
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
