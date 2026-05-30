/** Stripe test mode — no live charges; use test keys from https://dashboard.stripe.com/test/apikeys */
export const STRIPE_TEST_MODE = true;

export const STRIPE_PUBLISHABLE_KEY =
  process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_REPLACE_WITH_YOUR_STRIPE_TEST_KEY';

/** Shown in checkout when card payment is selected */
export const STRIPE_TEST_CARD_HINT = '4242 4242 4242 4242 · Any future MM/YY · Any CVC · Any ZIP';
