import { useMemo, useState } from 'react';
import { FlatList, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';

import { CategoryPill } from '@/components/CategoryPill';
import { MatchaScreen } from '@/components/MatchaScreen';
import { ProductCard } from '@/components/ProductCard';
import { useApp } from '@/context/AppContext';
import { SageColors, Spacing } from '@/constants/theme';
import { CATEGORY_LABELS } from '@/types';

const FILTERS = {
  skincare: ['All', 'Serums', 'Cleansers', 'Creams', 'Sunscreen'],
  haircare: ['All', 'Shampoo', 'Conditioner', 'Serum', 'Mask'],
};

const FILTER_MATCH = {
  Serums: 'serum',
  Cleansers: 'cleans',
  Creams: 'cream',
  Sunscreen: 'sunveil',
  Shampoo: 'shampoo',
  Conditioner: 'conditioner',
  Serum: 'serum',
  Mask: 'mask',
};

export default function CategoryScreen() {
  const { category } = useLocalSearchParams();
  const cat = String(category ?? 'skincare');
  const { products, addToCart } = useApp();
  const [filter, setFilter] = useState('All');

  const title = CATEGORY_LABELS[cat] ?? 'Shop';
  const filters = FILTERS[cat] ?? FILTERS.skincare;

  const filtered = useMemo(() => {
    let list = products.filter((p) => p.category === cat);
    if (filter !== 'All') {
      const key = FILTER_MATCH[filter] ?? filter.toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(key));
    }
    return list;
  }, [products, cat, filter]);

  const subtitle =
    cat === 'skincare'
      ? 'Clean formulas for radiant, healthy skin'
      : 'Natural care for silky, strong hair';

  return (
    <>
      <Stack.Screen options={{ title, headerShown: true }} />
      <MatchaScreen edges={false}>
        <View style={styles.wrap}>
          <View style={styles.hero}>
            <Text style={styles.heroTitle}>{title}</Text>
            <Text style={styles.heroSub}>{subtitle}</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pills}>
            {filters.map((f) => (
              <CategoryPill
                key={f}
                category={cat}
                label={f}
                selected={filter === f}
                onPress={() => setFilter(f)}
              />
            ))}
          </ScrollView>
          <FlatList
            data={filtered}
            keyExtractor={(item) => item.id}
            numColumns={2}
            style={styles.listFlex}
            contentContainerStyle={styles.list}
            columnWrapperStyle={styles.row}
            ListEmptyComponent={<Text style={styles.empty}>No products in this filter.</Text>}
            renderItem={({ item }) => (
              <View style={{ flex: 1, maxWidth: '50%' }}>
                <ProductCard product={item} onAddToCart={() => addToCart(item.id)} />
              </View>
            )}
          />
        </View>
      </MatchaScreen>
    </>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
  },
  listFlex: {
    flex: 1,
  },
  hero: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: SageColors.text,
  },
  heroSub: {
    fontSize: 14,
    color: SageColors.textMuted,
    marginTop: 4,
  },
  pills: {
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
    maxHeight: 48,
  },
  list: {
    paddingHorizontal: Spacing.sm,
    paddingBottom: 100,
  },
  row: {
    justifyContent: 'space-between',
  },
  empty: {
    textAlign: 'center',
    color: SageColors.textMuted,
    marginTop: 40,
    fontSize: 16,
  },
});
