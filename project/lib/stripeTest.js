/**
 * Stripe test-mode payment simulation for Expo Go (no backend required).
 * Validates official Stripe test card patterns and returns a fake PaymentIntent id.
 */

const STRIPE_SUCCESS_CARDS = new Set([
  '4242424242424242',
  '4000056655665556',
  '5555555555554444',
  '2223003122003222',
]);

const STRIPE_DECLINE_CARD = '4000000000000002';

export function digitsOnly(value) {
  return String(value || '').replace(/\D/g, '');
}

export function formatCardNumber(value) {
  const digits = digitsOnly(value).slice(0, 16);
  return digits.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
}

export function formatExpiry(value) {
  const digits = digitsOnly(value).slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

export function formatCvc(value) {
  return digitsOnly(value).slice(0, 4);
}

export function formatZip(value) {
  return String(value || '')
    .trim()
    .slice(0, 10);
}

function parseExpiry(expiry) {
  const cleaned = String(expiry || '').replace(/\s/g, '');
  const parts = cleaned.includes('/') ? cleaned.split('/') : [cleaned.slice(0, 2), cleaned.slice(2)];
  const month = parseInt(parts[0], 10);
  let year = parseInt(parts[1], 10);
  if (Number.isNaN(month) || Number.isNaN(year)) return null;
  if (year < 100) year += 2000;
  return { month, year };
}

export function isExpiryValid(expiry) {
  const parsed = parseExpiry(expiry);
  if (!parsed || parsed.month < 1 || parsed.month > 12) return false;
  const now = new Date();
  const expEnd = new Date(parsed.year, parsed.month, 0, 23, 59, 59);
  return expEnd >= now;
}

/**
 * Simulates Stripe PaymentIntent confirmation in test mode.
 */
export async function processStripeTestPayment({ cardNumber, expiry, cvc, zip, amount }) {
  await new Promise((resolve) => setTimeout(resolve, 600));

  const number = digitsOnly(cardNumber);

  if (number.length < 13 || number.length > 19) {
    return { success: false, message: 'Please enter a valid card number.' };
  }

  if (number === STRIPE_DECLINE_CARD) {
    return {
      success: false,
      message: 'Your card was declined. Please try a different card.',
    };
  }

  if (!STRIPE_SUCCESS_CARDS.has(number) && !number.startsWith('4242')) {
    return {
      success: false,
      message: 'Please enter a valid card number.',
    };
  }

  if (!isExpiryValid(expiry)) {
    return {
      success: false,
      message: 'Enter a valid future expiry date (MM/YY).',
    };
  }

  const cvcDigits = digitsOnly(cvc);
  if (cvcDigits.length < 3) {
    return { success: false, message: 'Enter a valid 3- or 4-digit CVV.' };
  }

  if (!formatZip(zip)) {
    return { success: false, message: 'Enter a billing ZIP / postal code.' };
  }

  const paymentId = `pi_test_${Date.now()}`;
  return {
    success: true,
    paymentId,
    message: `Payment of $${Number(amount).toFixed(2)} authorized.`,
    testMode: true,
  };
}
