import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { ticketCreateSchema } from '@/lib/schemas';
import { rateLimit, getClientIp } from '@/lib/rate-limit';

export async function GET(req: NextRequest) {
  const supabaseAdmin = getSupabaseAdmin();
  const email = req.nextUrl.searchParams.get('email');

  let query = supabaseAdmin
    .from('tickets')
    .select('*, replies(*)')
    .order('created_at', { ascending: false });

  if (email) {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Email invalide' }, { status: 400 });
    }

    query = query.eq('client_email', email);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const supabaseAdmin = getSupabaseAdmin();

  const ip = getClientIp(req);
  const { success } = rateLimit(`tickets:${ip}`, {
    limit: 5,
    windowMs: 5 * 60_000,
  });

  if (!success) {
    return NextResponse.json(
      { error: 'Trop de requêtes. Réessayez dans 5 minutes.' },
      { status: 429, headers: { 'Retry-After': '300' } }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Corps de requête invalide' }, { status: 400 });
  }

  const parsed = ticketCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  const { title, description, client_name, client_email, priority } = parsed.data;

  const { data, error } = await supabaseAdmin
    .from('tickets')
    .insert({ title, description, client_name, client_email, priority })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
