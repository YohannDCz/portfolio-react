// Translation Providers - Multiple providers with fallback support

/**
 * DeepL Translation Provider
 */
export class DeepLProvider {
  constructor() {
    this.name = 'deepl'
    this.baseUrl = process.env.DEEPL_PRO === 'true'
      ? 'https://api.deepl.com/v2'
      : 'https://api-free.deepl.com/v2'
    this.apiKey = process.env.DEEPL_API_KEY
    this.rateLimit = 500000 // characters per month for free
  }

  isAvailable() {
    return !!this.apiKey
  }

  async translate(text, sourceLang, targetLang) {
    if (!this.isAvailable()) {
      throw new Error('DeepL API key not configured')
    }

    const response = await fetch(`${this.baseUrl}/translate`, {
      method: 'POST',
      headers: {
        'Authorization': `DeepL-Auth-Key ${this.apiKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        text,
        source_lang: this.mapLanguageCode(sourceLang, 'source'),
        target_lang: this.mapLanguageCode(targetLang, 'target'),
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`DeepL API error: ${response.status} - ${error}`)
    }

    const data = await response.json()
    return {
      translatedText: data.translations[0]?.text || text,
      detectedSourceLanguage: data.translations[0]?.detected_source_language,
      provider: this.name,
      charactersUsed: text.length
    }
  }

  async translateBatch(items) {
    const texts = items.map(item => item.text).join('\n')
    const result = await this.translate(texts, items[0].source, items[0].target)
    const translations = result.translatedText.split('\n')

    return items.map((item, index) => ({
      ...item,
      translatedText: translations[index] || item.text,
      provider: this.name
    }))
  }

  mapLanguageCode(lang, type) {
    const mapping = {
      'auto': 'auto',
      'en': type === 'target' ? 'EN-US' : 'EN',
      'fr': 'FR',
      'hi': 'HI',
      'ar': 'AR',
      'es': 'ES',
      'de': 'DE',
      'it': 'IT',
      'pt': type === 'target' ? 'PT-PT' : 'PT',
      'ru': 'RU',
      'ja': 'JA',
      'ko': 'KO',
      'zh': type === 'target' ? 'ZH-HANS' : 'ZH'
    }
    return mapping[lang] || lang.toUpperCase()
  }

  async getUsage() {
    if (!this.isAvailable()) return null

    const response = await fetch(`${this.baseUrl}/usage`, {
      headers: {
        'Authorization': `DeepL-Auth-Key ${this.apiKey}`,
      },
    })

    if (response.ok) {
      return await response.json()
    }
    return null
  }
}

/**
 * Google Cloud Translate Provider
 */
export class GoogleTranslateProvider {
  constructor() {
    this.name = 'google'
    this.baseUrl = 'https://translation.googleapis.com/language/translate/v2'
    this.apiKey = process.env.GOOGLE_TRANSLATE_API_KEY
    this.projectId = process.env.GOOGLE_PROJECT_ID
    this.rateLimit = 1000000 // characters per month
  }

  isAvailable() {
    return !!this.apiKey
  }

  async translate(text, sourceLang, targetLang) {
    if (!this.isAvailable()) {
      throw new Error('Google Translate API key not configured')
    }

    const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: text,
        source: sourceLang === 'auto' ? undefined : sourceLang,
        target: targetLang,
        format: 'text'
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Google Translate API error: ${response.status} - ${error}`)
    }

    const data = await response.json()
    const translation = data.data.translations[0]

    return {
      translatedText: translation.translatedText || text,
      detectedSourceLanguage: translation.detectedSourceLanguage,
      provider: this.name,
      charactersUsed: text.length
    }
  }

  async translateBatch(items) {
    const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: items.map(item => item.text),
        source: items[0].source === 'auto' ? undefined : items[0].source,
        target: items[0].target,
        format: 'text'
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Google Translate batch API error: ${response.status} - ${error}`)
    }

    const data = await response.json()
    const translations = data.data.translations

    return items.map((item, index) => ({
      ...item,
      translatedText: translations[index]?.translatedText || item.text,
      provider: this.name
    }))
  }
}

/**
 * LibreTranslate Provider (existing, enhanced)
 */
export class LibreTranslateProvider {
  constructor() {
    this.name = 'libretranslate'
    this.baseUrl = process.env.LIBRETRANSLATE_URL || 'https://libretranslate.com'
    this.apiKey = process.env.LIBRETRANSLATE_API_KEY
    this.rateLimit = 100000 // requests per day for free
  }

  isAvailable() {
    return true // LibreTranslate is always available (public instance)
  }

  async translate(text, sourceLang, targetLang) {
    const payload = {
      q: text,
      source: sourceLang,
      target: targetLang,
      format: 'text'
    }

    if (this.apiKey) {
      payload.api_key = this.apiKey
    }

    const response = await fetch(`${this.baseUrl}/translate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`LibreTranslate API error: ${response.status} - ${error}`)
    }

    const data = await response.json()
    return {
      translatedText: data.translatedText || text,
      detectedSourceLanguage: null,
      provider: this.name,
      charactersUsed: text.length
    }
  }

  async translateBatch(items) {
    const results = await Promise.all(
      items.map(async (item) => {
        try {
          const result = await this.translate(item.text, item.source, item.target)
          return { ...item, ...result }
        } catch (error) {
          return { ...item, translatedText: item.text, error: error.message, provider: this.name }
        }
      })
    )
    return results
  }

  async getSupportedLanguages() {
    try {
      const response = await fetch(`${this.baseUrl}/languages`)
      if (response.ok) {
        return await response.json()
      }
    } catch (error) {
      console.error('Failed to fetch LibreTranslate languages:', error)
    }
    return []
  }
}

/**
 * Translation Provider Factory
 */
export class TranslationProviderFactory {
  static providers = {
    deepl: DeepLProvider,
    google: GoogleTranslateProvider,
    libretranslate: LibreTranslateProvider
  }

  static createProvider(providerName) {
    const ProviderClass = this.providers[providerName]
    if (!ProviderClass) {
      throw new Error(`Unknown translation provider: ${providerName}`)
    }
    return new ProviderClass()
  }

  static getAvailableProviders() {
    return Object.keys(this.providers).map(name => {
      const provider = this.createProvider(name)
      return {
        name,
        available: provider.isAvailable(),
        provider
      }
    })
  }

  static getPreferredProvider() {
    const providers = this.getAvailableProviders()

    // Priority: DeepL > Google > LibreTranslate
    const priority = ['deepl', 'google', 'libretranslate']

    for (const providerName of priority) {
      const provider = providers.find(p => p.name === providerName && p.available)
      if (provider) {
        return provider.provider
      }
    }

    // Fallback to LibreTranslate (always available)
    return new LibreTranslateProvider()
  }
}
