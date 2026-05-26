import { Platform } from 'react-native';

export const APP_NAME = 'Olive Beauty';

/** Premium sage green palette */
export const SageColors = {
  primary: '#7A9B76',
  primaryDark: '#566659',
  accent: '#A8C4A4',
  sageLight: '#E3E9E3',
  sage: '#9AAD96',
  cream: '#FAF8F4',
  beige: '#F0EBE3',
  white: '#FFFFFF',
  text: '#2A3028',
  textMuted: '#6B7566',
  success: '#5A8F6A',
  warning: '#C4A35A',
  danger: '#C46B6B',
  overlayBase: [42, 48, 40],
  overlay: 'rgba(42, 48, 40, 0.25)',
  card: '#FFFFFF',
  cardBorder: 'rgba(122, 155, 118, 0.18)',
  gradientStart: '#D4E4D0',
  gradientEnd: '#FAF8F4',
  bannerStart: '#7A9B76',
  bannerEnd: '#A8C4A4',
};

export const Colors = {
  light: {
    text: SageColors.text,
    background: SageColors.cream,
    tint: SageColors.primary,
    icon: SageColors.textMuted,
    tabIconDefault: SageColors.textMuted,
    tabIconSelected: SageColors.primary,
  },
  dark: {
    text: '#F4F6F2',
    background: '#1E241C',
    tint: SageColors.sageLight,
    icon: '#9AAD96',
    tabIconDefault: '#9AAD96',
    tabIconSelected: SageColors.sageLight,
  },
};

export const Shadows = {
  card: Platform.select({
    ios: {
      shadowColor: '#2A3028',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
    },
    android: { elevation: 4 },
    default: {
      boxShadow: '0 4px 16px rgba(42, 48, 40, 0.08)',
    },
  }),
  soft: Platform.select({
    ios: {
      shadowColor: '#2A3028',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
    },
    android: { elevation: 2 },
    default: {
      boxShadow: '0 2px 10px rgba(42, 48, 40, 0.06)',
    },
  }),
};

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const Radius = {
  sm: 10,
  md: 14,
  lg: 20,
  xl: 28,
  full: 999,
};
