import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { router } from 'expo-router';
import { onAuthStateChanged } from 'firebase/auth';
import {
  collection,
  doc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
} from 'firebase/firestore';

import { auth, db } from '../src/services/firebaseConfig';
import {
  loginUser,
  signUpUser,
  logoutUser,
  updateUserProfile,
  fetchUserProfile,
  ADMIN_EMAIL,
} from '../src/services/authService';
import {
  listenToProducts,
  addProduct as dbAddProduct,
  updateProduct as dbUpdateProduct,
  deleteProduct as dbDeleteProduct,
  seedProductsIfEmpty,
} from '../src/services/productService';
import { syncCartToFirestore, fetchCartFromFirestore } from '../src/services/cartService';
import { syncFavoritesToFirestore, fetchFavoritesFromFirestore } from '../src/services/favoriteService';
import { syncRoutinesToFirestore, fetchRoutinesFromFirestore } from '../src/services/routineService';
import {
  listenToReviews,
  seedReviewsForProducts,
  addReview as dbAddReview,
  deleteReview as dbDeleteReview,
  deleteReviewsForProduct,
} from '../src/services/reviewService';
import { computeProductRating, sortReviewsNewest } from '@/lib/reviews';

import { AppContext } from './app-context';
import { appHref } from '@/lib/href';

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

  // 1. One-time seeding of products into Firestore if database is empty
  useEffect(() => {
    seedProductsIfEmpty();
  }, []);

  // 2. Real-time products listener
  useEffect(() => {
    const unsubscribe = listenToProducts(
      (loadedProducts) => {
        setProducts(loadedProducts);
      },
      (error) => console.error('Products listener error:', error)
    );
    return () => unsubscribe();
  }, []);

  // 2b. Real-time reviews listener (all products)
  useEffect(() => {
    const unsubscribe = listenToReviews(
      (loadedReviews) => setReviews(loadedReviews),
      (error) => console.error('Reviews listener error:', error)
    );
    return () => unsubscribe();
  }, []);

  // 2c. Seed 2–3 demo reviews per product (idempotent; runs once per device)
  useEffect(() => {
    if (products.length === 0) return;
    seedReviewsForProducts(products);
  }, [products]);

  // 3. Persistent session listener via Firebase Auth
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          // User is signed in. Fetch detailed profile from Firestore
          const profile = await fetchUserProfile(firebaseUser.uid);
          setUser(profile);

          if (profile) {
            // Load user's cart, wishlist, and routines from Firestore
            const [storedCart, storedFavs, storedRoutines] = await Promise.all([
              fetchCartFromFirestore(firebaseUser.uid),
              fetchFavoritesFromFirestore(firebaseUser.uid),
              fetchRoutinesFromFirestore(firebaseUser.uid),
            ]);
            
            setCart(storedCart);
            setWishlist(storedFavs);
            setRoutines(storedRoutines);
          }
        } else {
          // User is signed out. Clear all states
          setUser(null);
          setCart([]);
          setWishlist([]);
          setRoutines([]);
        }
      } catch (err) {
        console.error('Error loading session profile:', err);
      } finally {
        setReady(true);
      }
    });

    return () => unsubscribe();
  }, []);

  // 4. Real-time Orders and Users listeners depending on authentication state
  useEffect(() => {
    if (!user) {
      setOrders([]);
      setUsers([]);
      return;
    }

    const isAdmin = user.role === 'admin';
    let unsubscribeOrders = () => {};
    let unsubscribeUsers = () => {};

    // Listen to all orders; filter/sort in memory (avoids composite Firestore indexes)
    const ordersCol = collection(db, 'orders');

    unsubscribeOrders = onSnapshot(
      ordersCol,
      (snapshot) => {
        const loadedOrders = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          if (!isAdmin && data.userId !== user.id) return;
          loadedOrders.push({ id: docSnap.id, ...data });
        });
        loadedOrders.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
        setOrders(loadedOrders);
      },
      (err) => {
        if (err?.code === 'failed-precondition') {
          console.warn(
            'Orders listener needs a Firestore index or updated rules. Orders may be empty until fixed.'
          );
        } else {
          console.error('Orders snapshot error:', err);
        }
        setOrders([]);
      }
    );

    // If Admin, listen to all users in real-time
    if (isAdmin) {
      const usersCol = collection(db, 'users');
      unsubscribeUsers = onSnapshot(
        usersCol,
        (snapshot) => {
          const loadedUsers = [];
          snapshot.forEach((doc) => {
            loadedUsers.push({ id: doc.id, ...doc.data() });
          });
          setUsers(loadedUsers);
        },
        (err) => console.error('Users snapshot error:', err)
      );
    }

    return () => {
      unsubscribeOrders();
      unsubscribeUsers();
    };
  }, [user]);

  // 5. Auth operations
  const login = useCallback(async (email, password) => {
    try {
      const profile = await loginUser(email, password);
      setUser(profile);
      return null; // Return null on success (no error)
    } catch (error) {
      let message = 'Invalid email or password';
      if (error.code === 'auth/invalid-email') message = 'Invalid email format';
      if (error.code === 'auth/user-disabled') message = 'This account has been disabled';
      if (error.code === 'auth/admin-password-mismatch') message = error.message;
      if (error.code === 'auth/too-many-requests') {
        message = 'Too many attempts. Please wait a moment and try again.';
      }
      if (__DEV__ && error.code !== 'auth/invalid-credential') {
        console.warn('Login error:', error.code || error.message);
      }
      return message;
    }
  }, []);

  const register = useCallback(async (name, email, password) => {
    try {
      const profile = await signUpUser(name, email, password);
      setUser(profile);
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
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutUser();
      setUser(null);
      setCart([]);
      setWishlist([]);
      setRoutines([]);
    } catch (error) {
      console.error('Logout error:', error);
    }
  }, []);

  const updateProfile = useCallback(
    async (updates) => {
      if (!user) return;
      try {
        await updateUserProfile(user.id, updates);
        // Local state will update via next render, but let's refresh locally immediately for UI snappiness
        setUser((prev) => (prev ? { ...prev, ...updates } : null));
      } catch (error) {
        console.error('Update profile error:', error);
        throw error;
      }
    },
    [user]
  );

  // 6. Favorites/Wishlist system (synchronized in Firestore)
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

  // 7. Cart system (synchronized in Firestore)
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

  // 8. Orders placement
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
        paymentMethod: orderDetails.paymentMethod || 'cod',
        paymentLabel:
          orderDetails.paymentMethod === 'card'
            ? 'Debit / Credit Card'
            : 'Cash on Delivery',
        paymentStatus: orderDetails.paymentStatus || 'pending_cod',
        stripePaymentId: orderDetails.stripePaymentId || null,
        shippingAddress: orderDetails.shippingAddress.trim(),
        createdAt: new Date().toISOString(),
      };

      try {
        const orderRef = await addDoc(collection(db, 'orders'), orderData);
        await clearCart();
        return { id: orderRef.id, ...orderData };
      } catch (error) {
        console.error('Error placing order:', error);
        throw error;
      }
    },
    [user, cart, products, clearCart]
  );

  // 9. Admin operations (CRUD Products)
  const addProduct = useCallback(async (productData) => {
    try {
      await dbAddProduct(productData);
    } catch (error) {
      console.error('Add product error:', error);
      throw error;
    }
  }, []);

  const updateProduct = useCallback(async (id, updates) => {
    try {
      await dbUpdateProduct(id, updates);
    } catch (error) {
      console.error('Update product error:', error);
      throw error;
    }
  }, []);

  const deleteProduct = useCallback(async (id) => {
    try {
      await deleteReviewsForProduct(id);
      await dbDeleteProduct(id);
      // Clean up product from existing user carts if it is deleted from database
      setCart((prev) => {
        const next = prev.filter((i) => i.productId !== id);
        if (user) syncCartToFirestore(user.id, next);
        return next;
      });
    } catch (error) {
      console.error('Delete product error:', error);
      throw error;
    }
  }, [user]);

  const updateOrderStatus = useCallback(async (orderId, status) => {
    try {
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, { status });
    } catch (error) {
      console.error('Update order status error:', error);
      throw error;
    }
  }, []);

  const deleteUser = useCallback(
    async (userId) => {
      if (userId === user?.id) return; // Prevent deleting oneself
      try {
        const userRef = doc(db, 'users', userId);
        await deleteDoc(userRef);
        // Also remove from admins if they are an admin
        const adminRef = doc(db, 'admins', userId);
        await deleteDoc(adminRef).catch(() => {});
      } catch (error) {
        console.error('Delete user error:', error);
        throw error;
      }
    },
    [user]
  );

  // 10. Beauty Routines
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
        await dbAddReview({
          productId,
          userId: user.id,
          authorName: user.name || user.email?.split('@')[0] || 'Customer',
          rating: ratingNum,
          comment,
        });
        return null;
      } catch (error) {
        console.error('Add review error:', error);
        return 'Could not post your review. Please try again.';
      }
    },
    [user]
  );

  const deleteReview = useCallback(async (reviewId, productId) => {
    await dbDeleteReview(reviewId, productId);
  }, []);

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
