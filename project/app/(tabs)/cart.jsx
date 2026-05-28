import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { AppButton } from '@/components/AppButton';
import { GlassCard } from '@/components/GlassCard';
import { KeyboardAwareForm } from '@/components/KeyboardAwareForm';
import { MatchaScreen } from '@/components/MatchaScreen';
import { useApp } from '@/context/AppContext';
import { appHref } from '@/lib/href';
import { resolveImage } from '@/constants/images';
import { SageColors, Radius, Shadows, Spacing } from '@/constants/theme';

export default function CartScreen() {
  const { cart, products, updateCartQuantity, removeFromCart } = useApp();

  const items = cart
    .map((item) => {
      const product = products.find((p) => p.id === item.productId);
      if (!product) return null;
      return { ...item, product };
    })
    .filter((i) => i !== null);

  const subtotal = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  const shipping = subtotal > 0 ? 5.99 : 0;
  const total = subtotal + shipping;

  if (items.length === 0) {
    return (
      <MatchaScreen>
        <View style={styles.emptyWrap}>
          <View style={styles.emptyIcon}>
            <Ionicons name="bag-outline" size={48} color={SageColors.primary} />
          </View>
          <Text style={styles.emptyTitle}>Your bag is empty</Text>
          <Text style={styles.emptyText}>Discover matcha-infused beauty essentials.</Text>
          <AppButton title="Start Shopping" onPress={() => router.push(appHref('/(tabs)'))} style={styles.shopBtn} />
        </View>
      </MatchaScreen>
    );
  }

  return (
    <MatchaScreen edges={false}>
      <KeyboardAwareForm contentContainerStyle={styles.scroll} extraBottomPadding={56}>
        <Text style={styles.title}>Cart & Checkout</Text>
        <Text style={styles.subtitle}>{items.length} item(s) · Secure checkout</Text>

        {items.map(({ product, quantity }) => (
          <GlassCard key={product.id} style={styles.item}>
            <Image source={resolveImage(product.image)} style={styles.image} contentFit="cover" />
            <View style={styles.itemBody}>
              <Text style={styles.name} numberOfLines={2}>
                {product.name}
              </Text>
              <Text style={styles.price}>${product.price.toFixed(2)}</Text>
              <View style={styles.qtyRow}>
                <Pressable
                  style={styles.qtyBtn}
                  onPress={() => updateCartQuantity(product.id, quantity - 1)}>
                  <Ionicons name="remove" size={18} color={SageColors.primary} />
                </Pressable>
                <Text style={styles.qty}>{quantity}</Text>
                <Pressable
                  style={styles.qtyBtn}
                  onPress={() => updateCartQuantity(product.id, quantity + 1)}>
                  <Ionicons name="add" size={18} color={SageColors.primary} />
                </Pressable>
                <Pressable
                  style={styles.remove}
                  onPress={() => {
                    Alert.alert('Remove item', `Remove ${product.name}?`, [
                      { text: 'Cancel', style: 'cancel' },
                      { text: 'Remove', style: 'destructive', onPress: () => removeFromCart(product.id) },
                    ]);
                  }}>
                  <Ionicons name="trash-outline" size={20} color={SageColors.danger} />
                </Pressable>
              </View>
            </View>
          </GlassCard>
        ))}

        <GlassCard style={styles.summary}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>${subtotal.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Shipping</Text>
            <Text style={styles.summaryValue}>${shipping.toFixed(2)}</Text>
          </View>
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.total}>${total.toFixed(2)}</Text>
          </View>
          <AppButton title="Proceed to Checkout" onPress={() => router.push(appHref('/checkout'))} />
        </GlassCard>
      </KeyboardAwareForm>
    </MatchaScreen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    padding: Spacing.md,
    paddingTop: 56,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: SageColors.text,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: SageColors.textMuted,
    marginBottom: Spacing.md,
  },
  item: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
    gap: Spacing.md,
  },
  image: {
    width: 88,
    height: 88,
    borderRadius: Radius.md,
    backgroundColor: SageColors.beige,
  },
  itemBody: {
    flex: 1,
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
    color: SageColors.text,
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: SageColors.primaryDark,
    marginVertical: 4,
  },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  qtyBtn: {
    width: 32,
    height: 32,
    borderRadius: Radius.full,
    backgroundColor: SageColors.sageLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qty: {
    fontSize: 16,
    fontWeight: '600',
    minWidth: 24,
    textAlign: 'center',
    color: SageColors.text,
  },
  remove: {
    marginLeft: 'auto',
    padding: 4,
  },
  summary: {
    marginTop: Spacing.xs,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 15,
    color: SageColors.textMuted,
  },
  summaryValue: {
    fontSize: 15,
    color: SageColors.text,
    fontWeight: '500',
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
    fontSize: 22,
    fontWeight: '700',
    color: SageColors.primaryDark,
  },
  emptyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  emptyIcon: {
    width: 96,
    height: 96,
    borderRadius: Radius.full,
    backgroundColor: SageColors.sageLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: SageColors.text,
  },
  emptyText: {
    fontSize: 15,
    color: SageColors.textMuted,
    textAlign: 'center',
    marginTop: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  shopBtn: {
    width: '100%',
    maxWidth: 280,
  },
});
