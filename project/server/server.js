const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { initializeApp } = require('firebase/app');
const {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} = require('firebase/auth');
const {
  getFirestore,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
} = require('firebase/firestore');
const { getStorage, ref, uploadBytes, getDownloadURL } = require('firebase/storage');

const { INITIAL_PRODUCTS } = require('./seeds');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const uploadsRoot = path.join(__dirname, 'uploads');
const productImagesDir = path.join(uploadsRoot, 'products');

if (!fs.existsSync(productImagesDir)) {
  fs.mkdirSync(productImagesDir, { recursive: true });
}

const storageMulter = multer.diskStorage({
  destination: (req, file, cb) => cb(null, productImagesDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || '').toLowerCase() || '.jpg';
    const safeExt = ['.jpg', '.jpeg', '.png', '.webp'].includes(ext) ? ext : '.jpg';
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2, 10)}${safeExt}`);
  },
});

const upload = multer({
  storage: storageMulter,
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype || !file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed.'));
    }
    cb(null, true);
  },
});

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(uploadsRoot));

// Firebase Configuration (Matching client-side firebaseConfig)
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || "AIzaSyCSRYYJl98Uayw-rB79xYALE2RAJquihak",
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || "olive-beauty-306df.firebaseapp.com",
  projectId: process.env.FIREBASE_PROJECT_ID || "olive-beauty-306df",
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "olive-beauty-306df.firebasestorage.app",
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "381565786814",
  appId: process.env.FIREBASE_APP_ID || "1:381565786814:web:27e71584b96cb30f215cef",
  measurementId: process.env.FIREBASE_MEASUREMENT_ID || "G-JWFH7FXEP3"
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);
const storage = getStorage(firebaseApp);

console.log('Firebase initialized successfully on backend server.');

// Constants matching constants/auth.js
const ADMIN_EMAIL = 'admin@olivebeauty.com';
const ADMIN_PASSWORD = 'admin123';

/**
 * Helper to normalize product stocks
 */
function normalizeProduct(product) {
  if (!product) return product;
  const stock =
    product.stock !== undefined && product.stock !== null && product.stock !== ''
      ? Number(product.stock)
      : null;
  const inStock =
    product.inStock === true || (stock !== null && !Number.isNaN(stock) ? stock > 0 : true);

  return {
    ...product,
    stock: stock !== null && !Number.isNaN(stock) ? stock : inStock ? 50 : 0,
    inStock,
  };
}

/**
 * Seeding Products into Firestore if collection is empty
 */
async function seedProductsIfEmpty() {
  try {
    const querySnapshot = await getDocs(collection(db, 'products'));
    if (querySnapshot.empty) {
      console.log('Firestore products collection is empty on backend. Seeding products...');
      for (const item of INITIAL_PRODUCTS) {
        const payload = {
          name: item.name,
          description: item.description,
          price: Number(item.price) || 0,
          category: item.category || 'skincare',
          skinType: item.skinType || 'Suitable for all skin types',
          hairType: item.hairType || (item.category === 'haircare' ? 'Suitable for all hair types' : 'N/A'),
          ingredients: item.ingredients || 'Natural botanical extracts',
          usageInstructions: item.usageInstructions || 'Apply gently onto clean skin or hair.',
          rating: Number(item.rating) || 4.5,
          stock: Number(item.stock) || 50,
          inStock: true,
          image: item.image || '',
          createdAt: new Date().toISOString(),
        };
        const docRef = doc(db, 'products', String(item.id));
        await setDoc(docRef, payload);
      }
      console.log(`Successfully seeded ${INITIAL_PRODUCTS.length} products into Firestore!`);
    } else {
      console.log('Products collection already seeded.');
    }
  } catch (error) {
    console.error('Failed to seed products into Firestore from server:', error);
  }
}

// Run product seed check on startup
seedProductsIfEmpty();

/**
 * ----------------------------------------
 * 1. AUTHENTICATION ENDPOINTS
 * ----------------------------------------
 */

/**
 * Helper to fetch a user profile from Firestore or provision a default one
 */
async function ensureUserProfile(uid, email) {
  const userRef = doc(db, 'users', uid);
  const snap = await getDoc(userRef);
  if (snap.exists()) return snap.data();

  const isEmailAdmin = email === ADMIN_EMAIL;
  const defaultProfile = {
    id: uid,
    name: isEmailAdmin ? 'Olive Beauty Admin' : email.split('@')[0],
    email: email,
    role: isEmailAdmin ? 'admin' : 'customer',
    phone: isEmailAdmin ? '+1 555 0100' : '',
    address: isEmailAdmin ? '1 Olive Lane, NY' : '',
    createdAt: new Date().toISOString(),
  };

  await setDoc(userRef, defaultProfile);
  if (isEmailAdmin) {
    await setDoc(doc(db, 'admins', uid), {
      id: uid,
      email: ADMIN_EMAIL,
      role: 'admin',
      createdAt: defaultProfile.createdAt,
    }).catch(() => {});
  }
  return defaultProfile;
}

/**
 * Helper to provision Admin account in Auth & Firestore
 */
async function provisionAdminAccount() {
  const adminCred = await createUserWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASSWORD);
  const uid = adminCred.user.uid;
  const adminProfile = {
    id: uid,
    name: 'Olive Beauty Admin',
    email: ADMIN_EMAIL,
    role: 'admin',
    phone: '+1 555 0100',
    address: '1 Olive Lane, NY',
    createdAt: new Date().toISOString(),
  };
  await setDoc(doc(db, 'users', uid), adminProfile);
  await setDoc(doc(db, 'admins', uid), {
    id: uid,
    email: ADMIN_EMAIL,
    role: 'admin',
    createdAt: adminProfile.createdAt,
  });
  return adminProfile;
}

// User Signup / Register
app.post('/api/auth/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  if (normalizedEmail === ADMIN_EMAIL) {
    return res.status(400).json({
      error: 'This email is reserved for admin access. Sign in from the login screen instead.',
      code: 'auth/admin-email-reserved'
    });
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, normalizedEmail, password.trim());
    const uid = userCredential.user.uid;

    const userData = {
      id: uid,
      name: name.trim(),
      email: normalizedEmail,
      role: 'customer',
      phone: '',
      address: '',
      createdAt: new Date().toISOString(),
    };

    await setDoc(doc(db, 'users', uid), userData);
    res.status(201).json(userData);
  } catch (error) {
    console.error('Registration API Error:', error);
    res.status(500).json({ error: error.message, code: error.code });
  }
});

// User Login
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const normalizedPassword = password.trim();
  const isAdminLogin = normalizedEmail === ADMIN_EMAIL && normalizedPassword === ADMIN_PASSWORD;

  try {
    if (isAdminLogin) {
      try {
        const userCredential = await signInWithEmailAndPassword(auth, normalizedEmail, normalizedPassword);
        const profile = await ensureUserProfile(userCredential.user.uid, normalizedEmail);
        return res.status(200).json(profile);
      } catch (signInError) {
        const canBootstrap =
          signInError.code === 'auth/user-not-found' ||
          signInError.code === 'auth/invalid-credential' ||
          signInError.code === 'auth/wrong-password' ||
          signInError.code === 'auth/configuration-not-found';

        if (!canBootstrap) throw signInError;

        try {
          // Provision admin account if it does not exist
          const adminProfile = await provisionAdminAccount();
          return res.status(200).json(adminProfile);
        } catch (provisionError) {
          if (provisionError.code === 'auth/email-already-in-use') {
            return res.status(400).json({
              error: 'Admin account exists with a different password. Please contact the administrator.',
              code: 'auth/admin-password-mismatch'
            });
          }
          throw provisionError;
        }
      }
    }

    const userCredential = await signInWithEmailAndPassword(auth, normalizedEmail, normalizedPassword);
    const profile = await ensureUserProfile(userCredential.user.uid, normalizedEmail);
    res.status(200).json(profile);
  } catch (error) {
    console.error('Login API Error:', error);
    res.status(401).json({ error: error.message, code: error.code });
  }
});

// Password Reset Email
app.post('/api/auth/reset-password', async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    await sendPasswordResetEmail(auth, email.trim().toLowerCase());
    res.status(200).json({ message: 'Password reset email sent' });
  } catch (error) {
    console.error('Reset Password API Error:', error);
    res.status(500).json({ error: error.message, code: error.code });
  }
});

/**
 * ----------------------------------------
 * 2. USER PROFILE ENDPOINTS
 * ----------------------------------------
 */

// Fetch All Users (Admin)
app.get('/api/users', async (req, res) => {
  try {
    const querySnapshot = await getDocs(collection(db, 'users'));
    const users = [];
    querySnapshot.forEach((docSnap) => {
      users.push({ id: docSnap.id, ...docSnap.data() });
    });
    res.status(200).json(users);
  } catch (error) {
    console.error('Fetch All Users Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Fetch User Profile
app.get('/api/users/:uid', async (req, res) => {
  const { uid } = req.params;
  try {
    const userRef = doc(db, 'users', uid);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      res.status(200).json(snap.data());
    } else {
      res.status(404).json({ error: 'User profile not found' });
    }
  } catch (error) {
    console.error('Fetch User Profile Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update User Profile
app.put('/api/users/:uid', async (req, res) => {
  const { uid } = req.params;
  const updates = req.body;
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, updates);

    // Sync admin roles if needed
    const snap = await getDoc(userRef);
    if (snap.exists() && snap.data().role === 'admin') {
      await updateDoc(doc(db, 'admins', uid), {
        email: snap.data().email,
        ...updates,
      }).catch(() => {});
    }

    const updatedProfile = snap.exists() ? snap.data() : { id: uid, ...updates };
    res.status(200).json(updatedProfile);
  } catch (error) {
    console.error('Update User Profile Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete User Profile (Admin)
app.delete('/api/users/:uid', async (req, res) => {
  const { uid } = req.params;
  try {
    const userRef = doc(db, 'users', uid);
    await deleteDoc(userRef);

    // Delete admin record
    await deleteDoc(doc(db, 'admins', uid)).catch(() => {});
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete User Profile Error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * ----------------------------------------
 * 3. UPLOAD ENDPOINTS
 * ----------------------------------------
 */

app.post('/api/uploads/product-image', upload.single('image'), async (req, res) => {
  const localFilePath = req.file?.path;
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Image file is required.' });
    }

    const fileBuffer = fs.readFileSync(localFilePath);
    
    // Create a unique filename under products/ folder
    const ext = path.extname(req.file.originalname || '').toLowerCase() || '.jpg';
    const filename = `products/${Date.now()}-${Math.random().toString(36).slice(2, 10)}${ext}`;
    
    console.log(`Uploading file ${filename} to Firebase Storage...`);
    const storageRef = ref(storage, filename);
    
    // Upload the file buffer to Firebase Storage
    await uploadBytes(storageRef, fileBuffer, {
      contentType: req.file.mimetype || 'image/jpeg'
    });
    
    // Fetch secure public download URL
    const downloadUrl = await getDownloadURL(storageRef);
    console.log('Firebase Storage Upload Success:', downloadUrl);
    
    // Clean up local temp file since upload succeeded
    if (localFilePath && fs.existsSync(localFilePath)) {
      try {
        fs.unlinkSync(localFilePath);
      } catch (unlinkErr) {
        console.warn('Failed to delete temp file:', unlinkErr.message);
      }
    }

    res.status(201).json({ imageUrl: downloadUrl });
  } catch (error) {
    console.error('Product image upload to Firebase Storage failed:', error.message);
    console.log('Falling back to local Express server storage...');

    if (!req.file) {
      return res.status(400).json({ error: 'Image file is required.' });
    }

    // Construct local host URL (accessible to physical devices on the same Wi-Fi)
    const localUrl = `${req.protocol}://${req.get('host')}/uploads/products/${req.file.filename}`;
    console.log('Local fallback URL constructed:', localUrl);

    // Return the local fallback image URL. Do NOT unlink the file.
    res.status(201).json({ 
      imageUrl: localUrl,
      warning: 'Uploaded to local backend storage fallback as Firebase Storage is not enabled or accessible.'
    });
  }
});

