'use server'

import { FieldMappingService } from '@/lib/translation/field-mapper.js'

const fieldMappingService = new FieldMappingService()

// Get all field mappings
export async function GET() {
  try {
    await fieldMappingService.initialize()
    const result = await fieldMappingService.getAllMappings()

    return new Response(JSON.stringify(result), {
      status: result.success ? 200 : 500,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Field mappings GET error:', error)
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      mappings: {}
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

// Create or update field mapping
export async function POST(request) {
  try {
    await fieldMappingService.initialize()

    const { tableName, fieldName, config } = await request.json()

    if (!tableName || !fieldName) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Table name and field name are required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const result = await fieldMappingService.setFieldMapping(tableName, fieldName, config)

    return new Response(JSON.stringify(result), {
      status: result.success ? 200 : 500,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Field mappings POST error:', error)
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

// Delete field mapping
export async function DELETE(request) {
  try {
    await fieldMappingService.initialize()

    const { searchParams } = new URL(request.url)
    const tableName = searchParams.get('table')
    const fieldName = searchParams.get('field')

    if (!tableName || !fieldName) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Table name and field name are required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const result = await fieldMappingService.removeFieldMapping(tableName, fieldName)

    return new Response(JSON.stringify(result), {
      status: result.success ? 200 : 500,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Field mappings DELETE error:', error)
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
