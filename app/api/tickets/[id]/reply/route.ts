import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { z } from 'zod';
import { rateLimit, getClientIp } from '@/lib/rate-limit';

const replySchema = z.object({
  text: z
    .string()
    .min(1, 'Message requis')
    .max(5000, 'Message trop long (max 5000 caractères)')
    .trim(),
  from_role: z.enum(['client', 'admin'], {
    message: 'Rôle invalide',
  }),
  author_name: z.string().max(100).trim().optional(),
});

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  if (!UUID_REGEX.test(params.id)) {
    return NextResponse.json({ error: 'ID invalide' }, { status: 400 });
  }

  // Rate limit: 20 replies per minute per IP
  const ip = getClientIp(req);
  const { success } = rateLimit(`reply:${ip}`, { limit: 20, windowMs: 60_000 });
  if (!success) {
    return NextResponse.json(
      { error: 'Trop de requêtes. Réessayez dans une minute.' },
      { status: 429, headers: { 'Retry-After': '60' } }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Corps de requête invalide' }, { status: 400 });
  }

  const parsed = replySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const { text, from_role, author_name } = parsed.data;

  const { data, error } = await supabaseAdmin
    .from('replies')
    .insert({ ticket_id: params.id, text, from_role, author_name })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Passer le ticket en "En Cours" si encore Ouvert
  await supabaseAdmin
    .from('tickets')
    .update({ status: 'En Cours' })
    .eq('id', params.id)
    .eq('status', 'Ouvert');

  return NextResponse.json(data, { status: 201 });
}
