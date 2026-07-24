'use server';

import { redirect } from 'next/navigation';
import { startStripeConnectOnboarding } from '@/lib/winery/server';

export async function startStripeOnboardingAction(): Promise<never> {
  let url: string;
  try {
    const result = await startStripeConnectOnboarding();
    const parsed = new URL(result.onboarding_url);
    if (parsed.protocol !== 'https:' || !parsed.hostname.endsWith('.stripe.com')) {
      throw new Error('URL_STRIPE_INVALID');
    }
    url = parsed.toString();
  } catch {
    redirect('/bodega/pagos?error=onboarding');
  }

  // Next typed routes only model internal destinations. This external URL has
  // been constrained above to Stripe's HTTPS onboarding domain.
  redirect(url as never);
}
