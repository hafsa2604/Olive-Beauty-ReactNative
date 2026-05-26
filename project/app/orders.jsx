import { Stack } from 'expo-router';
import { FlatList, StyleSheet, Text, View } from 'react-native';

import { GlassCard } from '@/components/GlassCard';
import { MatchaScreen } from '@/components/MatchaScreen';
import { useApp } from '@/context/AppContext';
import { SageColors, Spacing } from '@/constants/theme';

function statusStyle(status) {
  const map = {
    pending: styles.status_pending,
    processing: styles.status_processing,
    shipped: styles.status_shipped,
    delivered: styles.status_delivered,
    cancelled: styles.status_cancelled,
  };
  return map[status];
}

export default function OrdersScreen() {
  const { userOrders } = useApp();

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Order History',
          headerTransparent: true,
        }}
      />
      <MatchaScreen edges={false}>
        <FlatList
          data={userOrders}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <Text style={styles.empty}>You have no orders yet.</Text>
          }
          renderItem={({ item }) => (
            <GlassCard style={styles.card}>
              <View style={styles.row}>
                <Text style={styles.id}>#{item.id.slice(-8)}</Text>
                <Text style={[styles.status, statusStyle(item.status)]}>
                  {item.status}
                </Text>
              </View>
              <Text style={styles.date}>{new Date(item.createdAt).toLocaleDateString()}</Text>
              <Text style={styles.items}>
                {item.items.map((i) => `${i.name} ×${i.quantity}`).join(', ')}
              </Text>
              <Text style={styles.total}>${Number(item.total).toFixed(2)}</Text>
              {item.paymentLabel || item.paymentMethod ? (
                <Text style={styles.meta}>
                  Payment: {item.paymentLabel || item.paymentMethod}
                </Text>
              ) : null}
              {item.contactPhone ? (
                <Text style={styles.meta}>Contact: {item.contactName} · {item.contactPhone}</Text>
              ) : null}
              <Text style={styles.address} numberOfLines={2}>
                {item.shippingAddress}
              </Text>
            </GlassCard>
          )}
        />
      </MatchaScreen>
    </>
  );
}

const styles = StyleSheet.create({
  list: {
    padding: Spacing.md,
    paddingTop: 100,
    paddingBottom: 40,
  },
  card: {
    marginBottom: Spacing.md,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  id: {
    fontSize: 16,
    fontWeight: '700',
    color: SageColors.text,
  },
  status: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    overflow: 'hidden',
  },
  status_pending: { backgroundColor: '#FFF3CD', color: '#856404' },
  status_processing: { backgroundColor: '#D1ECF1', color: '#0C5460' },
  status_shipped: { backgroundColor: '#CCE5FF', color: '#004085' },
  status_delivered: { backgroundColor: '#D4EDDA', color: '#155724' },
  status_cancelled: { backgroundColor: '#F8D7DA', color: '#721C24' },
  date: {
    fontSize: 12,
    color: SageColors.textMuted,
    marginTop: 4,
  },
  items: {
    fontSize: 14,
    color: SageColors.text,
    marginTop: 8,
  },
  total: {
    fontSize: 18,
    fontWeight: '700',
    color: SageColors.accent,
    marginTop: 8,
  },
  meta: {
    fontSize: 12,
    color: SageColors.textMuted,
    marginTop: 4,
  },
  address: {
    fontSize: 12,
    color: SageColors.textMuted,
    marginTop: 4,
  },
  empty: {
    textAlign: 'center',
    color: SageColors.textMuted,
    fontSize: 16,
    marginTop: 60,
  },
});
