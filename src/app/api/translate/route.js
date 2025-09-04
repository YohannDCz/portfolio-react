'use server'

import { TranslationService } from '@/lib/translation/service.js'

// Initialize translation service
const translationService = new TranslationService()

export async function POST(request) {
  try {
    // Initialize service on first use
    await translationService.initialize()

    const body = await request.json()

    // Get client information for analytics
    const userIp = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip')
    const userAgent = request.headers.get('user-agent')

    // Handle batch translation
    if (Array.isArray(body.items)) {
      const items = body.items.map(item => ({
        text: item.text || '',
        source: item.source || 'auto',
        target: item.target,
        provider: body.provider || null
      }))

      const results = await translationService.translateBatch(items, {
        provider: body.provider,
        userIp,
        userAgent
      })

      return new Response(JSON.stringify({
        translations: results,
        cached: results.filter(r => r.cached).length,
        provider: results[0]?.provider || 'unknown'
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Handle single translation
    const { text = '', source = 'auto', target, provider } = body || {}

    if (!text || !target) {
      return new Response(JSON.stringify({
        error: 'Text and target language are required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const result = await translationService.translate(text, source, target, {
      provider,
      userIp,
      userAgent
    })

    return new Response(JSON.stringify({
      translatedText: result.translatedText,
      detectedSourceLanguage: result.detectedSourceLanguage,
      provider: result.provider,
      cached: result.cached || false
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Translation API error:', error)

    return new Response(JSON.stringify({
      error: error.message,
      details: process.env.TRANSLATION_DEBUG_MODE === 'true' ? error.stack : undefined
    }), {
      status: error.message.includes('Rate limit') ? 429 :
        error.message.includes('Text too long') ? 413 : 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

// Health check endpoint
export async function GET() {
  try {
    await translationService.initialize()
    const health = await translationService.healthCheck()

    return new Response(JSON.stringify({
      status: health.status,
      timestamp: new Date().toISOString(),
      providers: health.providers,
      cache: health.cache,
      analytics: health.analytics
    }), {
      status: health.status === 'healthy' ? 200 : 503,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    return new Response(JSON.stringify({
      status: 'error',
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}


