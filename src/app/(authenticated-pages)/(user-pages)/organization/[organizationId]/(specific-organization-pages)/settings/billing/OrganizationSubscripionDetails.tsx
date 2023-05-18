import { LoadingSpinner } from '@/components/presentational/tailwind/LoadingSpinner';
import { PricingModeToggle } from '@/components/presentational/tailwind/PricingModeToggle';
import H3 from '@/components/presentational/tailwind/Text/H3';
import { Table, UnwrapPromise } from '@/types';
import { classNames } from '@/utils/classNames';
import {
  useCreateOrganizationCheckoutSessionMutation,
  useCreateOrganizationCustomerPortalMutation,
  useGetAllActiveProducts,
  useGetIsOrganizationAdmin,
  useGetOrganizationSubscription,
} from '@/utils/react-query-hooks';
import { getStripe } from '@/utils/stripe-client';
import { getActiveProductsWithPrices } from '@/utils/supabase-queries';
import { useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import { FiCheck, FiExternalLink, FiX } from 'react-icons/fi';
import { useOrganizationContext } from '@/contexts/OrganizationContext';
import { Button } from '@/components/ui/Button';
import { T } from '@/components/ui/Typography';
import { useGetNormalizedSubscription } from '@/utils/react-queries/subscriptions';
import { formatNormalizedSubscription } from '@/utils/formatNormalizedSubscription';


function ChoosePricingTable() {
  const { organizationId, organizationRole } = useOrganizationContext();
  const isOrganizationAdmin = organizationRole === 'admin' || organizationRole === 'owner';
  const [pricingMode, setPricingMode] = useState<'month' | 'year'>('month');
  const {
    data: activeProducts,
    isLoading: isLoadingProducts,
    error,
  } = useGetAllActiveProducts();
  const { mutate, isLoading: isCreatingCheckoutSession } =
    useCreateOrganizationCheckoutSessionMutation({
      onSuccess: async (sessionId) => {
        const stripe = await getStripe();
        stripe?.redirectToCheckout({ sessionId });
      },
      onError: (error) => {
        toast.error(String(error));
      },
    });

  // supabase cannot sort by foreign table, so we do it here
  const productsSortedByPrice = useMemo(() => {
    if (!activeProducts) return [];
    const products = activeProducts.map((product) => {
      const prices = Array.isArray(product.prices)
        ? product.prices
        : [product.prices];
      const priceInSelectedInterval = prices.find((price) => {
        return price?.interval === pricingMode;
      });

      const priceString = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: priceInSelectedInterval?.currency ?? undefined,
        minimumFractionDigits: 0,
      }).format((priceInSelectedInterval?.unit_amount || 0) / 100);
      return {
        ...product,
        price: priceInSelectedInterval,
        priceString,
      };
    });

    return products
      .sort((a, b) => (a?.price?.unit_amount ?? 0) - (b?.price?.unit_amount ?? 0))
      .filter(Boolean);
  }, [activeProducts, pricingMode]);

  if (isLoadingProducts)
    return (
      <div>
        <LoadingSpinner className="text-blue-500" />
      </div>
    );

  if (error) return <div>Error</div>;
  return (
    <div className="max-w-2xl space-y-4">
      {/* <Overline>Pricing table</Overline> */}
      <H3>Pricing table</H3>
      <div className="space-y-2">
        <PricingModeToggle mode={pricingMode} onChange={setPricingMode} />
        <div className="flex space-x-6">
          {productsSortedByPrice.map((product) => {
            if (!product.price) {
              return null;
            }
            if (product.price.id === null || product.price.id === undefined || product.price.id === undefined || product.price.unit_amount === null || product.price.unit_amount === undefined) {
              return null;
            }
            const priceId = product.price.id;
            return (
              <>
                <div
                  key={product.id + pricingMode}
                  className="w-full flex-1 mt-4 p-8 order-2 bg-white shadow-lg rounded-lg sm:w-96 lg:w-full lg:order-1 border"
                >
                  <div className="mb-7 pb-7 flex items-center border-b border-gray-200">
                    <div className="ml-5">
                      <span className="block text-lg text-gray-600 font-medium">
                        {' '}
                        {product.name}
                      </span>
                      <span>
                        <span
                          key={priceId}
                          className="text-2xl font-bold"
                        >
                          {' '}
                          {product.priceString}/{product.price.interval}{' '}
                        </span>
                      </span>
                    </div>
                  </div>
                  <ul className="mb-7 font-medium text-gray-500">
                    <li className="flex text-md items-center mb-2">
                      <FiCheck className="text-green-500" />
                      <span className="ml-3">{product.description}</span>
                    </li>
                    <li className="flex text-md items-center mb-2">
                      <FiCheck className="text-green-500" />
                      <span className="ml-3">A nice feature</span>
                    </li>
                    <li className="flex text-md items-center mb-2">
                      <FiCheck className="text-green-500" />
                      <span className="ml-3">Another nice feature</span>
                    </li>
                    <li className="flex text-md items-center mb-2">
                      {product.price.unit_amount > 0 ? (
                        <FiCheck className="text-green-500" />
                      ) : (
                        <FiX className="text-red-500" />
                      )}
                      <span className="ml-3">A premium feature</span>
                    </li>
                  </ul>
                  <div className="rounded-xl py-1 text-center text-white text-xl space-y-2">
                    {isOrganizationAdmin ? (
                      <>
                        <Button
                          onClick={() => {
                            mutate({
                              organizationId: organizationId,
                              priceId: priceId,
                              isTrial: true,
                            });
                          }}
                        >
                          Start free trial
                        </Button>
                        <Button
                          onClick={() => {
                            mutate({
                              organizationId: organizationId,
                              priceId: priceId,
                            });
                          }}
                        >
                          {isCreatingCheckoutSession ? 'Loading...' : 'Choose'}
                        </Button>
                      </>
                    ) : (
                      <span className="text-sm bg-green-50 px-3 py-2 text-gray-900 rounded-lg">
                        Contact your administrator to upgrade plan
                      </span>
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

export function OrganizationSubscripionDetails() {
  const { organizationId, normalizedSubscription, organizationRole } = useOrganizationContext();
  const isOrganizationAdmin = organizationRole === 'admin' || organizationRole === 'owner';


  const { mutate, isLoading: isLoadingCustomerPortalLink } =
    useCreateOrganizationCustomerPortalMutation({
      onSuccess: (url) => {
        window.location.assign(url);
      }
    });

  const subscriptionDetails = formatNormalizedSubscription(normalizedSubscription);

  if (!subscriptionDetails.title || normalizedSubscription.type === 'no-subscription') {
    return <>
      <div className="space-y-1">
        <H3>Subscription</H3>
        <p className="text-gray-500 text-sm">
          This organization doesn't have any plan at the moment.
        </p>
      </div>
      <ChoosePricingTable />
    </>
  }



  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <H3>Subscription</H3>
        <T.P>You are currently on the{' '}
          <span className="text-blue-500">{subscriptionDetails.title} <span>{subscriptionDetails.sidenote}</span></span>. </T.P>
        <T.Subtle>{subscriptionDetails.description}</T.Subtle>
      </div>
      {isOrganizationAdmin ? (
        <div className="space-y-2">
          <button
            className={classNames(
              'inline-flex space-x-1 items-center  justify-center rounded border border-transparent py-2 px-4 text-sm font-medium  shadow-sm focus:outline-none focus:ring-2  focus:ring-offset-2',
              'bg-blue-500 focus:ring-blue-500 hover:bg-blue-600  text-white'
            )}
            onClick={() => {
              mutate({
                organizationId: organizationId,
              });
            }}
          >
            <span>
              {isLoadingCustomerPortalLink
                ? 'Loading...'
                : 'Manage Subscription'}{' '}
            </span>
            <FiExternalLink aria-hidden="true" />{' '}
          </button>
          <p className="text-gray-500 text-xs">
            Manage your subscription. You can modify, upgrade or cancel your
            membership from here.
          </p>
        </div>
      ) : (
        <p className="text-gray-500 text-sm">
          Contact your administrator to upgrade plan.
        </p>
      )}
    </div>
  );
}
