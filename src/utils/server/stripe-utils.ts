export function getIsStripeTestMode() {
  return process.env.STRIPE_SECRET_KEY.startsWith('sk_test') || typeof process.env.STRIPE_SECRET_KEY === 'undefined'
}
