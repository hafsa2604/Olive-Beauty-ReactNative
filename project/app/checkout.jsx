import { Stack, router } from 'expo-router';
import { useState } from 'react';
import { Alert, Keyboard, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { AppButton } from '@/components/AppButton';
import { AppInput } from '@/components/AppInput';
import { GlassCard } from '@/components/GlassCard';
import { KeyboardAwareForm } from '@/components/KeyboardAwareForm';
import { MatchaScreen } from '@/components/MatchaScreen';
import { StripeCardFields } from '@/components/StripeCardFields';
import { useApp } from '@/context/AppContext';
import { appHref } from '@/lib/href';
import { processStripeTestPayment } from '@/lib/stripeTest';
import { SageColors, Radius, Spacing } from '@/constants/theme';

const PAYMENT_METHODS = [
  {
    id: 'cod',
    title: 'Cash on Delivery',
    subtitle: 'Pay when your order arrives',
    icon: 'cash-outline',
  },
  {
    id: 'card',
    title: 'Card Payment',
    subtitle: 'Visa & Mastercard',
    icon: 'card-outline',
  },
];

export default function CheckoutScreen() {
  const { user, cart, products, placeOrder } = useApp();
  const [contactName, setContactName] = useState(user?.name ?? '');
  const [contactPhone, setContactPhone] = useState(user?.phone ?? '');
  const [contactEmail, setContactEmail] = useState(user?.email ?? '');
  const [address, setAddress] = useState(user?.address ?? '');
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [zip, setZip] = useState('');
  const [loading, setLoading] = useState(false);

  const subtotal = cart.reduce((sum, item) => {
    const product = products.find((p) => String(p.id) === String(item.productId));
    return sum + (product ? product.price * item.quantity : 0);
  }, 0);
  const shipping = 5.99;
  const total = subtotal + shipping;

  const handlePlaceOrder = async () => {
    Keyboard.dismiss();

    if (!user) {
      Alert.alert('Sign in required', 'Please sign in to complete checkout.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign In', onPress: () => router.push(appHref('/(auth)/login')) },
      ]);
      return;
    }

    if (!contactName.trim()) {
      Alert.alert('Contact name required', 'Please enter your full name.');
      return;
    }
    if (!contactPhone.trim()) {
      Alert.alert('Phone required', 'Please enter a phone number we can reach you on.');
      return;
    }
    if (!contactEmail.trim() || !contactEmail.includes('@')) {
      Alert.alert('Email required', 'Please enter a valid email address.');
      return;
    }
    if (!address.trim()) {
      Alert.alert('Address required', 'Please enter your delivery address.');
      return;
    }

    let stripePaymentId = null;
    let paymentStatus = paymentMethod === 'cod' ? 'pending_cod' : 'pending';

    if (paymentMethod === 'card') {
      setLoading(true);
      const payment = await processStripeTestPayment({
        cardNumber,
        expiry,
        cvc,
        zip,
        amount: total,
      });
      setLoading(false);

      if (!payment.success) {
        Alert.alert('Payment failed', payment.message);
        return;
      }

      stripePaymentId = payment.paymentId;
      paymentStatus = 'paid_test';
      Alert.alert('Payment successful', payment.message);
    }

    setLoading(true);
    try {
      const order = await placeOrder({
        contactName,
        contactPhone,
        contactEmail,
        shippingAddress: address,
        paymentMethod,
        shipping,
        paymentStatus,
        stripePaymentId,
      });
      setLoading(false);

      if (!order) {
        Alert.alert('Order failed', 'Could not place order. Check your cart and try again.');
        return;
      }

      Alert.alert('Order placed', 'Thank you! Your order has been confirmed.', [
        { text: 'OK', onPress: () => router.replace(appHref('/thankyou')) },
      ]);
    } catch {
      setLoading(false);
      Alert.alert('Order failed', 'Something went wrong. Please try again.');
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: true, title: 'Checkout' }} />
      <MatchaScreen edges={false}>
        <KeyboardAwareForm
          nested
          extraBottomPadding={48}
          contentContainerStyle={styles.scroll}
          keyboardVerticalOffset={96}>
          <GlassCard>
            <View style={styles.sectionHead}>
              <Ionicons name="person-outline" size={22} color={SageColors.primary} />
              <Text style={styles.section}>Contact Details</Text>
            </View>
            <AppInput
              label="Full name"
              value={contactName}
              onChangeText={setContactName}
              placeholder="Your name"
              autoCapitalize="words"
              returnKeyType="next"
            />
            <AppInput
              label="Phone number"
              value={contactPhone}
              onChangeText={setContactPhone}
              keyboardType="phone-pad"
              placeholder="+1 555 000 0000"
              returnKeyType="next"
            />
            <AppInput
              label="Email"
              value={contactEmail}
              onChangeText={setContactEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholder="you@email.com"
              returnKeyType="next"
            />
          </GlassCard>

          <GlassCard style={styles.block}>
            <View style={styles.sectionHead}>
              <Ionicons name="location-outline" size={22} color={SageColors.primary} />
              <Text style={styles.section}>Delivery Address</Text>
            </View>
            <AppInput
              label="Full address"
              value={address}
              onChangeText={setAddress}
              placeholder="Street, city, state, zip code"
              multiline
              numberOfLines={3}
              style={styles.addressInput}
              returnKeyType="default"
            />
          </GlassCard>

          <GlassCard style={styles.block}>
            <View style={styles.sectionHead}>
              <Ionicons name="wallet-outline" size={22} color={SageColors.primary} />
              <Text style={styles.section}>Payment Method</Text>
            </View>
            {PAYMENT_METHODS.map((method) => {
              const selected = paymentMethod === method.id;
              return (
                <Pressable
                  key={method.id}
                  style={[styles.payOption, selected && styles.payOptionSelected]}
                  onPress={() => setPaymentMethod(method.id)}>
                  <View style={[styles.radio, selected && styles.radioSelected]}>
                    {selected ? <View style={styles.radioDot} /> : null}
                  </View>
                  <Ionicons name={method.icon} size={24} color={SageColors.primary} />
                  <View style={styles.payTextCol}>
                    <Text style={styles.payTitle}>{method.title}</Text>
                    <Text style={styles.paySubtitle}>{method.subtitle}</Text>
                  </View>
                </Pressable>
              );
            })}
            {paymentMethod === 'card' ? (
              <StripeCardFields
                cardNumber={cardNumber}
                onCardNumberChange={setCardNumber}
                expiry={expiry}
                onExpiryChange={setExpiry}
                cvc={cvc}
                onCvcChange={setCvc}
                zip={zip}
                onZipChange={setZip}
              />
            ) : null}
          </GlassCard>

          <GlassCard style={styles.block}>
            <View style={styles.sectionHead}>
              <Ionicons name="receipt-outline" size={22} color={SageColors.primary} />
              <Text style={styles.section}>Order Summary</Text>
            </View>
            <Text style={styles.items}>{cart.length} item(s)</Text>
            <View style={styles.row}>
              <Text style={styles.label}>Subtotal</Text>
              <Text style={styles.value}>${subtotal.toFixed(2)}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Shipping</Text>
              <Text style={styles.value}>${shipping.toFixed(2)}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Payment</Text>
              <Text style={styles.value}>
                {paymentMethod === 'cod' ? 'Cash on Delivery' : 'Card Payment'}
              </Text>
            </View>
            <View style={[styles.row, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.total}>${total.toFixed(2)}</Text>
            </View>
            <AppButton
              title={paymentMethod === 'card' ? 'Pay & Place Order' : 'Place Order'}
              onPress={handlePlaceOrder}
              loading={loading}
            />
          </GlassCard>
        </KeyboardAwareForm>
      </MatchaScreen>
    </>
  );
}

