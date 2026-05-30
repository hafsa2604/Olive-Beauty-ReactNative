import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { MatchaScreen } from '@/components/MatchaScreen';
import { GlassCard } from '@/components/GlassCard';
import { SageColors, Radius, Spacing } from '@/constants/theme';

export default function TermsScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Terms & Conditions', headerShown: true }} />
      <MatchaScreen edges={false}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Ionicons name="document-text" size={44} color={SageColors.primary} />
            <Text style={styles.title}>Terms & Conditions</Text>
            <Text style={styles.subtitle}>Last updated: May 2026</Text>
          </View>

          <GlassCard style={styles.card}>
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="cart-outline" size={20} color={SageColors.primaryDark} />
                <Text style={styles.sectionTitle}>1. Orders & Returns</Text>
              </View>
              <Text style={styles.bodyText}>
                All orders are subject to product availability. We offer a 30-day return policy for unused products in their original packaging. If you experience an adverse skin reaction, please contact us for our Sensitive Skin Guarantee refund.
              </Text>
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="flask-outline" size={20} color={SageColors.primaryDark} />
                <Text style={styles.sectionTitle}>2. Product Usage Disclaimer</Text>
              </View>
              <Text style={styles.bodyText}>
                Olive Beauty skincare and haircare formulas are dermatologically tested but should be patch-tested on a small skin area before full usage. Discontinue use immediately if severe redness, burning, or swelling occurs.
              </Text>
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="shield-checkmark-outline" size={20} color={SageColors.primaryDark} />
                <Text style={styles.sectionTitle}>3. Privacy Policy</Text>
              </View>
              <Text style={styles.bodyText}>
                Your routine data, order details, and profile metrics are strictly confidential. We encrypt all customer profile databases and never share skin diagnostics or contact information with third parties.
              </Text>
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="lock-closed-outline" size={20} color={SageColors.primaryDark} />
                <Text style={styles.sectionTitle}>4. Payment Security</Text>
              </View>
              <Text style={styles.bodyText}>
                Olive Beauty currently accepts Cash on Delivery for all orders. Pay securely when your package arrives at your doorstep.
              </Text>
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="airplane-outline" size={20} color={SageColors.primaryDark} />
                <Text style={styles.sectionTitle}>5. Shipping Information</Text>
              </View>
              <Text style={styles.bodyText}>
                Standard shipping takes 2-3 business days. Delivery times may vary during major holidays or promotional events. Free shipping applies to orders over $50.
              </Text>
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="person-outline" size={20} color={SageColors.primaryDark} />
                <Text style={styles.sectionTitle}>6. Account Responsibility</Text>
              </View>
              <Text style={styles.bodyText}>
                Customers are responsible for maintaining the confidentiality of their profile credentials. Olive Beauty reserves the right to terminate accounts that violate terms of purchase.
              </Text>
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="mail-open-outline" size={20} color={SageColors.primaryDark} />
                <Text style={styles.sectionTitle}>7. Contact Support</Text>
              </View>
              <Text style={styles.bodyText}>
                For any questions regarding these terms, product usage, or order inquiries, please reach out to our support team at support@olivebeauty.com. We typically respond within 1 hour.
              </Text>
            </View>
          </GlassCard>
        </ScrollView>
      </MatchaScreen>
    </>
  );
}

const styles = StyleSheet.create({
  scroll: {
    padding: Spacing.md,
    paddingBottom: 60,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
    marginTop: Spacing.sm,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: SageColors.text,
    marginTop: Spacing.xs,
  },
  subtitle: {
    fontSize: 13,
    color: SageColors.textMuted,
    marginTop: 4,
  },
  card: {
    padding: Spacing.md,
  },
  section: {
    marginBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(122, 155, 118, 0.12)',
    paddingBottom: Spacing.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: SageColors.primaryDark,
  },
  bodyText: {
    fontSize: 13,
    lineHeight: 19,
    color: SageColors.textMuted,
    marginLeft: 28,
  },
});
