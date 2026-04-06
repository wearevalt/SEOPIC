import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { z } from 'zod'
import { analyzeSchema } from '@/lib/schemas'
import { rateLimit, getClientIp } from '@/lib/rate-limit'
import { supabaseAdmin } from '@/lib/supabase'

const analysisResponseSchema = z.object({
  detectedContent: z.string(),
  suggestedAltText: z.string(),
  metaTitle: z.string(),
  metaDescription: z.string(),
  keywords: z.array(z.string()),
  seoScore: z.number().min(0).max(100),
  improvements: z.array(z.string()),
  imageCategory: z.string(),
  tone: z.string(),
})

export async function POST(req: NextRequest) {
  const ip = getClientIp(req)
  const { success, remaining } = rateLimit(`analyze:${ip}`, {
    limit: 10,
    windowMs: 60_000,
  })

  if (!success) {
    return NextResponse.json(
      { error: 'Trop de requêtes. Réessayez dans une minute.' },
      { status: 429, headers: { 'Retry-After': '60' } }
    )
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  const model = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-6'

  if (!apiKey) {
    return NextResponse.json({ error: 'API non configurée' }, { status: 500 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Corps de requête invalide' }, { status: 400 })
  }

  const parsed = analyzeSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || 'Requête invalide' },
      { status: 400 }
    )
  }

  const { imageBase64, mimeType, imageName, imageSize } = parsed.data

  if (imageSize && imageSize > 10 * 1024 * 1024) {
    return NextResponse.json(
      { error: 'Image trop volumineuse. Maximum 10MB.' },
      { status: 400 }
    )
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model,
        max_tokens: 1000,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: mimeType,
                  data: imageBase64,
                },
              },
              {
                type: 'text',
                text: "Analysez cette image pour l'optimisation SEO. Répondez uniquement avec un JSON valide en français.",
              },
            ],
          },
        ],
      }),
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: "Service d’analyse indisponible" },
        { status: 502 }
      )
    }

    const data = await response.json()

    const textBlock = data?.content?.find((item: any) => item.type === 'text')
    if (!textBlock?.text) {
      return NextResponse.json({ error: 'Réponse IA invalide' }, { status: 502 })
    }

    let rawAnalysis: unknown
    try {
      rawAnalysis = JSON.parse(textBlock.text.replace(/```json|```/g, '').trim())
    } catch {
      return NextResponse.json({ error: 'JSON IA invalide' }, { status: 502 })
    }

    const validated = analysisResponseSchema.safeParse(rawAnalysis)
    if (!validated.success) {
      return NextResponse.json({ error: 'Réponse IA mal formée' }, { status: 502 })
    }

    const analysis = validated.data

    try {
      const token = await getToken({
        req,
        secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET,
      })

      const userEmail = token?.email as string | undefined

      if (userEmail) {
        const { error } = await supabaseAdmin.from('analyses').insert({
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
        })

        if (error) {
          console.error('Supabase insert failed:', error)
        }
      }
    } catch (error) {
      console.error('History save failed:', error)
    }

    return NextResponse.json(analysis, {
      headers: {
        'X-RateLimit-Remaining': String(remaining),
      },
    })
  } catch (error) {
    console.error('Analyze error:', error)
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
  }
}