/**
 * ----------------------------------------
 * 4. PRODUCT ENDPOINTS
 * ----------------------------------------
 */

// Fetch All Products
app.get('/api/products', async (req, res) => {
  try {
    const querySnapshot = await getDocs(collection(db, 'products'));
    const products = [];
    querySnapshot.forEach((docSnap) => {
      products.push(normalizeProduct({ id: docSnap.id, ...docSnap.data() }));
    });
    res.status(200).json(products);
  } catch (error) {
    console.error('Fetch Products Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Fetch Single Product Details
app.get('/api/products/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const docRef = doc(db, 'products', id);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      res.status(200).json(normalizeProduct({ id: snap.id, ...snap.data() }));
    } else {
      res.status(404).json({ error: 'Product not found' });
    }
  } catch (error) {
    console.error('Fetch Single Product Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Add Product (Admin)
app.post('/api/products', async (req, res) => {
  const productData = req.body;
  try {
    const colRef = collection(db, 'products');
    const payload = {
      name: productData.name || '',
      description: productData.description || '',
      price: parseFloat(productData.price) || 0,
      category: productData.category || 'skincare',
      skinType: productData.skinType || 'Suitable for all skin types',
      hairType: productData.hairType || (productData.category === 'haircare' ? 'Suitable for all hair types' : 'N/A'),
      ingredients: productData.ingredients || 'Natural botanical extracts',
      usageInstructions: productData.usageInstructions || 'Apply gently onto clean skin or hair.',
      rating: parseFloat(productData.rating) || 4.5,
      stock: parseInt(productData.stock, 10) || 50,
      inStock: (parseInt(productData.stock, 10) || 50) > 0,
      image: productData.image || '',
      createdAt: new Date().toISOString(),
    };

    const docRef = await addDoc(colRef, payload);
    res.status(201).json({ id: docRef.id, ...payload });
  } catch (error) {
    console.error('Add Product Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update Product (Admin)
app.put('/api/products/:id', async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  try {
    const docRef = doc(db, 'products', id);
    const payload = { ...updates };
    if (payload.price !== undefined) payload.price = parseFloat(payload.price);
    if (payload.rating !== undefined) payload.rating = parseFloat(payload.rating);
    if (payload.stock !== undefined) {
      payload.stock = parseInt(payload.stock, 10);
      payload.inStock = payload.stock > 0;
    }

    await updateDoc(docRef, payload);
    res.status(200).json({ id, ...payload });
  } catch (error) {
    console.error('Update Product Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete Product (Admin)
app.delete('/api/products/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const docRef = doc(db, 'products', id);
    await deleteDoc(docRef);
    res.status(200).json({ id, message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete Product Error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * ----------------------------------------
 * 5. CART ENDPOINTS
 * ----------------------------------------
 */

// Fetch User Cart
app.get('/api/cart/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const cartRef = doc(db, 'cart', userId);
    const snap = await getDoc(cartRef);
    if (snap.exists()) {
      res.status(200).json(snap.data().items || []);
    } else {
      res.status(200).json([]);
    }
  } catch (error) {
    console.error('Fetch Cart Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Sync/Save User Cart
app.post('/api/cart/:userId', async (req, res) => {
  const { userId } = req.params;
  const { items } = req.body;
  if (!items || !Array.isArray(items)) {
    return res.status(400).json({ error: 'Items array is required' });
  }

  try {
    const cartRef = doc(db, 'cart', userId);
    const payload = {
      userId,
      items: items.map((item) => ({
        productId: String(item.productId),
        quantity: parseInt(item.quantity) || 1,
      })),
      updatedAt: new Date().toISOString(),
    };
    await setDoc(cartRef, payload);
    res.status(200).json(payload.items);
  } catch (error) {
    console.error('Sync Cart Error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * ----------------------------------------
 * 6. WISHLIST / FAVORITES ENDPOINTS
 * ----------------------------------------
 */

// Fetch User Wishlist
app.get('/api/favorites/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const favRef = doc(db, 'favorites', userId);
    const snap = await getDoc(favRef);
    if (snap.exists()) {
      res.status(200).json(snap.data().items || []);
    } else {
      res.status(200).json([]);
    }
  } catch (error) {
    console.error('Fetch Favorites Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Sync/Save User Wishlist
app.post('/api/favorites/:userId', async (req, res) => {
  const { userId } = req.params;
  const { items } = req.body;
  if (!items || !Array.isArray(items)) {
    return res.status(400).json({ error: 'Items array is required' });
  }

  try {
    const favRef = doc(db, 'favorites', userId);
    const payload = {
      userId,
      items: items.map(String),
      updatedAt: new Date().toISOString(),
    };
    await setDoc(favRef, payload);
    res.status(200).json(payload.items);
  } catch (error) {
    console.error('Sync Favorites Error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * ----------------------------------------
 * 7. ROUTINES ENDPOINTS
 * ----------------------------------------
 */

// Fetch User Routines
app.get('/api/routines/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const routineRef = doc(db, 'routines', userId);
    const snap = await getDoc(routineRef);
    if (snap.exists() && snap.data().items) {
      res.status(200).json(snap.data().items);
    } else {
      // Default fallback routines
      const DEFAULT_ROUTINES = [
        { id: 'r1', name: 'Morning Glow', steps: 'Cleanser → Serum → SPF', category: 'skincare' },
        { id: 'r2', name: 'Night Repair', steps: 'Double cleanse → Night cream', category: 'skincare' },
      ];
      res.status(200).json(DEFAULT_ROUTINES);
    }
  } catch (error) {
    console.error('Fetch Routines Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Sync/Save User Routines
app.post('/api/routines/:userId', async (req, res) => {
  const { userId } = req.params;
  const { routines } = req.body;
  if (!routines || !Array.isArray(routines)) {
    return res.status(400).json({ error: 'Routines array is required' });
  }

  try {
    const routineRef = doc(db, 'routines', userId);
    const payload = {
      userId,
      items: routines.map((r) => ({
        id: String(r.id),
        name: r.name.trim(),
        steps: r.steps.trim(),
        category: r.category || 'skincare',
      })),
      updatedAt: new Date().toISOString(),
    };
    await setDoc(routineRef, payload);
    res.status(200).json(payload.items);
  } catch (error) {
    console.error('Sync Routines Error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * ----------------------------------------
 * 8. REVIEWS ENDPOINTS
 * ----------------------------------------
 */

// Fetch All Reviews
app.get('/api/reviews', async (req, res) => {
  try {
    const querySnapshot = await getDocs(collection(db, 'reviews'));
    const reviews = [];
    querySnapshot.forEach((docSnap) => {
      reviews.push({ id: docSnap.id, ...docSnap.data() });
    });
    reviews.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
    res.status(200).json(reviews);
  } catch (error) {
    console.error('Fetch Reviews Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Add Review
app.post('/api/reviews', async (req, res) => {
  const { productId, userId, authorName, rating, comment } = req.body;
  if (!productId || !authorName || !rating || !comment) {
    return res.status(400).json({ error: 'ProductId, authorName, rating, and comment are required' });
  }

  try {
    const payload = {
      productId: String(productId),
      userId: userId || null,
      authorName: authorName.trim(),
      rating: Number(rating),
      comment: comment.trim(),
      isSeed: false,
      createdAt: new Date().toISOString(),
    };

    const docRef = await addDoc(collection(db, 'reviews'), payload);
    
    // Compute and sync product rating
    try {
      const pid = String(productId);
      const q = query(collection(db, 'reviews'), where('productId', '==', pid));
      const snapshot = await getDocs(q);
      const reviews = [];
      snapshot.forEach((snap) => reviews.push(snap.data()));
      
      const total = reviews.reduce((sum, r) => sum + Number(r.rating || 0), 0);
      const count = reviews.length;
      const averageRating = count > 0 ? parseFloat((total / count).toFixed(1)) : 4.5;
      
      await updateDoc(doc(db, 'products', pid), { rating: averageRating, reviewCount: count });
    } catch (e) {
      console.warn('Error updating product rating on backend:', e.message);
    }

    res.status(201).json({ id: docRef.id, ...payload });
  } catch (error) {
    console.error('Add Review Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete Review
app.delete('/api/reviews/:id', async (req, res) => {
  const { id } = req.params;
  const { productId } = req.query;
  try {
    await deleteDoc(doc(db, 'reviews', id));
    
    if (productId) {
      // Re-compute and sync product rating
      try {
        const pid = String(productId);
        const q = query(collection(db, 'reviews'), where('productId', '==', pid));
        const snapshot = await getDocs(q);
        const reviews = [];
        snapshot.forEach((snap) => reviews.push(snap.data()));
        
        const total = reviews.reduce((sum, r) => sum + Number(r.rating || 0), 0);
        const count = reviews.length;
        const averageRating = count > 0 ? parseFloat((total / count).toFixed(1)) : 4.5;
        
        await updateDoc(doc(db, 'products', pid), { rating: averageRating, reviewCount: count });
      } catch (e) {
        console.warn('Error re-calculating product rating on backend review deletion:', e.message);
      }
    }

    res.status(200).json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Delete Review Error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * ----------------------------------------
 * 9. ORDERS ENDPOINTS
 * ----------------------------------------
 */

// Fetch All Orders
app.get('/api/orders', async (req, res) => {
  const { userId, role } = req.query;
  try {
    const querySnapshot = await getDocs(collection(db, 'orders'));
    const orders = [];
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      // If user is not admin, filter by their own userId
      if (role !== 'admin' && userId && data.userId !== userId) return;
      orders.push({ id: docSnap.id, ...data });
    });
    orders.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
    res.status(200).json(orders);
  } catch (error) {
    console.error('Fetch Orders Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Place/Add Order
app.post('/api/orders', async (req, res) => {
  const orderData = req.body;
  if (!orderData.userId || !orderData.items || !Array.isArray(orderData.items)) {
    return res.status(400).json({ error: 'UserId and items array are required' });
  }

  try {
    const payload = {
      userId: orderData.userId,
      userEmail: orderData.userEmail || '',
      userName: orderData.userName || '',
      contactName: orderData.contactName ? orderData.contactName.trim() : '',
      contactPhone: orderData.contactPhone ? orderData.contactPhone.trim() : '',
      contactEmail: orderData.contactEmail ? orderData.contactEmail.trim() : '',
      items: orderData.items,
      subtotal: parseFloat(orderData.subtotal) || 0,
      shipping: parseFloat(orderData.shipping) || 5.99,
      total: parseFloat(orderData.total) || 0,
      status: orderData.status || 'pending',
      paymentMethod: orderData.paymentMethod || 'cod',
      paymentLabel: orderData.paymentLabel || 'Cash on Delivery',
      paymentStatus: orderData.paymentStatus || 'pending_cod',
      shippingAddress: orderData.shippingAddress ? orderData.shippingAddress.trim() : '',
      createdAt: new Date().toISOString(),
    };

    const docRef = await addDoc(collection(db, 'orders'), payload);
    res.status(201).json({ id: docRef.id, ...payload });
  } catch (error) {
    console.error('Place Order Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update Order Status (Admin)
app.put('/api/orders/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  if (!status) {
    return res.status(400).json({ error: 'Status is required' });
  }

  try {
    const orderRef = doc(db, 'orders', id);
    await updateDoc(orderRef, { status });
    res.status(200).json({ id, status });
  } catch (error) {
    console.error('Update Order Status Error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.use((err, req, res, next) => {
  if (!err) return next();
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: err.message });
  }
  if (err.message === 'Only image files are allowed.') {
    return res.status(400).json({ error: err.message });
  }
  console.error('Unhandled server error:', err);
  return res.status(500).json({ error: 'Server error' });
});

// Start Server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Olive Beauty REST Backend Server running on all interfaces (port ${PORT})`);
});
