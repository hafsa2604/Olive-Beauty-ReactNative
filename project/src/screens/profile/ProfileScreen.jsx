import { useState } from 'react';
import { router } from 'expo-router';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { AppButton } from '@/components/AppButton';
import { GlassCard } from '@/components/GlassCard';
import { MatchaScreen } from '@/components/MatchaScreen';
import { useApp } from '@/context/AppContext';
import { appHref } from '@/lib/href';
import { SageColors, Radius, Spacing, Shadows } from '@/constants/theme';

function MenuRow({ icon, label, subtitle, onPress, badge }) {
  return (
    <Pressable style={styles.menuRow} onPress={onPress}>
      <View style={styles.menuIcon}>
        <Ionicons name={icon} size={20} color={SageColors.primary} />
      </View>
      <View style={styles.menuText}>
        <Text style={styles.menuLabel}>{label}</Text>
        {subtitle ? <Text style={styles.menuSub}>{subtitle}</Text> : null}
      </View>
      {badge != null ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      ) : null}
      <Ionicons name="chevron-forward" size={18} color={SageColors.textMuted} />
    </Pressable>
  );
}

export default function ProfileScreen() {
  const { user, logout, userOrders, wishlist, routines } = useApp();
  const [supportVisible, setSupportVisible] = useState(false);
  const [faqExpanded, setFaqExpanded] = useState({});

  const handleLogout = () => {
    Alert.alert('Sign out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace(appHref('/(auth)/login'));
        },
      },
    ]);
  };

  const toggleFaq = (index) => {
    setFaqExpanded((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  if (!user) return null;

  return (
    <MatchaScreen edges={false}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Profile Card & Avatar */}
        <GlassCard style={styles.profileCard}>
          <View style={styles.avatarOutline}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user.role === 'admin' ? 'OB' : user.name.charAt(0).toUpperCase()}
              </Text>
            </View>
          </View>
          <Text style={styles.name}>{user.name}</Text>
          <Text style={styles.email}>{user.email}</Text>
          <View style={styles.badgeRow}>
            {user.role === 'admin' ? (
              <View style={styles.adminBadge}>
                <Text style={styles.adminText}>Administrator</Text>
              </View>
            ) : (
              <View style={styles.memberBadge}>
                <Ionicons name="sparkles" size={10} color={SageColors.primaryDark} style={{ marginRight: 4 }} />
                <Text style={styles.memberText}>Olive Member</Text>
              </View>
            )}
          </View>

          {/* User Metrics Counters Bar */}
          <View style={styles.statsRow}>
            <Pressable style={styles.statBox} onPress={() => router.push(appHref('/wishlist'))}>
              <Text style={styles.statNum}>{wishlist.length}</Text>
              <Text style={styles.statLabel}>Favorites</Text>
            </Pressable>
            <View style={styles.statDivider} />
            <Pressable style={styles.statBox} onPress={() => router.push(appHref('/orders'))}>
              <Text style={styles.statNum}>{userOrders.length}</Text>
              <Text style={styles.statLabel}>Orders</Text>
            </Pressable>
            <View style={styles.statDivider} />
            <Pressable style={styles.statBox} onPress={() => router.push(appHref('/beauty-routine'))}>
              <Text style={styles.statNum}>{routines.length}</Text>
              <Text style={styles.statLabel}>Routines</Text>
            </Pressable>
          </View>
        </GlassCard>

        {/* Account Options */}
        <Text style={styles.groupLabel}>Account Details</Text>
        <GlassCard style={styles.card}>
          <MenuRow
            icon="heart-outline"
            label="Wishlist"
            subtitle="Saved favorites synchronized in Firestore"
            badge={wishlist.length || undefined}
            onPress={() => router.push(appHref('/wishlist'))}
          />
          <MenuRow
            icon="receipt-outline"
            label="Order History"
            subtitle={`${userOrders.length} orders in database`}
            onPress={() => router.push(appHref('/orders'))}
          />
          <MenuRow
            icon="sparkles-outline"
            label="Beauty Routines"
            subtitle="Configure formulas & custom routines"
            onPress={() => router.push(appHref('/beauty-routine'))}
          />
          <MenuRow
            icon="person-outline"
            label="Edit Profile"
            subtitle="Change name, phone or address"
            onPress={() => router.push(appHref('/edit-profile'))}
          />
          {user.role === 'admin' ? (
            <MenuRow
              icon="shield-outline"
              label="Admin Dashboard"
              subtitle="Manage store products, orders and users"
              onPress={() => router.push(appHref('/(tabs)/admin'))}
            />
          ) : null}
        </GlassCard>

        {/* Support & Terms Options */}
        <Text style={styles.groupLabel}>Store Info & Help</Text>
        <GlassCard style={styles.card}>
          <MenuRow
            icon="document-text-outline"
            label="Terms & Conditions"
            subtitle="Usage guidelines, disclaimers & returns"
            onPress={() => router.push(appHref('/terms'))}
          />
          <MenuRow
            icon="help-circle-outline"
            label="Help & Support"
            subtitle="Read FAQs & reach customer support"
            onPress={() => setSupportVisible(true)}
          />
        </GlassCard>

        {/* Sign Out Button */}
        <AppButton title="Sign Out" variant="outline" onPress={handleLogout} style={styles.logout} />

        {/* FAQ Support Modal */}
        <Modal
          visible={supportVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setSupportVisible(false)}>
          <View style={styles.modalBg}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>FAQ & Support</Text>
                <Pressable onPress={() => setSupportVisible(false)}>
                  <Ionicons name="close" size={24} color={SageColors.text} />
                </Pressable>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} style={styles.modalScroll}>
                <Text style={styles.faqSectionTitle}>Frequently Asked Questions</Text>

                {[
                  {
                    q: 'How do I track my order?',
                    a: 'Go to Order History on your profile card, choose the order, and you will see its detailed live status (Pending, Dispatched, or Delivered) along with its timestamps.',
                  },
                  {
                    q: 'Can I return a product if it irritates my skin?',
                    a: 'Absolutely! Olive Beauty offers a 30-day sensitive skin guarantee. If any clean formula causes adverse irritation, you can request a 100% full refund through support.',
                  },
                  {
                    q: 'Are Olive Beauty formulas cruelty-free?',
                    a: 'Yes, 100%. Every single product in our catalog uses dermatologically tested, vegan, and certified cruelty-free ingredients without parabens or sulfates.',
                  },
                  {
                    q: 'How are routines generated?',
                    a: 'You can define and save custom routines right from your profile. You can also view structured skincare & haircare guides under our interactive category pages.',
                  },
                ].map((item, index) => (
                  <View key={index} style={styles.faqCard}>
                    <Pressable style={styles.faqQuestionRow} onPress={() => toggleFaq(index)}>
                      <Text style={styles.faqQuestion}>{item.q}</Text>
                      <Ionicons
                        name={faqExpanded[index] ? 'chevron-up' : 'chevron-down'}
                        size={16}
                        color={SageColors.primary}
                      />
                    </Pressable>
                    {faqExpanded[index] ? <Text style={styles.faqAnswer}>{item.a}</Text> : null}
                  </View>
                ))}

                <View style={styles.contactSupportBox}>
                  <Ionicons name="mail-open-outline" size={28} color={SageColors.primaryDark} />
                  <Text style={styles.contactSupportTitle}>Need direct assistance?</Text>
                  <Text style={styles.contactSupportBody}>
                    Our customer care team is available 24/7. Send us an email and we will resolve it in 1 hour.
                  </Text>
                  <AppButton
                    title="Email Support"
                    variant="outline"
                    onPress={() => {
                      Alert.alert('Contact Olive Beauty', 'support@olivebeauty.com');
                    }}
                    style={{ marginTop: Spacing.sm, width: '100%', minHeight: 40, paddingVertical: 10 }}
                  />
                </View>
              </ScrollView>

              <AppButton
                title="Close"
                onPress={() => setSupportVisible(false)}
                style={styles.modalBtn}
              />
            </View>
          </View>
        </Modal>
      </ScrollView>
    </MatchaScreen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    padding: Spacing.md,
    paddingTop: 56,
    paddingBottom: 110,
  },
  profileCard: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
    paddingVertical: Spacing.lg,
  },
  avatarOutline: {
    padding: 3,
    borderRadius: 46,
    borderWidth: 2,
    borderColor: SageColors.accent,
    marginBottom: Spacing.md,
    ...Shadows.soft,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: SageColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '600',
    color: SageColors.white,
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    color: SageColors.text,
  },
  email: {
    fontSize: 14,
    color: SageColors.textMuted,
    marginTop: 4,
  },
  badgeRow: {
    flexDirection: 'row',
    marginTop: Spacing.xs,
  },
  adminBadge: {
    backgroundColor: SageColors.sageLight,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  adminText: {
    color: SageColors.primaryDark,
    fontSize: 12,
    fontWeight: '600',
  },
  memberBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5EC',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: 'rgba(122, 155, 118, 0.15)',
  },
  memberText: {
    color: SageColors.primaryDark,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingTop: Spacing.lg,
    marginTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(122, 155, 118, 0.12)',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statNum: {
    fontSize: 20,
    fontWeight: '700',
    color: SageColors.primaryDark,
  },
  statLabel: {
    fontSize: 12,
    color: SageColors.textMuted,
    marginTop: 2,
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(122, 155, 118, 0.2)',
  },
  groupLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: SageColors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: Spacing.xs,
    marginLeft: 6,
  },
  card: {
    marginBottom: Spacing.md,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.xs,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: Spacing.sm,
    gap: 12,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    backgroundColor: SageColors.sageLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuText: {
    flex: 1,
  },
  menuLabel: {
    fontSize: 15,
    color: SageColors.text,
    fontWeight: '600',
  },
  menuSub: {
    fontSize: 12,
    color: SageColors.textMuted,
    marginTop: 2,
  },
  badge: {
    backgroundColor: SageColors.primary,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
    marginRight: 4,
  },
  badgeText: {
    color: SageColors.white,
    fontSize: 10,
    fontWeight: '700',
  },
  logout: {
    marginTop: Spacing.lg,
    borderColor: SageColors.danger,
  },
  modalBg: {
    flex: 1,
    backgroundColor: 'rgba(42, 48, 40, 0.55)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: SageColors.cream,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    padding: Spacing.md,
    maxHeight: '85%',
    minHeight: '60%',
    ...Shadows.card,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(122, 155, 118, 0.12)',
    marginBottom: Spacing.md,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: SageColors.text,
  },
  modalScroll: {
    flex: 1,
  },
  modalBtn: {
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
  },
  faqSectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: SageColors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: Spacing.sm,
  },
  faqCard: {
    backgroundColor: SageColors.white,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(122, 155, 118, 0.08)',
  },
  faqQuestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  faqQuestion: {
    fontSize: 14,
    fontWeight: '650',
    color: SageColors.text,
    flex: 0.95,
  },
  faqAnswer: {
    fontSize: 12,
    color: SageColors.textMuted,
    lineHeight: 18,
    marginTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: '#F3F6F2',
    paddingTop: Spacing.sm,
  },
  contactSupportBox: {
    alignItems: 'center',
    backgroundColor: SageColors.sageLight,
    padding: Spacing.md,
    borderRadius: Radius.md,
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(122, 155, 118, 0.15)',
  },
  contactSupportTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: SageColors.primaryDark,
    marginTop: Spacing.sm,
  },
  contactSupportBody: {
    fontSize: 12,
    color: SageColors.textMuted,
    textAlign: 'center',
    lineHeight: 17,
    marginTop: 4,
  },
});
