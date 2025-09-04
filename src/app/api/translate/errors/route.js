'use server'

import { TranslationService } from '@/lib/translation/service.js'

const translationService = new TranslationService()

export async function GET(request) {
  try {
    await translationService.initialize()

    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '24h'

    const errorStats = await translationService.analytics.getErrorStats(period)

    return new Response(JSON.stringify(errorStats), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Error stats API error:', error)
    return new Response(JSON.stringify({
      error: error.message,
      errors: [],
      errorCounts: {},
      providerErrors: {}
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
