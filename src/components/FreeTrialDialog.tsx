'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DIGGER_FEATURES } from '@/constants'
import { getActiveProductsWithPrices } from '@/data/user/organizations'
import { useSAToastMutation } from '@/hooks/useSAToastMutation'
import { createTrialSubSuccessCB } from '@/lib/payments/paymentGatewayUtils'
import { startTrial } from '@/lib/payments/paymentUtilsServer'
import type { UnwrapPromise } from '@/types'
import { useState } from 'react'



function getProductsSortedByPrice(
  activeProducts: UnwrapPromise<ReturnType<typeof getActiveProductsWithPrices>>
) {
  if (!activeProducts) return []
  const products = activeProducts.flatMap((product) => {
    const prices = Array.isArray(product.prices) ? product.prices : [product.prices]
    return prices.map((price) => ({
      ...product,
      price,
      priceString: new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: price?.currency ?? undefined,
        minimumFractionDigits: 0,
      }).format((price?.unit_amount || 0) / 100),
    }))
  })
  return products
    .sort((a, b) => (a?.price?.unit_amount ?? 0) - (b?.price?.unit_amount ?? 0))
    .filter(Boolean)
}
type FreeTrialDialogProps = {
  organizationId: string
  activeProducts: UnwrapPromise<ReturnType<typeof getActiveProductsWithPrices>>
  isOrganizationAdmin: boolean,
  defaultOpen?: boolean
}
export function FreeTrialDialog({ organizationId, activeProducts, isOrganizationAdmin, defaultOpen = false }: FreeTrialDialogProps) {
  // this should be true
  const [open, setOpen] = useState(defaultOpen)
  // supabase cannot sort by foreign table, so we do it here
  const productsSortedByPrice = getProductsSortedByPrice(activeProducts);


  const { mutate, isLoading } = useSAToastMutation(
    async (priceId: string) => {
      return await startTrial(organizationId, priceId)
    },
    {
      loadingMessage: 'Starting trial...',
      errorMessage: 'Failed to start trial',
      successMessage: 'Redirecting to checkout...',
      onSuccess(response) {
        if (response.status === 'success' && response.data) {
          createTrialSubSuccessCB(response.data)
        }
      },
    }
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[900px]">
        <DialogHeader>
          <DialogTitle>Start Your Free Trial</DialogTitle>
          <DialogDescription>
            Your organization doesn't have an active subscription. Choose a plan to start your free trial.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-auto gap-4">
          {productsSortedByPrice.map((product) => (
            <Card key={product.id}>
              <CardHeader>
                <CardTitle>{product.name}</CardTitle>
                <CardDescription>{product.priceString} per {product.price?.interval}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {DIGGER_FEATURES.map((feature, index) => {
                    const FeatureIcon = feature.icon
                    return (
                      <li key={index} className="flex items-start">
                        <FeatureIcon className="mr-2 h-4 w-4 mt-1 flex-shrink-0" />
                        <div>
                          <span className="font-semibold">{feature.title}</span>
                          <p className="text-sm text-muted-foreground">{feature.description}</p>
                        </div>
                      </li>
                    )
                  })}
                </ul>
                {
                  isOrganizationAdmin ? (
                    <Button
                      className="mt-4 w-full"
                      onClick={() => mutate(product.price?.id ?? '')}
                      disabled={isLoading}
                    >
                      {isLoading ? 'Starting...' : 'Start Free Trial'}
                    </Button>
                  ) : (
                    <Button
                      className="mt-4 w-full"
                      disabled
                    >
                      Contact your admin
                    </Button>
                  )
                }
              </CardContent>
            </Card>
          ))}
        </div>

      </DialogContent>
    </Dialog>
  )
}