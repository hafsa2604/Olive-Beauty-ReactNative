import { useMemo, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { GlassCard } from '@/components/GlassCard';
import { StarRating } from '@/components/StarRating';
import { ScreenBackground } from '@/components/ScreenBackground';
import { useApp } from '@/context/AppContext';
import { SageColors, Spacing } from '@/constants/theme';

function formatReviewDate(iso) {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString();
  } catch {
    return '';
  }
}

export default function ManageReviews() {
  const { reviews, products, deleteReview } = useApp();
  const [filter, setFilter] = useState('all');

  const sortedReviews = useMemo(() => {
    const list = [...reviews];
    if (filter === 'seed') return list.filter((r) => r.isSeed);
    if (filter === 'customer') return list.filter((r) => !r.isSeed);
    return list;
  }, [reviews, filter]);

  const productName = (productId) =>
    products.find((p) => String(p.id) === String(productId))?.name || `Product #${productId}`;

  const handleDelete = (item) => {
    Alert.alert(
      'Delete review',
      `Remove review by ${item.authorName} on ${productName(item.productId)}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteReview(item.id, item.productId);
            } catch (error) {
              console.error('Delete review failed:', error);
              Alert.alert('Error', 'Could not delete this review.');
            }
          },
        },
      ]
    );
  };

  const filters = [
    { id: 'all', label: `All (${reviews.length})` },
    { id: 'seed', label: 'Demo' },
    { id: 'customer', label: 'Customer' },
  ];

  return (
    <ScreenBackground nested>
      <FlatList
        data={sortedReviews}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <>
            <Text style={styles.screenHint}>
              Review all customer feedback and remove inappropriate or duplicate entries.
            </Text>
            <View style={styles.filterRow}>
              {filters.map((f) => (
                <Pressable
                  key={f.id}
                  style={[styles.filterChip, filter === f.id && styles.filterChipActive]}
                  onPress={() => setFilter(f.id)}>
                  <Text style={[styles.filterText, filter === f.id && styles.filterTextActive]}>
                    {f.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </>
        }
        ListEmptyComponent={<Text style={styles.empty}>No reviews yet.</Text>}
        renderItem={({ item }) => (
          <GlassCard style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.product} numberOfLines={1}>
                {productName(item.productId)}
              </Text>
              {item.isSeed ? <Text style={styles.badge}>Demo</Text> : null}
            </View>
            <Text style={styles.author}>{item.authorName}</Text>
            <StarRating rating={item.rating} size={12} />
            <Text style={styles.comment}>{item.comment}</Text>
            <Text style={styles.date}>{formatReviewDate(item.createdAt)}</Text>
            <Pressable style={styles.delete} onPress={() => handleDelete(item)}>
              <Ionicons name="trash-outline" size={22} color={SageColors.danger} />
            </Pressable>
          </GlassCard>
        )}
      />
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  list: {
    padding: Spacing.md,
    paddingTop: 100,
    paddingBottom: 100,
  },
  screenHint: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: Spacing.md,
    lineHeight: 18,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: Spacing.md,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  filterChipActive: {
    backgroundColor: SageColors.white,
  },
  filterText: {
    fontSize: 12,
    fontWeight: '600',
    color: SageColors.white,
  },
  filterTextActive: {
    color: SageColors.primaryDark,
  },
  card: {
    marginBottom: Spacing.sm,
    paddingRight: 48,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  product: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    color: SageColors.primary,
  },
  badge: {
    fontSize: 10,
    fontWeight: '700',
    color: SageColors.primaryDark,
    backgroundColor: SageColors.sageLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    overflow: 'hidden',
  },
  author: {
    fontSize: 15,
    fontWeight: '600',
    color: SageColors.text,
    marginTop: 4,
  },
  comment: {
    fontSize: 14,
    color: SageColors.text,
    marginTop: 6,
    lineHeight: 20,
  },
  date: {
    fontSize: 11,
    color: SageColors.textMuted,
    marginTop: 6,
  },
  delete: {
    position: 'absolute',
    right: Spacing.md,
    top: Spacing.md,
    padding: 4,
  },
  empty: {
    textAlign: 'center',
    color: SageColors.white,
    marginTop: 40,
  },
});
