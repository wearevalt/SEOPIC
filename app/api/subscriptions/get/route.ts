import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { subscriptionService } from '@/lib/subscription-service';

export async function GET(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const userEmail = token?.email as string | undefined;

  if (!userEmail) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }

  try {
    const subscription = await subscriptionService.getUserSubscription(userEmail);
    return NextResponse.json(subscription);
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
