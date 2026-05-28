import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { router } from 'expo-router';
import { loadJson, saveJson } from '@/lib/storage';

import {
  loginUser,
  signUpUser,
  logoutUser,
  updateUserProfile,
  fetchUserProfile,
  ADMIN_EMAIL,
} from '../src/services/authService';
import {
  fetchProducts,
  addProduct as dbAddProduct,
  updateProduct as dbUpdateProduct,
  deleteProduct as dbDeleteProduct,
} from '../src/services/productService';
import { syncCartToFirestore, fetchCartFromFirestore } from '../src/services/cartService';
import { syncFavoritesToFirestore, fetchFavoritesFromFirestore } from '../src/services/favoriteService';
import { syncRoutinesToFirestore, fetchRoutinesFromFirestore } from '../src/services/routineService';
import {
  fetchReviews,
  addReview as dbAddReview,
  deleteReview as dbDeleteReview,
} from '../src/services/reviewService';
import { computeProductRating, sortReviewsNewest } from '@/lib/reviews';

import { AppContext } from './app-context';
import { appHref } from '@/lib/href';
import { apiClient } from '@/src/services/apiClient';

export function AppProvider({ children }) {
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [routines, setRoutines] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  // Load products & reviews globally
  const loadCatalogData = useCallback(async () => {
    try {
      const [loadedProducts, loadedReviews] = await Promise.all([
        fetchProducts(),
        fetchReviews(),
      ]);
      setProducts(loadedProducts || []);
      setReviews(loadedReviews || []);
    } catch (error) {
      console.error('Error loading product catalog from REST API:', error);
    }
  }, []);

  // Load user-specific data from REST API
  const loadUserData = useCallback(async (userId, role) => {
    if (!userId) return;
    try {
      const isAdmin = role === 'admin';
      
      const [storedCart, storedFavs, storedRoutines, fetchedOrders] = await Promise.all([
        fetchCartFromFirestore(userId),
        fetchFavoritesFromFirestore(userId),
        fetchRoutinesFromFirestore(userId),
        apiClient.get(`/api/orders?userId=${userId}&role=${role}`),
      ]);

      setCart(storedCart || []);
      setWishlist(storedFavs || []);
      setRoutines(storedRoutines || []);
      setOrders(fetchedOrders || []);

      if (isAdmin) {
        const fetchedUsers = await apiClient.get('/api/users');
        setUsers(fetchedUsers || []);
      }
    } catch (error) {
      console.error('Error loading user details from REST API:', error);
    }
  }, []);

  // 1. App Startup: Hydrate session and fetch initial catalog
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Load initial products & reviews
        await loadCatalogData();

        // Hydrate logged-in user session from AsyncStorage
        const savedUser = await loadJson('@olivebeauty/session', null);
        if (savedUser && savedUser.id) {
          setUser(savedUser);
          
          // Verify user session with backend and pull user-specific data
          const freshProfile = await fetchUserProfile(savedUser.id);
          if (freshProfile) {
            setUser(freshProfile);
            await loadUserData(freshProfile.id, freshProfile.role);
          } else {
            // Local session expired or account deleted on backend
            setUser(null);
            await saveJson('@olivebeauty/session', null);
          }
        }
      } catch (err) {
        console.error('Error initializing application state:', err);
      } finally {
        setReady(true);
      }
    };

    initializeApp();
  }, [loadCatalogData, loadUserData]);

  // 2. Global Pull-to-Refresh Handler
  const refreshData = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadCatalogData();
      if (user && user.id) {
        const freshProfile = await fetchUserProfile(user.id);
        if (freshProfile) {
          setUser(freshProfile);
          await loadUserData(freshProfile.id, freshProfile.role);
        }
      }
    } catch (error) {
      console.error('Error refreshing app data:', error);
    } finally {
      setRefreshing(false);
    }
  }, [user, loadCatalogData, loadUserData]);

  // 3. Authentication Operations
  const login = useCallback(async (email, password) => {
    try {
      const profile = await loginUser(email, password);
      setUser(profile);
      // Load user profile specific data immediately
      await loadUserData(profile.id, profile.role);
      return null; // Return null on success (no error)
    } catch (error) {
      let message = 'Invalid email or password';
      if (error.code === 'auth/invalid-email') message = 'Invalid email format';
      if (error.code === 'auth/user-disabled') message = 'This account has been disabled';
      if (error.code === 'auth/admin-password-mismatch') message = error.message;
      if (error.code === 'auth/too-many-requests') {
        message = 'Too many attempts. Please wait a moment and try again.';
      }
      return message;
    }
  }, [loadUserData]);

  const register = useCallback(async (name, email, password) => {
    try {
      const profile = await signUpUser(name, email, password);
      setUser(profile);
      // Load empty cart/wishlist details
      await loadUserData(profile.id, profile.role);
      return null; // Return null on success
    } catch (error) {
      console.error('Registration error:', error);
      let message = 'Registration failed. Please try again.';
      if (error.code === 'auth/email-already-in-use') message = 'An account with this email already exists';
      if (error.code === 'auth/invalid-email') message = 'Invalid email address';
      if (error.code === 'auth/weak-password') message = 'Password must be at least 6 characters';
      if (error.code === 'auth/admin-email-reserved') {
        message = 'This email is for admin sign-in only. Use the login screen.';
      }
      return message;
    }
  }, [loadUserData]);

  const logout = useCallback(async () => {
    try {
      await logoutUser();
      setUser(null);
      setCart([]);
      setWishlist([]);
      setRoutines([]);
      setOrders([]);
      setUsers([]);
    } catch (error) {
      console.error('Logout error:', error);
    }
  }, []);

  const updateProfile = useCallback(
    async (updates) => {
      if (!user) return;
      try {
        const updated = await updateUserProfile(user.id, updates);
        setUser(updated);
      } catch (error) {
        console.error('Update profile error:', error);
        throw error;
      }
    },
    [user]
  );

  // 4. Favorites/Wishlist system (REST synchronized)
  const toggleWishlist = useCallback(
    async (productId) => {
      if (!user) return;
      const nextWishlist = wishlist.includes(productId)
        ? wishlist.filter((id) => id !== productId)
        : [...wishlist, productId];
      
      setWishlist(nextWishlist);
      await syncFavoritesToFirestore(user.id, nextWishlist);
    },
    [user, wishlist]
  );

  const isWishlisted = useCallback(
    (productId) => wishlist.includes(productId),
    [wishlist]
  );

  // 5. Cart system (REST synchronized)
  const addToCart = useCallback(
    async (productId, quantity = 1) => {
      if (!user) return;
      
      let nextCart = [];
      const existing = cart.find((i) => i.productId === productId);
      if (existing) {
        nextCart = cart.map((i) =>
          i.productId === productId ? { ...i, quantity: i.quantity + quantity } : i
        );
      } else {
        nextCart = [...cart, { productId, quantity }];
      }

      setCart(nextCart);
      await syncCartToFirestore(user.id, nextCart);
      router.push(appHref('/(tabs)/cart'));
    },
    [user, cart]
  );

  const removeFromCart = useCallback(
    async (productId) => {
      if (!user) return;
      const nextCart = cart.filter((i) => i.productId !== productId);
      setCart(nextCart);
      await syncCartToFirestore(user.id, nextCart);
    },
    [user, cart]
  );

  const updateCartQuantity = useCallback(
    async (productId, quantity) => {
      if (!user) return;
      let nextCart = [];
      if (quantity <= 0) {
        nextCart = cart.filter((i) => i.productId !== productId);
      } else {
        nextCart = cart.map((i) => (i.productId === productId ? { ...i, quantity } : i));
      }
      setCart(nextCart);
      await syncCartToFirestore(user.id, nextCart);
    },
    [user, cart]
  );

  const clearCart = useCallback(async () => {
    if (!user) return;
    setCart([]);
    await syncCartToFirestore(user.id, []);
  }, [user]);

  const getProduct = useCallback(
    (id) => products.find((p) => String(p.id) === String(id)),
    [products]
  );

  // 6. Orders Placement via API
  const placeOrder = useCallback(
    async (orderDetails) => {
      if (!user || cart.length === 0) return null;

      const items = cart
        .map((item) => {
          const product = products.find((p) => String(p.id) === String(item.productId));
          if (!product) return null;
          return {
            productId: product.id,
            name: product.name,
            price: product.price,
            quantity: item.quantity,
          };
        })
        .filter((i) => i !== null);

      if (items.length === 0) return null;

      const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
      const shipping = orderDetails.shipping ?? 5.99;
      const total = subtotal + shipping;

      const orderData = {
        userId: user.id,
        userEmail: user.email,
        userName: user.name,
        contactName: orderDetails.contactName.trim(),
        contactPhone: orderDetails.contactPhone.trim(),
        contactEmail: orderDetails.contactEmail.trim(),
        items,
        subtotal,
        shipping,
        total,
        status: 'pending',
        paymentMethod: orderDetails.paymentMethod,
        paymentLabel:
          orderDetails.paymentMethod === 'cod'
            ? 'Cash on Delivery'
            : 'Card Payment',
        paymentStatus: orderDetails.paymentStatus || 'pending',
        stripePaymentId: orderDetails.stripePaymentId || null,
        shippingAddress: orderDetails.shippingAddress.trim(),
      };

      try {
        const orderResult = await apiClient.post('/api/orders', orderData);
        
        // Refresh local orders list
        setOrders((prev) => [orderResult, ...prev]);
        await clearCart();
        
        return orderResult;
      } catch (error) {
        console.error('Error placing order via REST API:', error);
        throw error;
      }
    },
    [user, cart, products, clearCart]
  );

  // 7. Admin Operations (CRUD Products via API)
  const addProduct = useCallback(async (productData) => {
    try {
      const newProduct = await dbAddProduct(productData);
      setProducts((prev) => [...prev, newProduct]);
    } catch (error) {
      console.error('Add product API error:', error);
      throw error;
    }
  }, []);

  const updateProduct = useCallback(async (id, updates) => {
    try {
      const updatedProduct = await dbUpdateProduct(id, updates);
      setProducts((prev) =>
        prev.map((p) => (String(p.id) === String(id) ? { ...p, ...updatedProduct } : p))
      );
    } catch (error) {
      console.error('Update product API error:', error);
      throw error;
    }
  }, []);

  const deleteProduct = useCallback(async (id) => {
    try {
      await dbDeleteProduct(id);
      setProducts((prev) => prev.filter((p) => String(p.id) !== String(id)));
      
      // Clean up product from active user cart locally & on server
      setCart((prev) => {
        const next = prev.filter((i) => i.productId !== id);
        if (user) syncCartToFirestore(user.id, next);
        return next;
      });
    } catch (error) {
      console.error('Delete product API error:', error);
      throw error;
    }
  }, [user]);

  const updateOrderStatus = useCallback(async (orderId, status) => {
    try {
      await apiClient.put(`/api/orders/${orderId}/status`, { status });
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status } : o))
      );
    } catch (error) {
      console.error('Update order status API error:', error);
      throw error;
    }
  }, []);

  const deleteUser = useCallback(
    async (userId) => {
      if (userId === user?.id) return; // Prevent deleting oneself
      try {
        await apiClient.delete(`/api/users/${userId}`);
        setUsers((prev) => prev.filter((u) => u.id !== userId));
      } catch (error) {
        console.error('Delete user API error:', error);
        throw error;
      }
    },
    [user]
  );

  // 8. Beauty Routines via API
  const addRoutine = useCallback(
    async (name, steps) => {
      if (!user) return;
      const newRoutine = {
        id: `routine-${Date.now()}`,
        name: name.trim(),
        steps: steps.trim(),
        category: 'skincare',
      };
      const nextRoutines = [...routines, newRoutine];
      setRoutines(nextRoutines);
      await syncRoutinesToFirestore(user.id, nextRoutines);
    },
    [user, routines]
  );

  const deleteRoutine = useCallback(
    async (id) => {
      if (!user) return;
      const nextRoutines = routines.filter((r) => r.id !== id);
      setRoutines(nextRoutines);
      await syncRoutinesToFirestore(user.id, nextRoutines);
    },
    [user, routines]
  );

  const userOrders = useMemo(
    () => (user ? orders.filter((o) => o.userId === user.id) : []),
    [orders, user]
  );

  const getReviewsForProduct = useCallback(
    (productId) =>
      sortReviewsNewest(reviews.filter((r) => String(r.productId) === String(productId))),
    [reviews]
  );

  const getProductRating = useCallback(
    (productId) => {
      const productReviews = reviews.filter((r) => String(r.productId) === String(productId));
      if (productReviews.length > 0) {
        return computeProductRating(productReviews);
      }
      const product = products.find((p) => String(p.id) === String(productId));
      return {
        rating: Number(product?.rating) || 0,
        reviewCount: Number(product?.reviewCount) || 0,
      };
    },
    [reviews, products]
  );

  const addReview = useCallback(
    async ({ productId, rating, comment }) => {
      if (!user) return 'Please sign in to leave a review.';
      if (!comment?.trim()) return 'Please write your review.';
      const ratingNum = Number(rating);
      if (!ratingNum || ratingNum < 1 || ratingNum > 5) return 'Please select a rating from 1 to 5 stars.';

      try {
        const newReview = await dbAddReview({
          productId,
          userId: user.id,
          authorName: user.name || user.email?.split('@')[0] || 'Customer',
          rating: ratingNum,
          comment,
        });

        // Add review locally and update product rating locally
        setReviews((prev) => [newReview, ...prev]);
        await loadCatalogData(); // Fetch refreshed stats from API
        return null;
      } catch (error) {
        console.error('Add review API error:', error);
        return 'Could not post your review. Please try again.';
      }
    },
    [user, loadCatalogData]
  );

  const deleteReview = useCallback(async (reviewId, productId) => {
    try {
      await dbDeleteReview(reviewId, productId);
      setReviews((prev) => prev.filter((r) => r.id !== reviewId));
      await loadCatalogData(); // Fetch refreshed stats from API
    } catch (error) {
      console.error('Delete review API error:', error);
    }
  }, [loadCatalogData]);

  const value = useMemo(
    () => ({
      ready,
      user,
      users,
      products,
      orders,
      cart,
      wishlist,
      routines,
      reviews,
      refreshing,
      refreshData,
      getReviewsForProduct,
      getProductRating,
      addReview,
      deleteReview,
      toggleWishlist,
      isWishlisted,
      login,
      register,
      logout,
      updateProfile,
      addToCart,
      removeFromCart,
      updateCartQuantity,
      clearCart,
      placeOrder,
      getProduct,
      addProduct,
      updateProduct,
      deleteProduct,
      updateOrderStatus,
      deleteUser,
      userOrders,
      addRoutine,
      deleteRoutine,
    }),
    [
      ready,
      user,
      users,
      products,
      orders,
      cart,
      wishlist,
      routines,
      reviews,
      refreshing,
      refreshData,
      getReviewsForProduct,
      getProductRating,
      addReview,
      deleteReview,
      toggleWishlist,
      isWishlisted,
      login,
      register,
      logout,
      updateProfile,
      addToCart,
      removeFromCart,
      updateCartQuantity,
      clearCart,
      placeOrder,
      getProduct,
      addProduct,
      updateProduct,
      deleteProduct,
      updateOrderStatus,
      deleteUser,
      userOrders,
      addRoutine,
      deleteRoutine,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
