import { router } from 'expo-router';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { AppButton } from '@/components/AppButton';
import { GlassCard } from '@/components/GlassCard';
import { ScreenBackground } from '@/components/ScreenBackground';
import { useApp } from '@/context/AppContext';
import { SageColors, Spacing } from '@/constants/theme';
import { CATEGORY_LABELS } from '@/types';
import { appHref } from '@/lib/href';

export default function ManageProducts() {
  const { products, deleteProduct } = useApp();

  const handleDelete = (item) => {
    Alert.alert('Delete Product', `Are you sure you want to permanently delete "${item.name}" from the store catalog?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteProduct(item.id);
            Alert.alert('Deleted', 'Product successfully removed.');
          } catch (error) {
            console.error('Delete failed:', error);
            Alert.alert('Error', 'Failed to delete product. Please try again.');
          }
        },
      },
    ]);
  };

  return (
    <ScreenBackground nested>
      <View style={styles.wrap}>
        <Text style={styles.screenTitle}>Product catalog</Text>
        <Text style={styles.screenHint}>Add new beauty items, edit ingredients, or remove products in real-time.</Text>
        
        <AppButton
          title="+ Add Product"
          onPress={() => router.push(appHref('/(tabs)/admin/product-form'))}
          style={styles.addBtn}
        />
        
        <FlatList
          data={products}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<Text style={styles.empty}>No products available.</Text>}
          renderItem={({ item }) => (
            <GlassCard style={styles.card}>
              <View style={styles.row}>
                <View style={styles.info}>
                  <Text style={styles.name}>{item.name}</Text>
                  <Text style={styles.meta}>
                    {CATEGORY_LABELS[item.category] || item.category} · ${Number(item.price).toFixed(2)}
                  </Text>
                </View>
                <View style={styles.actions}>
                  <Pressable
                    onPress={() =>
                      router.push({
                        pathname: '/(tabs)/admin/product-form',
                        params: { id: item.id },
                      })
                    }>
                    <Ionicons name="create-outline" size={24} color={SageColors.primary} />
                  </Pressable>
                  <Pressable onPress={() => handleDelete(item)}>
                    <Ionicons name="trash-outline" size={24} color={SageColors.danger} />
                  </Pressable>
                </View>
              </View>
            </GlassCard>
          )}
        />
      </View>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, paddingTop: 100 },
  screenTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: SageColors.text,
    marginHorizontal: Spacing.md,
    marginBottom: 8,
  },
  screenHint: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.85)',
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
  },
  addBtn: { marginHorizontal: Spacing.md, marginBottom: Spacing.sm },
  empty: {
    textAlign: 'center',
    color: SageColors.white,
    marginTop: 24,
  },
  list: { padding: Spacing.md, paddingBottom: 100 },
  card: { marginBottom: Spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center' },
  info: { flex: 1 },
  name: { fontSize: 16, fontWeight: '600', color: SageColors.text },
  meta: { fontSize: 13, color: SageColors.textMuted, marginTop: 4 },
  actions: { flexDirection: 'row', gap: 16 },
});
