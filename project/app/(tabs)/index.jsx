import { useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { CategoryCard } from '@/components/CategoryCard';
import { MatchaScreen } from '@/components/MatchaScreen';
import { ProductCard } from '@/components/ProductCard';
import { PromoBanner } from '@/components/PromoBanner';
import { SectionHeader } from '@/components/SectionHeader';
import { useApp } from '@/context/AppContext';
import { appHref } from '@/lib/href';
import { APP_NAME, SageColors, Radius, Shadows, Spacing } from '@/constants/theme';

export default function HomeScreen() {
  const { products, addToCart, user } = useApp();
  const [search, setSearch] = useState('');

  const trending = useMemo(
    () => [...products].sort((a, b) => b.rating - a.rating).slice(0, 6),
    [products]
  );

  const recommended = useMemo(() => {
    let list = [...products];
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.category.includes(q)
      );
    }
    return list.slice(0, 8);
  }, [products, search]);

  return (
    <MatchaScreen edges={false}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hello, {user?.name?.split(' ')[0] ?? 'there'}</Text>
            <Text style={styles.title}>{APP_NAME}</Text>
          </View>
          <Pressable
            style={[styles.avatar, Shadows.soft]}
            onPress={() => router.push(appHref('/(tabs)/profile'))}>
            <Text style={styles.avatarText}>
              {user?.role === 'admin' ? '0B' : (user?.name?.charAt(0)?.toUpperCase() ?? 'O')}
            </Text>
          </Pressable>
        </View>

        <View style={[styles.searchRow, Shadows.soft]}>
          <Ionicons name="search" size={20} color={SageColors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search serums, cleansers, shampoo..."
            placeholderTextColor={SageColors.textMuted}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        <PromoBanner onPress={() => router.push(appHref('/category/skincare'))} />

        <SectionHeader title="Categories" />
        <View style={styles.categories}>
          <CategoryCard category="skincare" onPress={() => router.push(appHref('/category/skincare'))} />
          <CategoryCard category="haircare" onPress={() => router.push(appHref('/category/haircare'))} />
        </View>

        <SectionHeader
          title="Trending"
          actionLabel="See all"
          onAction={() => router.push(appHref('/category/skincare'))}
        />
        <FlatList
          horizontal
          data={trending}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.hList}
          renderItem={({ item }) => (
            <View style={styles.hCard}>
              <ProductCard product={item} onAddToCart={() => addToCart(item.id)} compact />
            </View>
          )}
        />

        <SectionHeader title="Recommended for You" />
        <View style={styles.grid}>
          {recommended.map((item) => (
            <View key={item.id} style={styles.gridItem}>
              <ProductCard product={item} onAddToCart={() => addToCart(item.id)} />
            </View>
          ))}
        </View>
      </ScrollView>
    </MatchaScreen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingTop: 56,
    paddingHorizontal: Spacing.md,
    paddingBottom: 110,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  greeting: {
    fontSize: 14,
    color: SageColors.textMuted,
    fontWeight: '500',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: SageColors.primaryDark,
    letterSpacing: 0.3,
    marginTop: 2,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: Radius.full,
    backgroundColor: SageColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: SageColors.white,
  },
  avatarText: {
    color: SageColors.white,
    fontSize: 18,
    fontWeight: '600',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: SageColors.white,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: SageColors.cardBorder,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 15,
    color: SageColors.text,
  },
  categories: {
    flexDirection: 'row',
    marginHorizontal: -4,
    marginBottom: Spacing.sm,
  },
  hList: {
    paddingRight: Spacing.md,
    gap: 0,
  },
  hCard: {
    width: 168,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -Spacing.xs,
  },
  gridItem: {
    width: '50%',
  },
});
