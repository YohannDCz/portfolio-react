'use server'

export async function POST(request) {
  try {
    const body = await request.json()

    const baseUrl = process.env.LIBRETRANSLATE_URL || 'https://libretranslate.com'

    if (Array.isArray(body.items)) {
      const results = await Promise.all(
        body.items.map(async (item) => {
          const payload = {
            q: item.text || '',
            source: item.source || 'auto',
            target: item.target,
            format: 'text'
          }
          try {
            const res = await fetch(`${baseUrl}/translate`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload)
            })
            if (!res.ok) throw new Error(`HTTP ${res.status}`)
            const data = await res.json()
            return { ...item, translatedText: data?.translatedText || '' }
          } catch (e) {
            // Fallback: return original text to avoid blocking the UI
            return { ...item, translatedText: item.text || '' }
          }
        })
      )
      return new Response(JSON.stringify({ translations: results }), { status: 200, headers: { 'Content-Type': 'application/json' } })
    }

    // Single translation
    const { text = '', source = 'auto', target } = body || {}
    const res = await fetch(`${baseUrl}/translate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ q: text, source, target, format: 'text' })
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    return new Response(JSON.stringify({ translatedText: data?.translatedText || '' }), { status: 200, headers: { 'Content-Type': 'application/json' } })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } })
  }
}


