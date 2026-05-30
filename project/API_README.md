# Olive Beauty REST API Integration Guide

Welcome to the REST API system of **Olive Beauty**! 

This guide provides simple, step-by-step instructions to get your backend server up and running, connect the React Native mobile app, and test the entire flow using Postman.

---

## 🏗️ Architecture Overview

The system is split into two clean sections:
1. **Express REST Server (`project/server/`)**: Exposes REST endpoints to query Firestore and authenticates users in Firebase on behalf of the client.
2. **React Native Mobile App Client**: Calls the REST server using a central `apiClient` built on standard JavaScript `fetch` with built-in timeouts, retries, and clean logging.

```
+-----------------------------------+
|     React Native Mobile App       |
+-----------------+-----------------+
                  |
                  | [fetch REST requests]
                  v
+-----------------+-----------------+
|     Express.js API Server         |
|         (Port 5000)               |
+-----------------+-----------------+
                  |
                  | [Firebase Web SDK Node.js]
                  v
+-----------------+-----------------+
|   Firebase Auth & Firestore DB    |
+-----------------------------------+
```

---

## ⚡ 1. Starting the Express Backend Server

Follow these steps to run the server on your computer:

### Step 1: Open your terminal and navigate to the server folder
```bash
cd project/server
```

### Step 2: Install dependencies
```bash
npm install
```

### Step 3: Start the server
```bash
npm start
```
*For active development with auto-reloads:*
```bash
npm run dev
```

The server will initialize the Firebase SDK, perform a quick database analysis, and output:
```text
Firebase initialized successfully on backend server.
Olive Beauty REST Backend Server running on port 5000
Products collection already seeded.
```

> [!NOTE]
> **Firestore Auto-Seeding**
> On the very first launch, if your Firestore `products` collection is empty, the Express server will **automatically seed all 41 original products** into your Firestore database with matching categories, pricing, stock levels, and ratings!

---

## 📱 2. Connecting the Mobile App

To support smooth testing on all platforms (iOS simulator, Android emulator, and real hardware), the app automatically handles network routing:

- **iOS Simulator / Web**: Automatically connects to `http://localhost:5000`
- **Android Emulator**: Automatically connects to `http://10.0.2.2:5000` (resolves to host machine)
- **Real Device (iOS/Android)**:
  1. Find your computer's local IP address (e.g. `192.168.1.100` via `ipconfig` on Windows or `ifconfig` on Mac).
  2. Open [apiConfig.js](file:///c:/Users/admin/Downloads/Olive-Beauty-ReactNative-main/Olive%20Beauty/project/src/services/apiConfig.js).
  3. Uncomment the `LOCAL_IP` line and set it to your computer's IP:
     ```javascript
     const LOCAL_IP = '192.168.1.100'; 
     return `http://${LOCAL_IP}:5000`;
     ```

---

## 📮 3. Testing with Postman

We have prepared a complete Postman collection so you can verify and inspect all REST APIs immediately.

### Step 1: Import the collection
1. Open **Postman**.
2. Click **Import** in the top left corner.
3. Choose the [OliveBeauty.postman_collection.json](file:///c:/Users/admin/Downloads/Olive-Beauty-ReactNative-main/Olive%20Beauty/project/OliveBeauty.postman_collection.json) file from this project root folder.

### Step 2: Configure Environment Variables
You can create an Environment or set **Global Variables** in Postman:
- `baseUrl`: `http://localhost:5000` (or `http://<your-local-ip>:5000`)
- `userId`: A valid Firebase User UID (retrieve from Login/Register responses)
- `productId`: A valid product document ID (e.g. `1` or `2`)
- `reviewId`: A valid review document ID (e.g. `seed_1_0`)
- `orderId`: A valid order ID

### 📑 Key Endpoint Categories in the Postman Collection:
- **Authentication**: `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/reset-password`
- **User Profile**: `GET /api/users/:uid`, `PUT /api/users/:uid`, `GET /api/users` (Admin Panel user list)
- **Products Catalog**: `GET /api/products` (Seeds if empty), `GET /api/products/:id`, `POST /api/products` (Admin CRUD)
- **Cart Sync**: `GET /api/cart/:userId`, `POST /api/cart/:userId`
- **Wishlist Sync**: `GET /api/favorites/:userId`, `POST /api/favorites/:userId`
- **Beauty Routines**: `GET /api/routines/:userId`, `POST /api/routines/:userId`
- **Reviews**: `POST /api/reviews` (Automatically re-calculates product rating on posting!), `DELETE /api/reviews/:id`
- **Orders**: `POST /api/orders` (Place order), `GET /api/orders` (View history), `PUT /api/orders/:id/status` (Admin)

---

## 🛠️ Troubleshooting

### 1. Connection Refused / Mobile app doesn't load data
- Make sure the backend server terminal is running and listening on port `5000`.
- If testing on a real phone, ensure your phone and computer are connected to the **same Wi-Fi network**.
- Confirm that your computer's firewall is not blocking incoming requests on port `5000`.

### 2. Admin Authentication Issues
- The default administrator credentials are:
  - **Email**: `admin@olivebeauty.com`
  - **Password**: `admin123`
- If the administrator does not exist in your Firebase Authentication console, the backend will **automatically provision and bootstrap** it for you upon the very first admin login!
