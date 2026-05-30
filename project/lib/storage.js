import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const KEYS = {
  users: '@olivebeauty/users',
  session: '@olivebeauty/session',
  products: '@olivebeauty/products',
  orders: '@olivebeauty/orders',
  cart: '@olivebeauty/cart',
  wishlist: '@olivebeauty/wishlist',
  routines: '@olivebeauty/routines',
};

function webGetItem(key) {
  if (typeof localStorage === 'undefined') return null;
  return localStorage.getItem(key);
}

function webSetItem(key, value) {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(key, value);
}

async function getItem(key) {
  if (Platform.OS === 'web') {
    return webGetItem(key);
  }
  return AsyncStorage.getItem(key);
}

async function setItem(key, value) {
  if (Platform.OS === 'web') {
    webSetItem(key, value);
    return;
  }
  await AsyncStorage.setItem(key, value);
}

export async function loadJson(key, fallback) {
  try {
    const raw = await getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export async function saveJson(key, value) {
  try {
    await setItem(key, JSON.stringify(value));
  } catch {
    // Avoid crashing the app if persistence is unavailable.
  }
}

export { KEYS };
