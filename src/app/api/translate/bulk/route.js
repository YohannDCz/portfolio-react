'use server'

import { FieldMappingService } from '@/lib/translation/field-mapper.js'

const fieldMappingService = new FieldMappingService()

// Bulk translate table records
export async function POST(request) {
  try {
    await fieldMappingService.initialize()

    const { tableName, sourceLanguage, options } = await request.json()

    if (!tableName) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Table name is required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const result = await fieldMappingService.bulkTranslateTable(
      tableName,
      sourceLanguage || 'fr',
      options || {}
    )

    return new Response(JSON.stringify(result), {
      status: result.success ? 200 : 500,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Bulk translate error:', error)
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
