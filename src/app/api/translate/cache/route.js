'use server'

import { TranslationService } from '@/lib/translation/service.js'

const translationService = new TranslationService()

export async function DELETE(request) {
  try {
    await translationService.initialize()

    const { searchParams } = new URL(request.url)
    const pattern = {}

    // Support selective cache invalidation
    if (searchParams.get('provider')) pattern.provider = searchParams.get('provider')
    if (searchParams.get('sourceLang')) pattern.sourceLang = searchParams.get('sourceLang')
    if (searchParams.get('targetLang')) pattern.targetLang = searchParams.get('targetLang')
    if (searchParams.get('text')) pattern.text = searchParams.get('text')

    let success
    if (Object.keys(pattern).length > 0) {
      success = await translationService.cache.invalidate(pattern)
    } else {
      success = await translationService.cache.clear()
    }

    return new Response(JSON.stringify({
      success,
      message: success ? 'Cache cleared successfully' : 'Failed to clear cache'
    }), {
      status: success ? 200 : 500,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Cache clear API error:', error)
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
