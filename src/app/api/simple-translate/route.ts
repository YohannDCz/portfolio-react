import type { TranslationRequest, TranslationResult } from '@/types';
import { NextRequest } from 'next/server';

// =====================================
// TYPE DEFINITIONS
// =====================================

interface LibreTranslateRequest {
  q: string;
  source: string;
  target: string;
  format: 'text';
}

interface LibreTranslateResponse {
  translatedText: string;
}

interface ErrorResponse {
  error: string;
  translatedText: string;
  success: boolean;
}

// =====================================
// API ROUTE HANDLER
// =====================================

/**
 * Handle POST requests for text translation using LibreTranslate
 * @param request - Next.js request object
 * @returns JSON response with translation result
 */
export async function POST(request: NextRequest): Promise<Response> {
  try {
    const body = (await request.json()) as TranslationRequest;
    const { text, source, target } = body;

    // Validate required fields
    if (!text || !target) {
      const errorResponse: ErrorResponse = {
        error: 'Text and target language are required',
        translatedText: '',
        success: false,
      };
      return Response.json(errorResponse, { status: 400 });
    }

    // Use LibreTranslate as simple fallback
    const baseUrl = process.env.LIBRETRANSLATE_URL || 'https://libretranslate.com';

    const requestPayload: LibreTranslateRequest = {
      q: text,
      source: source || 'auto',
      target: target,
      format: 'text',
    };

    const response = await fetch(`${baseUrl}/translate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestPayload),
    });

    if (!response.ok) {
      throw new Error(`Translation failed: ${response.status}`);
    }

    const data = (await response.json()) as LibreTranslateResponse;

    const successResponse: TranslationResult = {
      translatedText: data.translatedText || text,
      success: true,
    };

    return Response.json(successResponse);
  } catch (error) {
    console.error('Translation error:', error);

    const errorResponse: ErrorResponse = {
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      translatedText: '',
      success: false,
    };

    return Response.json(errorResponse, { status: 500 });
  }
}
