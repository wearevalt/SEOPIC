import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { analyzeSchema } from '@/lib/schemas';
import { rateLimit, getClientIp } from '@/lib/rate-limit';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  // Rate limit: 10 analyses per minute per IP
  const ip = getClientIp(req);
  const { success, remaining } = rateLimit(`analyze:${ip}`, { limit: 10, windowMs: 60_000 });
  if (!success) {
    return NextResponse.json(
      { error: 'Trop de requêtes. Réessayez dans une minute.' },
      { status: 429, headers: { 'Retry-After': '60' } }
    );
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'API not configured' }, { status: 500 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Corps de requête invalide' }, { status: 400 });
  }

  const parsed = analyzeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  const { imageBase64, mimeType, imageName, imageSize } = parsed.data;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1000,
        messages: [{
          role: 'user',
          content: [
            {
              type: 'image',
              source: { type: 'base64', media_type: mimeType, data: imageBase64 },
            },
            {
              type: 'text',
              text: 'Analyze this image for SEO optimization. Return ONLY a valid JSON object with no markdown, no explanation, just the JSON. Fields: detectedContent (string), suggestedAltText (string max 125 chars), metaTitle (string max 60 chars), metaDescription (string max 160 chars), keywords (array of 5-8 strings), seoScore (number 0-100), improvements (array of 3 strings), imageCategory (string), tone (string)',
            },
          ],
        }],
      }),
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Analysis service unavailable' }, { status: 502 });
    }

    const data = await response.json();
    const text = data.content[0].text;
    const analysis = JSON.parse(text.replace(/```json|```/g, '').trim());

    // Save to Supabase (non-blocking — don't fail the request if this errors)
    try {
      const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
      const userEmail = token?.email as string | undefined;
      if (userEmail) {
        await supabaseAdmin.from('analyses').insert({
          user_email: userEmail,
          image_name: imageName ?? null,
          image_size: imageSize ?? null,
          seo_score: analysis.seoScore,
          alt_text: analysis.suggestedAltText,
          meta_title: analysis.metaTitle,
          meta_description: analysis.metaDescription,
          keywords: analysis.keywords,
          improvements: analysis.improvements,
          image_category: analysis.imageCategory,
          detected_content: analysis.detectedContent,
          tone: analysis.tone,
        });
      }
    } catch {
      // Silent — don't block the response
    }

    return NextResponse.json(analysis, {
      headers: { 'X-RateLimit-Remaining': String(remaining) },
    });
  } catch (err) {
    console.error('Analyze error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
