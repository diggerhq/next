'use server';

import { createOrRetrieveCustomer } from '@/data/admin/stripe';
import { getOrganizationSlugByOrganizationId, getOrganizationTitle } from '@/data/user/organizations';
import { createSupabaseUserServerActionClient } from '@/supabase-clients/user/createSupabaseUserServerActionClient';
import { toSiteURL } from '@/utils/helpers';
import { serverGetLoggedInUser } from '@/utils/server/serverGetLoggedInUser';
import { stripe } from '@/utils/stripe';

export async function createCheckoutSessionAction({
  organizationId,
  priceId,
  isTrial = false,
}: {
  organizationId: string;
  priceId: string;
  isTrial?: boolean;
}) {
  'use server';
  const TRIAL_DAYS = 14;
  const user = await serverGetLoggedInUser();

  const organizationTitle = await getOrganizationTitle(organizationId);

  const customer = await createOrRetrieveCustomer({
    organizationId: organizationId,
    organizationTitle: organizationTitle,
    email: user.email || '',
  });
  if (!customer) throw Error('Could not get customer');
  if (isTrial) {
    const stripeSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      billing_address_collection: 'auto',
      payment_method_collection: 'if_required',
      customer,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      allow_promotion_codes: true,
      subscription_data: {
        trial_period_days: TRIAL_DAYS,
        trial_settings: {
          end_behavior: {
            missing_payment_method: 'cancel',
          },
        },
        metadata: {},
      },
      success_url: toSiteURL(
        `/org/${organizationId}/settings/billing`,
      ),
      cancel_url: toSiteURL(`/org/${organizationId}/settings/billing`),
    });

    return stripeSession.id;
  }
  const stripeSession = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    billing_address_collection: 'required',
    customer,
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: 'subscription',
    allow_promotion_codes: true,
    subscription_data: {
      trial_settings: {
        end_behavior: {
          missing_payment_method: 'cancel',
        },
      },
    },
    metadata: {},
    success_url: toSiteURL(
      `/org/${organizationId}/settings/billing`,
    ),
    cancel_url: toSiteURL(`/org/${organizationId}/settings/billing`),
  });

  return stripeSession.id;
}

export async function createCustomerPortalLinkAction(organizationId: string) {
  'use server';
  const user = await serverGetLoggedInUser();
  const supabaseClient = createSupabaseUserServerActionClient();
  const { data, error } = await supabaseClient
    .from('organizations')
    .select('id, title')
    .eq('id', organizationId)
    .single();

  if (error) {
    throw error;
  }

  if (!data) {
    throw new Error('Organization not found');
  }

  const customer = await createOrRetrieveCustomer({
    organizationId: organizationId,
    organizationTitle: data.title,
    email: user.email || '',
  });

  const organizationSlug = await getOrganizationSlugByOrganizationId(organizationId);

  if (!customer) throw Error('Could not get customer');
  const { url } = await stripe.billingPortal.sessions.create({
    customer,
    return_url: toSiteURL(`/${organizationSlug}/settings/billing`),
  });

  return url;
}

export const manageSubsciptionStripe = async (organizationId: string) => {
  return await createCustomerPortalLinkAction(organizationId);
};

export const startTrialStripe = async (
  organizationId: string,
  priceId: string,
) => {
  return await createCheckoutSessionAction({
    organizationId,
    priceId,
    isTrial: true,
  });
};

export const getMRRStripe = async (startOfMonth: Date, endOfMonth: Date) => {
  let mrr = 0;
  const subscriptions = await getSubscriptionsListStripe(
    startOfMonth,
    endOfMonth,
  );

  subscriptions.data.forEach((sub) => {
    if (sub.status === 'active' || sub.status === 'trialing') {
      mrr +=
        ((sub.items.data[0].price.unit_amount ?? 0) *
          (sub.items.data[0].quantity ?? 0)) /
        100;
    }
  });
  return mrr;
};

export const getSubscriptionsListStripe = async (
  startOfMonth: Date,
  endOfMonth: Date,
) => {
  const subscriptions = await stripe.subscriptions.list({
    created: {
      gte: Math.floor(startOfMonth.getTime() / 1000),
      lt: Math.floor(endOfMonth.getTime() / 1000),
    },
    status: 'all',
  });
  return subscriptions;
};
