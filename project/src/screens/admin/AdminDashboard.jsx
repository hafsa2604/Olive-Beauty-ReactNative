import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { GlassCard } from '@/components/GlassCard';
import { MatchaScreen } from '@/components/MatchaScreen';
import { useApp } from '@/context/AppContext';
import { APP_NAME, SageColors, Spacing } from '@/constants/theme';
import { appHref } from '@/lib/href';

const MENU = [
  {
    icon: 'cube-outline',
    label: 'Manage Products',
    subtitle: 'Add, update, and delete products',
    route: '/(tabs)/admin/products',
  },
  {
    icon: 'receipt-outline',
    label: 'Manage Orders',
    subtitle: 'View orders and update status',
    route: '/(tabs)/admin/orders',
  },
  {
    icon: 'people-outline',
    label: 'Manage Users',
    subtitle: 'View and remove customer accounts',
    route: '/(tabs)/admin/users',
  },
  {
    icon: 'chatbubbles-outline',
    label: 'Manage Reviews',
    subtitle: 'View and remove product reviews',
    route: '/(tabs)/admin/reviews',
  },
];

export default function AdminDashboard() {
  const { products, orders, users, reviews } = useApp();
  const customerCount = users.filter((u) => u.role === 'customer').length;

  return (
    <MatchaScreen edges={false}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.heading}>Admin Dashboard</Text>
        <Text style={styles.subheading}>
          Manage the {APP_NAME} store: products, orders, and registered customers in real-time.
        </Text>

        <View style={styles.stats}>
          <GlassCard style={styles.stat}>
            <Text style={styles.statNum}>{products.length}</Text>
            <Text style={styles.statLabel}>Products</Text>
          </GlassCard>
          <GlassCard style={styles.stat}>
            <Text style={styles.statNum}>{orders.length}</Text>
            <Text style={styles.statLabel}>Orders</Text>
          </GlassCard>
          <GlassCard style={styles.stat}>
            <Text style={styles.statNum}>{customerCount}</Text>
            <Text style={styles.statLabel}>Users</Text>
          </GlassCard>
          <GlassCard style={styles.stat}>
            <Text style={styles.statNum}>{reviews.length}</Text>
            <Text style={styles.statLabel}>Reviews</Text>
          </GlassCard>
        </View>

        <GlassCard>
          {MENU.map((item) => (
            <Pressable
              key={item.route}
              style={styles.menuRow}
              onPress={() => router.push(appHref(item.route))}>
              <Ionicons name={item.icon} size={24} color={SageColors.primary} />
              <View style={styles.menuTextWrap}>
                <Text style={styles.menuText}>{item.label}</Text>
                <Text style={styles.menuSub}>{item.subtitle}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={SageColors.textMuted} />
            </Pressable>
          ))}
        </GlassCard>

      </ScrollView>
    </MatchaScreen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    padding: Spacing.md,
    paddingTop: 100,
    paddingBottom: 100,
  },
  heading: {
    fontSize: 26,
    fontWeight: '700',
    color: SageColors.text,
    marginBottom: Spacing.xs,
  },
  subheading: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: Spacing.md,
    lineHeight: 20,
  },
  stats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  stat: {
    flexGrow: 1,
    flexBasis: '22%',
    minWidth: 72,
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  statNum: {
    fontSize: 24,
    fontWeight: '700',
    color: SageColors.primary,
  },
  statLabel: {
    fontSize: 11,
    color: SageColors.textMuted,
    marginTop: 4,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    gap: 12,
  },
  menuTextWrap: {
    flex: 1,
  },
  menuText: {
    fontSize: 16,
    fontWeight: '600',
    color: SageColors.text,
  },
  menuSub: {
    fontSize: 12,
    color: SageColors.textMuted,
    marginTop: 2,
  },
});
