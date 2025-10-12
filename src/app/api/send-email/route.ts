import type { ContactMessage, Language } from '@/types';
import type { Database } from '@/types/supabase';
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

// =====================================
// TYPE DEFINITIONS
// =====================================

interface EmailTemplateTranslations {
  subject: string;
  greeting: string;
  from: string;
  email: string;
  subject_label: string;
  message: string;
  sent_from: string;
  portfolio: string;
}

interface ContactMessageWithLanguage extends ContactMessage {
  language?: Language;
  status?: string;
}

// =====================================
// CONFIGURATION
// =====================================

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Service role key for API
const supabase =
  supabaseUrl && supabaseKey ? createClient<Database>(supabaseUrl, supabaseKey) : null;

// =====================================
// EMAIL TEMPLATE FUNCTION
// =====================================

/**
 * Generate HTML email template with localization support
 * @param messageData - Contact message data
 * @param language - Email language
 * @returns HTML email template string
 */
const getEmailTemplate = (messageData: ContactMessage, language: Language = 'fr'): string => {
  const translations: Record<Language, EmailTemplateTranslations> = {
    fr: {
      subject: 'Nouveau message de contact depuis le portfolio',
      greeting: 'Nouveau message reçu',
      from: 'De',
      email: 'Email',
      subject_label: 'Sujet',
      message: 'Message',
      sent_from: 'Envoyé depuis',
      portfolio: 'le portfolio de Yohann Di Crescenzo',
    },
    en: {
      subject: 'New contact message from portfolio',
      greeting: 'New message received',
      from: 'From',
      email: 'Email',
      subject_label: 'Subject',
      message: 'Message',
      sent_from: 'Sent from',
      portfolio: "Yohann Di Crescenzo's portfolio",
    },
    hi: {
      subject: 'पोर्टफोलियो से नया संपर्क संदेश',
      greeting: 'नया संदेश प्राप्त हुआ',
      from: 'से',
      email: 'ईमेल',
      subject_label: 'विषय',
      message: 'संदेश',
      sent_from: 'से भेजा गया',
      portfolio: 'योहान डी क्रेसेंजो का पोर्टफोलियो',
    },
    ar: {
      subject: 'رسالة اتصال جديدة من المحفظة',
      greeting: 'تم استلام رسالة جديدة',
      from: 'من',
      email: 'البريد الإلكتروني',
      subject_label: 'الموضوع',
      message: 'الرسالة',
      sent_from: 'تم الإرسال من',
      portfolio: 'محفظة يوهان دي كريسينزو',
    },
    zh: {
      subject: '来自作品集的新联系消息',
      greeting: '收到新消息',
      from: '来自',
      email: '邮箱',
      subject_label: '主题',
      message: '消息',
      sent_from: '发送自',
      portfolio: 'Yohann Di Crescenzo 的作品集',
    },
  };

  const t = translations[language] || translations.fr;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${t.subject}</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 12px 12px 0 0; text-align: center; }
        .content { background: #ffffff; padding: 30px; border: 1px solid #e1e5e9; border-top: none; border-radius: 0 0 12px 12px; }
        .field { margin-bottom: 20px; }
        .label { font-weight: 600; color: #374151; margin-bottom: 8px; display: block; }
        .value { background: #f9fafb; padding: 12px; border-radius: 8px; border: 1px solid #e5e7eb; }
        .message-content { white-space: pre-wrap; }
        .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e1e5e9; color: #6b7280; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0; font-size: 24px;">${t.greeting}</h1>
        </div>
        <div class="content">
          <div class="field">
            <span class="label">${t.from}:</span>
            <div class="value">${messageData.name}</div>
          </div>
          
          <div class="field">
            <span class="label">${t.email}:</span>
            <div class="value">${messageData.email}</div>
          </div>
          
          ${
            messageData.subject
              ? `
            <div class="field">
              <span class="label">${t.subject_label}:</span>
              <div class="value">${messageData.subject}</div>
            </div>
          `
              : ''
          }
          
          <div class="field">
            <span class="label">${t.message}:</span>
            <div class="value message-content">${messageData.message}</div>
          </div>
        </div>
        
        <div class="footer">
          <p>${t.sent_from} ${t.portfolio}</p>
          <p>📧 Répondez directement à cet email pour contacter ${messageData.name}</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// =====================================
// API ROUTE HANDLER
// =====================================

/**
 * Handle POST requests for sending contact messages
 * @param request - Next.js request object
 * @returns JSON response with success status
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Verify Supabase is configured
    if (!supabase) {
      return NextResponse.json(
        { success: false, error: 'Configuration Supabase manquante' },
        { status: 500 },
      );
    }

    const messageData: ContactMessageWithLanguage = await request.json();

    // Validate required fields
    if (!messageData.name || !messageData.email || !messageData.message) {
      return NextResponse.json(
        { success: false, error: 'Champs requis manquants' },
        { status: 400 },
      );
    }

    // Save message to Supabase
    const { data: savedMessage, error: supabaseError } = await supabase
      .from('contact_messages')
      .insert([
        {
          name: messageData.name,
          email: messageData.email,
          subject: messageData.subject || null,
          message: messageData.message,
        },
      ])
      .select()
      .single();

    if (supabaseError) {
      // eslint-disable-next-line no-console
      console.error('Erreur Supabase:', supabaseError);
      return NextResponse.json(
        { success: false, error: 'Erreur lors de la sauvegarde' },
        { status: 500 },
      );
    }

    // Send email via Resend (if configured)
    if (resend && process.env.RESEND_API_KEY) {
      try {
        const emailSubject = messageData.subject
          ? `Portfolio Contact: ${messageData.subject}`
          : `Nouveau message de ${messageData.name}`;

        const { data: emailData, error: emailError } = await resend.emails.send({
          from: process.env.FROM_EMAIL || 'portfolio@resend.dev',
          to: process.env.TO_EMAIL || 'YohannDCz@gmail.com',
          replyTo: messageData.email,
          subject: emailSubject,
          html: getEmailTemplate(messageData, messageData.language || 'fr'),
        });

        if (emailError) {
          // eslint-disable-next-line no-console
          console.error('Erreur Resend:', emailError);
          // Don't fail the request if email doesn't send
          // Message is still saved in database
        }
      } catch (emailError) {
        // eslint-disable-next-line no-console
        console.error("Erreur lors de l'envoi d'email:", emailError);
        // Email is optional, continue even on error
      }
    }

    return NextResponse.json({
      success: true,
      data: savedMessage,
      message: 'Message envoyé avec succès',
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Erreur API:', error);
    return NextResponse.json({ success: false, error: 'Erreur serveur interne' }, { status: 500 });
  }
}
