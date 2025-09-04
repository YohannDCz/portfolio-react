export async function POST(request) {
  try {
    const { text, source, target } = await request.json()

    if (!text || !target) {
      return Response.json({ error: 'Text and target language are required' }, { status: 400 })
    }

    // Use LibreTranslate as simple fallback
    const baseUrl = process.env.LIBRETRANSLATE_URL || 'https://libretranslate.com'

    const response = await fetch(`${baseUrl}/translate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        q: text,
        source: source || 'auto',
        target: target,
        format: 'text'
      })
    })

    if (!response.ok) {
      throw new Error(`Translation failed: ${response.status}`)
    }

    const data = await response.json()

    return Response.json({
      translatedText: data.translatedText || text,
      success: true
    })

  } catch (error) {
    console.error('Translation error:', error)
    return Response.json({
      error: error.message,
      translatedText: '',
      success: false
    }, { status: 500 })
  }
}
