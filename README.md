# SalesSavvy E-Commerce Platform

A production-grade full-stack e-commerce web application featuring a Spring Boot 3 REST API backend and a React 18 + Vite frontend with MySQL persistence and Razorpay payment integration.

---

## 🛠️ Architecture & Tech Stack

- **Backend:** Java 21 / Spring Boot 3.4.1, Spring Data JPA, Hibernate, JJWT (HMAC SHA-512), Razorpay Java SDK, MySQL Connector/J
- **Frontend:** React 18, React Router DOM 6, Vite 6, Lucide Icons
- **Database:** MySQL (`salessavvy`)
- **Payment Gateway:** Razorpay Payment Gateway (Test Mode)

---

## 🚀 Quick Start Guide

### 1. Database Setup
Create a MySQL database named `salessavvy`:
```sql
CREATE DATABASE IF NOT EXISTS salessavvy;
```

### 2. Run Backend (Port 9090)
Navigate to the backend directory and run:
```bash
cd SalesSavvyBackend-main/SalesSavvyBackend-main
mvn spring-boot:run
```
Or with custom environment variables:
```bash
set DB_URL=jdbc:mysql://localhost:3306/salessavvy
set DB_USERNAME=root
set DB_PASSWORD=your_password
mvn spring-boot:run
```

### 3. Run Frontend (Port 5174)
Navigate to the frontend directory and start the Vite dev server:
```bash
cd SalesSavvyFrontEnd-main/SalesSavvyFrontEnd-main
npm install
npm run dev
```
Open `http://localhost:5174` in your browser.

---

## 🛡️ Key Features & Capabilities

### Customer Portal
- **Guest Product Browsing:** Guests can search, filter by category, and view product details without signing in first.
- **Product Details Page:** Dedicated product view (`/product/:id`) with image gallery, live stock status, description, and quantity selector.
- **Cart & IDOR Protection:** Cart operations (`/api/cart/*`) are tied securely to the authenticated session, preventing tampering with other users' carts.
- **Inventory & Stock Decrement:** Stock is verified before creating an order and atomically decremented upon payment confirmation.
- **Checkout & Shipping:** Collects delivery details (recipient name, phone, address, city, postal code) and charges the correct total.
- **Order Tracking:** Track past orders with status badges (`SUCCESS`, `PROCESSING`, `SHIPPED`, `DELIVERED`, `CANCELLED`).

### Admin Console (`/admin` or `/admindashboard`)
- **Product Management:** Add new products with image URLs, inspect entire inventory, and delete items.
- **Order Management:** View all customer orders with shipping addresses, items, and update order statuses in real-time.
- **User Management:** List all registered users, inspect specific user details, and promote/demote roles.
- **Analytics:** Daily, monthly, yearly, and lifetime revenue analytics with category breakdowns.

---

## 📡 REST API Reference

### Public Endpoints
- `POST /api/users/register` - Create customer or admin account
- `POST /api/auth/login` - Authenticate and receive `authToken` cookie
- `GET /api/products` - List products (supports `?category=...` and `?search=...`)
- `GET /api/products/{id}` - Get product details
- `GET /api/categories` - List all product categories

### Customer Protected Endpoints
- `GET /api/auth/me` - Get current authenticated user profile
- `POST /api/auth/logout` - Clear session cookie
- `GET /api/cart/items` - Fetch user's cart
- `GET /api/cart/items/count` - Get cart item count
- `POST /api/cart/add` - Add item (`productId`, `quantity`)
- `PUT /api/cart/update` - Update item quantity
- `DELETE /api/cart/items/{productId}` - Remove item
- `POST /api/payment/create` - Initiate Razorpay order with shipping details
- `POST /api/payment/verify` - Verify Razorpay signature & update inventory
- `GET /api/orders` - View user order history

### Admin Endpoints
- `GET /admin/orders` - View all customer orders
- `PUT /admin/orders/{orderId}/status` - Update order fulfillment status
- `GET /admin/products/all` - List entire inventory
- `POST /admin/products/add` - Add product
- `PUT /admin/products/update` - Update product
- `DELETE /admin/products/{productId}` - Delete product
- `GET /admin/user/all` - List all users
- `GET /admin/user/{userId}` - Inspect user details
- `PUT /admin/user/modify` - Edit user username, email, role
- `GET /admin/business/daily?date=YYYY-MM-DD` - Daily revenue
- `GET /admin/business/monthly?month=M&year=YYYY` - Monthly revenue
- `GET /admin/business/yearly?year=YYYY` - Yearly revenue
- `GET /admin/business/overall` - Lifetime gross revenue
