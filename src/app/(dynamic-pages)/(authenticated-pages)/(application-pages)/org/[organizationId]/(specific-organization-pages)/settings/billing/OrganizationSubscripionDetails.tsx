'use server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { T } from '@/components/ui/Typography';
import { DIGGER_FEATURES } from '@/constants';
import { getActiveProductsWithPrices } from '@/data/user/organizations';
import type { Enum, NormalizedSubscription, UnwrapPromise } from '@/types';
import { cn } from '@/utils/cn';
import { formatNormalizedSubscription } from '@/utils/formatNormalizedSubscription';
import {
  ManageSubscriptionButton,
  StartFreeTrialButton
} from './ActionButtons';

function getProductsSortedByPrice(
  activeProducts: UnwrapPromise<ReturnType<typeof getActiveProductsWithPrices>>,
) {
  if (!activeProducts) return [];
  const products = activeProducts.flatMap((product) => {
    const prices = Array.isArray(product.prices)
      ? product.prices
      : [product.prices];

    const pricesForProduct = prices.map((price) => {
      const priceString = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: price?.currency ?? undefined,
        minimumFractionDigits: 0,
      }).format((price?.unit_amount || 0) / 100);
      return {
        ...product,
        price,
        priceString,
      };
    });
    return pricesForProduct;
  });

  return products
    .sort((a, b) => (a?.price?.unit_amount ?? 0) - (b?.price?.unit_amount ?? 0))
    .filter(Boolean);
}

async function ChoosePricingTable({
  organizationId,
  isOrganizationAdmin,
}: {
  organizationId: string;
  isOrganizationAdmin: boolean;
}) {
  const activeProducts = await getActiveProductsWithPrices();

  // supabase cannot sort by foreign table, so we do it here
  const productsSortedByPrice = getProductsSortedByPrice(activeProducts);

  return (
    <div className="max-w-7xl space-y-4">
      {/* <Overline>Pricing table</Overline> */}
      {/* <H3 className='border-none mt-3 mb-0'>Pricing table</H3> */}
      <div className="space-y-2">
        {/* <PricingModeToggle mode={pricingMode} onChange={setPricingMode} /> */}
        <div className="flex space-x-6 w-full">
          {productsSortedByPrice.map((product) => {
            if (!product.price) {
              return null;
            }
            if (
              product.price.id === null ||
              product.price.id === undefined ||
              product.price.id === undefined ||
              product.price.unit_amount === null ||
              product.price.unit_amount === undefined
            ) {
              return null;
            }
            const priceId = product.price.id;
            return (
              <>
                <div
                  key={product.id + priceId}
                  className={cn(
                    'w-full',
                    'flex flex-col justify-between',
                    'mt-3 order-2 shadow-none overflow-hidden rounded-xl',
                    'hover:shadow-xl transition',
                    'sm:w-96 lg:w-full lg:order-1',
                    'border mb-2',
                  )}
                >
                  <div>
                    <div className="mb-6 p-7 pt-6 flex items-center border-b">
                      <div>
                        <T.H4 className="mt-0 mb-4 text-primary-text">
                          {product.name}
                        </T.H4>
                        <span>
                          <T.H1 className="text-primary-text" key={priceId}>
                            {product.priceString}
                            <span className="text-base tracking-normal text-muted-foreground font-medium">
                              per {product.price.interval}
                            </span>
                          </T.H1>
                        </span>
                      </div>
                    </div>

                    <div className="px-5 pl-6 pt-0 mb-8">
                      {DIGGER_FEATURES.map((feature, index) => {
                        const FeatureIcon = feature.icon;
                        return (
                          <li key={index} className="grid grid-cols-[24px,1fr] gap-0 text-md items-start mb-2">
                            <FeatureIcon className="text-green-600 w-6 h-6" />
                            <div>
                              <T.P className="leading-6 ml-3 font-semibold">{feature.title}</T.P>
                              <T.P className="text-sm text-muted-foreground ml-3">{feature.description}</T.P>
                            </div>
                          </li>
                        );
                      })}
                    </div>
                  </div>

                  <div className="rounded-xl py-1 mb-5 mx-5 mt-4 text-center text-white text-xl space-y-2">
                    {isOrganizationAdmin ? (
                      <>
                        <StartFreeTrialButton
                          organizationId={organizationId}
                          priceId={priceId}
                        />
                        {/* <CreateSubscriptionButton
                          organizationId={organizationId}
                          priceId={priceId}
                        /> */}
                      </>
                    ) : (
                      <T.P className="py-2 px-4 bg-primary-background dark:bg-dark-primary-background text-sm text-primary-text dark:text-dark-primary-text rounded-lg">
                        Contact your administrator to upgrade plan
                      </T.P>
                    )}
                  </div>
                </div>
              </>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export async function OrganizationSubscripionDetails({
  organizationId,
  organizationRole,
  normalizedSubscription,
}: {
  normalizedSubscription: NormalizedSubscription;
  organizationId: string;
  organizationRole: Enum<'organization_member_role'>;
}) {
  const isOrganizationAdmin =
    organizationRole === 'admin' || organizationRole === 'owner';



  const subscriptionDetails = formatNormalizedSubscription(
    normalizedSubscription,
  );

  if (normalizedSubscription.type === 'bypassed_enterprise_organization') {
    return <Card>
      <CardHeader>
        <CardTitle>
          Subscription
        </CardTitle>
        <CardDescription>
          This organization is using the enterprise (demo) plan. Contact application administrator to modify subscription details.
        </CardDescription>
      </CardHeader>
    </Card>;
  }

  if (
    !subscriptionDetails.title ||
    normalizedSubscription.type === 'no-subscription'
  ) {
    return (
      <Card className="w-full max-w-4xl">
        <CardHeader>
          <CardTitle>
            Subscription
          </CardTitle>
          <CardDescription>
            This organization doesn't have any plan at the moment
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChoosePricingTable
            organizationId={organizationId}
            isOrganizationAdmin={isOrganizationAdmin}
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <T.H3 className="text-foreground dark:text-dark-foreground">Subscription</T.H3>
        <T.P className="text-muted-foreground">
          You are currently on the{' '}
          <span className="text-primary">
            {subscriptionDetails.title}{' '}
            <span>{subscriptionDetails.sidenote}</span>
          </span>
          .{' '}
        </T.P>
        <T.Subtle>{subscriptionDetails.description}</T.Subtle>
      </div>
      {isOrganizationAdmin ? (
        <ManageSubscriptionButton organizationId={organizationId} />
      ) : (
        <T.P className="py-2 px-4 bg-background dark:bg-dark-background text-sm text-foreground dark:text-dark-foreground rounded-lg">
          Contact your administrator to upgrade plan.
        </T.P>
      )}
    </div>
  );
}
