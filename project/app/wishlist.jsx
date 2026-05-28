import { FlatList, StyleSheet, Text, View } from 'react-native';
import { Stack } from 'expo-router';

import { MatchaScreen } from '@/components/MatchaScreen';
import { ProductCard } from '@/components/ProductCard';
import { useApp } from '@/context/AppContext';
import { SageColors, Spacing } from '@/constants/theme';

export default function WishlistScreen() {
  const { wishlist, products, addToCart } = useApp();
  const items = products.filter((p) => wishlist.includes(p.id));

  return (
    <>
      <Stack.Screen options={{ headerShown: true, title: 'Wishlist' }} />
      <MatchaScreen edges={false}>
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.list}
          columnWrapperStyle={styles.row}
          ListHeaderComponent={
            <Text style={styles.hint}>Products you love, saved for later.</Text>
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>No favorites yet</Text>
              <Text style={styles.emptyText}>Tap the heart on any product to save it here.</Text>
            </View>
          }
          renderItem={({ item }) => (
            <ProductCard product={item} onAddToCart={() => addToCart(item.id)} />
          )}
        />
      </MatchaScreen>
    </>
  );
}

const styles = StyleSheet.create({
  list: {
    padding: Spacing.md,
    paddingBottom: 40,
  },
  row: {
    justifyContent: 'space-between',
  },
  hint: {
    fontSize: 14,
    color: SageColors.textMuted,
    marginBottom: Spacing.md,
  },
  empty: {
    paddingTop: 60,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: SageColors.text,
  },
  emptyText: {
    fontSize: 14,
    color: SageColors.textMuted,
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: Spacing.xl,
  },
});
