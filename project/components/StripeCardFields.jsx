import { StyleSheet, View } from 'react-native';

import { AppInput } from '@/components/AppInput';
import { SageColors, Spacing } from '@/constants/theme';
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
      <AppInput
        label="Card number"
        value={cardNumber}
        onChangeText={(t) => onCardNumberChange(formatCardNumber(t))}
        keyboardType="number-pad"
        placeholder="1234 5678 9012 3456"
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
  row: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  half: {
    flex: 1,
  },
});
