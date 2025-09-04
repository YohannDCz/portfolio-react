'use server'

import { TranslationService } from '@/lib/translation/service.js'

const translationService = new TranslationService()

export async function GET(request) {
  try {
    await translationService.initialize()

    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '7d'

    const stats = await translationService.analytics.getStats(period)

    return new Response(JSON.stringify(stats), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Analytics API error:', error)
    return new Response(JSON.stringify({
      error: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
