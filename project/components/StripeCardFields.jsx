import { StyleSheet, Text, View } from 'react-native';

import { AppInput } from '@/components/AppInput';
import { STRIPE_TEST_CARD_HINT, STRIPE_TEST_MODE } from '@/constants/stripe';
import { SageColors, Radius, Spacing } from '@/constants/theme';
import {
  formatCardNumber,
  formatCvc,
  formatExpiry,
  formatZip,
} from '@/lib/stripeTest';

export function StripeCardFields({
  cardNumber,
  onCardNumberChange,
  expiry,
  onExpiryChange,
  cvc,
  onCvcChange,
  zip,
  onZipChange,
}) {
  return (
    <View style={styles.wrap}>
      {STRIPE_TEST_MODE ? (
        <View style={styles.banner}>
          <Text style={styles.bannerTitle}>Stripe test mode</Text>
          <Text style={styles.bannerText}>{STRIPE_TEST_CARD_HINT}</Text>
        </View>
      ) : null}

      <AppInput
        label="Card number"
        value={cardNumber}
        onChangeText={(t) => onCardNumberChange(formatCardNumber(t))}
        keyboardType="number-pad"
        placeholder="4242 4242 4242 4242"
        maxLength={19}
        autoComplete="cc-number"
      />
      <View style={styles.row}>
        <View style={styles.half}>
          <AppInput
            label="Expiry (MM/YY)"
            value={expiry}
            onChangeText={(t) => onExpiryChange(formatExpiry(t))}
            keyboardType="number-pad"
            placeholder="12/34"
            maxLength={5}
          />
        </View>
        <View style={styles.half}>
          <AppInput
            label="CVC"
            value={cvc}
            onChangeText={(t) => onCvcChange(formatCvc(t))}
            keyboardType="number-pad"
            placeholder="123"
            maxLength={4}
            secureTextEntry
          />
        </View>
      </View>
      <AppInput
        label="ZIP / Postal code"
        value={zip}
        onChangeText={(t) => onZipChange(formatZip(t))}
        keyboardType="default"
        placeholder="10001"
        autoCapitalize="characters"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: Spacing.sm,
  },
  banner: {
    backgroundColor: SageColors.sageLight,
    borderRadius: Radius.md,
    padding: Spacing.sm,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: SageColors.cardBorder,
  },
  bannerTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: SageColors.primaryDark,
    marginBottom: 4,
  },
  bannerText: {
    fontSize: 12,
    lineHeight: 18,
    color: SageColors.textMuted,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  half: {
    flex: 1,
  },
});