const styles = StyleSheet.create({
  scroll: {
    padding: Spacing.md,
    paddingTop: Spacing.sm,
  },
  block: {
    marginTop: Spacing.md,
  },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: Spacing.md,
  },
  section: {
    fontSize: 18,
    fontWeight: '700',
    color: SageColors.text,
  },
  addressInput: {
    minHeight: 88,
    textAlignVertical: 'top',
  },
  payOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: SageColors.cardBorder,
    marginBottom: Spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.6)',
  },
  payOptionSelected: {
    borderColor: SageColors.primary,
    backgroundColor: SageColors.sageLight,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: SageColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    borderColor: SageColors.primaryDark,
  },
  radioDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: SageColors.primary,
  },
  payTextCol: {
    flex: 1,
  },
  payTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: SageColors.text,
  },
  paySubtitle: {
    fontSize: 13,
    color: SageColors.textMuted,
    marginTop: 2,
  },
  items: {
    color: SageColors.textMuted,
    marginBottom: Spacing.sm,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    fontSize: 15,
    color: SageColors.textMuted,
  },
  value: {
    fontSize: 15,
    color: SageColors.text,
  },
  totalRow: {
    marginTop: Spacing.sm,
    marginBottom: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: SageColors.cardBorder,
  },
  totalLabel: {
    fontSize: 17,
    fontWeight: '700',
    color: SageColors.text,
  },
  total: {
    fontSize: 24,
    fontWeight: '700',
    color: SageColors.primaryDark,
  },
});
