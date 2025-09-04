'use server'

import { TranslationService } from '@/lib/translation/service.js'

const translationService = new TranslationService()

export async function GET() {
  try {
    await translationService.initialize()

    const cacheStats = await translationService.cache.getStats()

    return new Response(JSON.stringify(cacheStats), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Cache stats API error:', error)
    return new Response(JSON.stringify({
      error: error.message,
      totalEntries: 0,
      totalCharacters: 0,
      totalAccesses: 0,
      providerStats: {},
      hitRate: 0
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
