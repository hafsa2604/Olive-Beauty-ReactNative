import { Keyboard, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TouchableWithoutFeedback, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * Scrollable form wrapper: avoids keyboard overlap, dismisses on outside tap,
 * keeps buttons reachable with extra bottom padding (iOS + Android / Expo Go).
 */
export function KeyboardAwareForm({
  children,
  style,
  contentContainerStyle,
  keyboardVerticalOffset,
  extraBottomPadding = 32,
  nested = false,
}) {
  const insets = useSafeAreaInsets();
  const tabBarClearance = nested ? 24 : 100;
  const paddingBottom = insets.bottom + extraBottomPadding + tabBarClearance;

  return (
    <KeyboardAvoidingView
      style={[styles.flex, style]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={
        keyboardVerticalOffset ?? (Platform.OS === 'ios' ? (nested ? 96 : 64) : 0)
      }>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={styles.flex}>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="interactive"
            showsVerticalScrollIndicator={false}
            nestedScrollEnabled
            contentContainerStyle={[styles.content, { paddingBottom }, contentContainerStyle]}>
            {children}
          </ScrollView>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
  },
});
