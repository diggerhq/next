import { LucideIcon } from '@/components/LucideIcon';
import { T } from '@/components/ui/Typography';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { validateStripeKeys } from '@/utils/stripe';
import dynamic from 'next/dynamic';
import { Suspense } from 'react';

const StripeSaaSMetrics = dynamic(() =>
  import('./StripeSaasMetrics').then((m) => m.StripeSaaSMetrics),
);

export default async function AdminPanel() {
  if (
    !validateStripeKeys({
      stripePublishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
      stripeSecretKey: process.env.STRIPE_SECRET_KEY,
      stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
    })
  ) {
    return (
      <div className="space-y-4">
        <T.H2 className="text-2xl mt-10 mb-2 font-bold">Quick Stats</T.H2>
        <div className="max-w-xl">
          <Alert variant="destructive">
            <LucideIcon name="AlertTriangle" className="w-4 h-4" />
            <AlertTitle>Check your Stripe keys</AlertTitle>
            <AlertDescription>
              Please set the STRIPE_SECRET_KEY,
              NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY, and STRIPE_WEBHOOK_SECRET
              environment variables in your .env file to use this feature.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <Suspense fallback={<T.Subtle>Loading...</T.Subtle>}>
      {<StripeSaaSMetrics />}
    </Suspense>
  );
}
