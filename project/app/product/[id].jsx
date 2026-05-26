import { useState } from 'react';
import { Image } from 'expo-image';
import { Stack, useLocalSearchParams } from 'expo-router';
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { AppButton } from '@/components/AppButton';
import { GlassCard } from '@/components/GlassCard';
import { MatchaScreen } from '@/components/MatchaScreen';
import { ProductReviews } from '@/components/ProductReviews';
import { StarRating } from '@/components/StarRating';
import { useApp } from '@/context/AppContext';
import { resolveImage } from '@/constants/images';
import { SageColors, Radius, Shadows, Spacing } from '@/constants/theme';
import { CATEGORY_LABELS } from '@/types';
import { getAvailableStock, normalizeProduct } from '@/lib/product';

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams();
  const { getProduct, getProductRating, addToCart, toggleWishlist, isWishlisted } = useApp();
  const [qty, setQty] = useState(1);
  const product = normalizeProduct(getProduct(id ?? ''));

  if (!product) {
    return (
      <MatchaScreen>
        <View style={styles.center}>
          <Text style={styles.error}>Product not found</Text>
        </View>
      </MatchaScreen>
    );
  }

  const wished = isWishlisted(product.id);
  const benefits = product.benefits ?? [];
  const availableStock = getAvailableStock(product);
  const maxQty = Math.max(1, availableStock);
  const { rating, reviewCount } = getProductRating(product.id);

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: '',
          headerRight: () => (
            <Pressable onPress={() => toggleWishlist(product.id)} hitSlop={12}>
              <Ionicons
                name={wished ? 'heart' : 'heart-outline'}
                size={24}
                color={wished ? SageColors.danger : SageColors.text}
              />
            </Pressable>
          ),
        }}
      />
      <MatchaScreen edges={false}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 96 : 0}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <ScrollView
              style={styles.flex}
              contentContainerStyle={styles.scroll}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag"
              showsVerticalScrollIndicator={false}>
              <View style={[styles.imageWrap, Shadows.card]}>
                <Image source={resolveImage(product.image)} style={styles.image} contentFit="contain" />
              </View>

              <GlassCard style={styles.card}>
            <View style={styles.badgeRow}>
              <Text style={styles.category}>{CATEGORY_LABELS[product.category]}</Text>
              {product.skinType ? (
                <View style={styles.skinBadge}>
                  <Text style={styles.skinBadgeText}>{product.skinType}</Text>
                </View>
              ) : null}
            </View>
            <Text style={styles.name}>{product.name}</Text>
            {product.shortBenefit ? (
              <Text style={styles.shortBenefit}>{product.shortBenefit}</Text>
            ) : null}
            <StarRating rating={rating} reviewCount={reviewCount} />
            <Text style={styles.price}>${product.price.toFixed(2)}</Text>

            <Text style={styles.sectionLabel}>Description</Text>
            <Text style={styles.description}>{product.description}</Text>

            {product.ingredients ? (
              <>
                <Text style={styles.sectionLabel}>Ingredients</Text>
                <Text style={styles.muted}>{product.ingredients}</Text>
              </>
            ) : null}

            {benefits.length > 0 ? (
              <>
                <Text style={styles.sectionLabel}>Benefits</Text>
                {benefits.map((b) => (
                  <View key={b} style={styles.benefitRow}>
                    <Ionicons name="checkmark-circle" size={18} color={SageColors.primary} />
                    <Text style={styles.benefitText}>{b}</Text>
                  </View>
                ))}
              </>
            ) : null}

            <Text style={[styles.stock, !product.inStock && styles.stockOut]}>
              {product.inStock
                ? `In stock (${availableStock} available) · Ships in 2–3 days`
                : 'Out of stock'}
            </Text>

            <View style={styles.qtyRow}>
              <Text style={styles.qtyLabel}>Quantity</Text>
              <View style={styles.qtyControls}>
                <Pressable style={styles.qtyBtn} onPress={() => setQty((q) => Math.max(1, q - 1))}>
                  <Ionicons name="remove" size={20} color={SageColors.primary} />
                </Pressable>
                <Text style={styles.qtyValue}>{qty}</Text>
                <Pressable
                  style={styles.qtyBtn}
                  onPress={() => setQty((q) => Math.min(maxQty, q + 1))}
                  disabled={qty >= maxQty}>
                  <Ionicons
                    name="add"
                    size={20}
                    color={qty >= maxQty ? SageColors.textMuted : SageColors.primary}
                  />
                </Pressable>
              </View>
            </View>

            <AppButton
              title={product.inStock ? 'Add to Cart' : 'Out of Stock'}
              disabled={!product.inStock}
              onPress={() => {
                addToCart(product.id, qty);
                Alert.alert('Added', `${product.name} (${qty}) added to your cart.`);
              }}
            />
          </GlassCard>

              <GlassCard style={styles.reviewsCard}>
                <ProductReviews productId={String(product.id)} productName={product.name} />
              </GlassCard>
            </ScrollView>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </MatchaScreen>
    </>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  scroll: {
    paddingBottom: 120,
  },
  reviewsCard: {
    marginHorizontal: Spacing.md,
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
  },
  imageWrap: {
    margin: Spacing.md,
    borderRadius: Radius.xl,
    overflow: 'hidden',
    backgroundColor: SageColors.white,
    alignItems: 'center',
    justifyContent: 'center',
    height: 320,
    padding: Spacing.md,
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
  },
  card: {
    marginHorizontal: Spacing.md,
    gap: Spacing.sm,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.xs,
  },
  skinBadge: {
    backgroundColor: SageColors.sageLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.sm,
  },
  skinBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: SageColors.primaryDark,
  },
  category: {
    fontSize: 11,
    fontWeight: '700',
    color: SageColors.primary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: SageColors.text,
    letterSpacing: -0.3,
  },
  shortBenefit: {
    fontSize: 15,
    fontWeight: '600',
    color: SageColors.textMuted,
    marginTop: 2,
    lineHeight: 20,
  },
  price: {
    fontSize: 28,
    fontWeight: '700',
    color: SageColors.primaryDark,
    marginVertical: Spacing.xs,
  },
  sectionLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: SageColors.text,
    marginTop: Spacing.sm,
  },
  description: {
    fontSize: 15,
    lineHeight: 23,
    color: SageColors.textMuted,
  },
  muted: {
    fontSize: 14,
    lineHeight: 21,
    color: SageColors.textMuted,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  benefitText: {
    fontSize: 14,
    color: SageColors.text,
    flex: 1,
  },
  stock: {
    fontSize: 13,
    fontWeight: '600',
    color: SageColors.success,
    marginVertical: Spacing.sm,
  },
  stockOut: {
    color: SageColors.danger,
  },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  qtyLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: SageColors.text,
  },
  qtyControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  qtyBtn: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    backgroundColor: SageColors.sageLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyValue: {
    fontSize: 18,
    fontWeight: '700',
    minWidth: 28,
    textAlign: 'center',
    color: SageColors.text,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  error: {
    color: SageColors.textMuted,
    fontSize: 18,
  },
});
