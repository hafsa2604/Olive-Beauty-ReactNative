import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { GlassCard } from '@/components/GlassCard';
import { ScreenBackground } from '@/components/ScreenBackground';
import { useApp } from '@/context/AppContext';
import { SageColors, Spacing } from '@/constants/theme';

const STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

export default function ManageOrders() {
  const { orders, users, updateOrderStatus } = useApp();

  return (
    <ScreenBackground nested>
      <FlatList
        data={orders}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <Text style={styles.screenHint}>
            Tap a status below each order to update in real-time: pending → processing → shipped → delivered → cancelled.
          </Text>
        }
        ListEmptyComponent={<Text style={styles.empty}>No orders placed yet in Firebase.</Text>}
        renderItem={({ item }) => {
          // Try to match customer from the users collection in real-time, fallback to stored order details
          const customer = users.find((u) => u.id === item.userId);
          const customerName = customer?.name || item.userName || 'Customer';
          const customerEmail = customer?.email || item.userEmail || '';

          return (
            <GlassCard style={styles.card}>
              <View style={styles.row}>
                <Text style={styles.id}>#{String(item.id).slice(-8).toUpperCase()}</Text>
                <Text style={styles.date}>
                  {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : ''}
                </Text>
              </View>
              <Text style={styles.customer}>{customerName} ({customerEmail})</Text>
              
              {item.contactName || item.contactPhone ? (
                <Text style={styles.contact}>
                  Contact: {item.contactName || customerName}
                  {item.contactPhone ? ` · ${item.contactPhone}` : ''}
                  {item.contactEmail ? ` · ${item.contactEmail}` : ''}
                </Text>
              ) : null}

              {item.shippingAddress ? (
                <Text style={styles.address}>Ship to: {item.shippingAddress}</Text>
              ) : null}

              {item.paymentLabel || item.paymentMethod ? (
                <Text style={styles.payment}>
                  Payment: {item.paymentLabel || item.paymentMethod}
                </Text>
              ) : null}

              <Text style={styles.items}>
                {item.items.map((i) => `${i.name} ×${i.quantity}`).join(', ')}
              </Text>
              <Text style={styles.total}>${Number(item.total).toFixed(2)}</Text>
              <Text style={styles.status}>Status: {item.status}</Text>
              
              <View style={styles.statusRow}>
                {STATUSES.map((status) => (
                  <Pressable
                    key={status}
                    style={[styles.chip, item.status === status && styles.chipActive]}
                    onPress={async () => {
                      try {
                        await updateOrderStatus(item.id, status);
                      } catch (error) {
                        console.error('Failed to update status:', error);
                      }
                    }}>
                    <Text style={[styles.chipText, item.status === status && styles.chipTextActive]}>
                      {status}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </GlassCard>
          );
        }}
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
  date: {
    fontSize: 12,
    color: SageColors.textMuted,
  },
  customer: {
    fontSize: 14,
    color: SageColors.primary,
    fontWeight: '600',
    marginTop: 4,
  },
  contact: {
    fontSize: 12,
    color: SageColors.text,
    marginTop: 4,
  },
  payment: {
    fontSize: 12,
    fontWeight: '600',
    color: SageColors.primaryDark,
    marginTop: 4,
  },
  address: {
    fontSize: 12,
    color: SageColors.textMuted,
    marginTop: 4,
    fontStyle: 'italic',
  },
  items: {
    fontSize: 13,
    color: SageColors.text,
    marginTop: 8,
  },
  total: {
    fontSize: 18,
    fontWeight: '700',
    color: SageColors.accent,
    marginTop: 8,
  },
  status: {
    fontSize: 12,
    color: SageColors.textMuted,
    marginTop: 4,
    textTransform: 'capitalize',
  },
  statusRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: Spacing.sm,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.4)',
    borderWidth: 1,
    borderColor: SageColors.cardBorder,
  },
  chipActive: {
    backgroundColor: SageColors.primary,
    borderColor: SageColors.primary,
  },
  chipText: {
    fontSize: 10,
    fontWeight: '600',
    color: SageColors.text,
    textTransform: 'capitalize',
  },
  chipTextActive: {
    color: SageColors.white,
  },
  empty: {
    textAlign: 'center',
    color: SageColors.white,
    marginTop: 40,
  },
});
