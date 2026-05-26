import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { appHref } from '@/lib/href';
import { StarRating } from '@/components/StarRating';
import { SageColors, Radius, Shadows, Spacing } from '@/constants/theme';
import { resolveImage } from '@/constants/images';
import { CATEGORY_LABELS } from '@/types';

export function ProductCard({ product, onAddToCart, compact }) {
  return (
    <Link href={appHref(`/product/${product.id}`)} asChild>
      <Pressable style={StyleSheet.flatten([styles.card, Shadows.card, compact && styles.cardCompact])}>
        <View style={[styles.imageContainer, compact && styles.imageContainerCompact]}>
          <Image
            source={resolveImage(product.image)}
            style={styles.image}
            contentFit="cover"
            transition={200}
          />
        </View>
        <View style={styles.body}>
          <View style={styles.headerRow}>
            <Text style={styles.category}>{CATEGORY_LABELS[product.category]}</Text>
            {product.skinType ? (
              <Text style={styles.skinTypeBadge} numberOfLines={1}>
                {product.skinType.replace('Suitable for ', '')}
              </Text>
            ) : null}
          </View>
          
          <View style={styles.infoCol}>
            <Text style={styles.name} numberOfLines={2}>
              {product.name}
            </Text>
            {product.shortBenefit ? (
              <Text style={styles.shortBenefit} numberOfLines={1}>
                {product.shortBenefit}
              </Text>
            ) : null}
          </View>

          <StarRating rating={product.rating} size={10} />

          <View style={styles.footer}>
            <Text style={styles.price}>${product.price.toFixed(2)}</Text>
            {onAddToCart ? (
              <Pressable
                style={styles.addBtn}
                onPress={(e) => {
                  e?.stopPropagation?.();
                  onAddToCart();
                }}>
                <Ionicons name="bag-add-outline" size={16} color={SageColors.white} />
              </Pressable>
            ) : null}
          </View>
        </View>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    height: 380,
    backgroundColor: SageColors.card,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: SageColors.cardBorder,
    overflow: 'hidden',
    margin: Spacing.xs,
  },
  cardCompact: {
    maxWidth: 160,
    height: 290,
  },
  imageContainer: {
    width: '100%',
    height: 220,
    overflow: 'hidden',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageContainerCompact: {
    height: 160,
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  body: {
    padding: Spacing.sm,
    gap: 4,
    flex: 1,
    justifyContent: 'space-between',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 4,
  },
  category: {
    fontSize: 9,
    fontWeight: '700',
    color: SageColors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  skinTypeBadge: {
    fontSize: 8,
    fontWeight: '700',
    color: SageColors.primaryDark,
    backgroundColor: SageColors.sageLight,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: Radius.sm - 4,
    overflow: 'hidden',
  },
  infoCol: {
    gap: 2,
  },
  name: {
    fontSize: 13,
    fontWeight: '600',
    color: SageColors.text,
    lineHeight: 16,
  },
  shortBenefit: {
    fontSize: 11,
    color: SageColors.textMuted,
    lineHeight: 14,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  price: {
    fontSize: 15,
    fontWeight: '700',
    color: SageColors.primaryDark,
  },
  addBtn: {
    backgroundColor: SageColors.primary,
    width: 28,
    height: 28,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
