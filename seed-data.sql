-- SalesSavvy Database Seed Script
-- Run this in your MySQL database: salessavvy

USE salessavvy;

-- 1. Insert Categories
INSERT INTO categories (category_id, category_name) VALUES
(1, 'Shirts'),
(2, 'Pants'),
(3, 'Accessories'),
(4, 'Mobiles'),
(5, 'Mobile Accessories')
ON DUPLICATE KEY UPDATE category_name = VALUES(category_name);

-- 2. Insert Sample Products
INSERT INTO products (product_id, name, description, price, stock, category_id, created_at, updated_at) VALUES
(1, 'Classic Oxford Cotton Shirt', 'Premium 100% breathable cotton shirt, tailored slim fit with button-down collar.', 1499.00, 25, 1, NOW(), NOW()),
(2, 'Casual Linen Summer Shirt', 'Lightweight and airy pure linen casual shirt for maximum warm-weather comfort.', 1899.00, 18, 1, NOW(), NOW()),
(3, 'Slim Fit Stretch Denim Jeans', 'Durable washed indigo denim with flexible stretch fabric for effortless movement.', 2199.00, 30, 2, NOW(), NOW()),
(4, 'Tailored Chino Trousers', 'Versatile flat-front chinos crafted from soft cotton twill with tapered fit.', 1799.00, 20, 2, NOW(), NOW()),
(5, 'Minimalist Leather Chronograph Watch', 'Water-resistant luxury analog watch with genuine Italian leather strap.', 3499.00, 15, 3, NOW(), NOW()),
(6, 'Polarized UV400 Aviator Sunglasses', 'Classic aviator sunglasses with anti-glare polarized protective lenses.', 999.00, 40, 3, NOW(), NOW()),
(7, 'Pro Smartphone 5G 128GB', 'Flagship smartphone featuring 120Hz AMOLED display and triple camera system.', 42999.00, 10, 4, NOW(), NOW()),
(8, 'Ultra Note Smartphone 256GB', 'High-performance phone with stylus pen support and all-day 5000mAh battery life.', 58999.00, 8, 4, NOW(), NOW()),
(9, 'Active Noise Cancelling Wireless Earbuds', 'True wireless earbuds with active noise cancellation and 30-hour battery life.', 2999.00, 50, 5, NOW(), NOW()),
(10, '65W Fast GaN Wall Charger & Braided Cable', 'Ultra-compact USB-C fast charger with durable braided 2m fast-charging cable.', 1299.00, 60, 5, NOW(), NOW())
ON DUPLICATE KEY UPDATE name = VALUES(name), price = VALUES(price), stock = VALUES(stock);

-- 3. Insert Product Images
INSERT INTO productimages (image_id, product_id, image_url) VALUES
(1, 1, 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=600&q=80'),
(2, 2, 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=600&q=80'),
(3, 3, 'https://images.unsplash.com/photo-1542272604-780c96856592?auto=format&fit=crop&w=600&q=80'),
(4, 4, 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=600&q=80'),
(5, 5, 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=600&q=80'),
(6, 6, 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=600&q=80'),
(7, 7, 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80'),
(8, 8, 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=600&q=80'),
(9, 9, 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=600&q=80'),
(10, 10, 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=600&q=80')
ON DUPLICATE KEY UPDATE image_url = VALUES(image_url);

-- 4. Default Admin User (Password: admin123)
-- BCrypt hash for 'admin123': $2a$10$wE47FfL.X2h2yW2eWf3uSuu5xKzIqE3w6K.o0oQhUe2M8d4/9F6V6
INSERT INTO users (user_id, username, email, password, role, created_at, updated_at) VALUES
(1, 'admin', 'admin@salessavvy.com', '$2a$10$wE47FfL.X2h2yW2eWf3uSuu5xKzIqE3w6K.o0oQhUe2M8d4/9F6V6', 'ADMIN', NOW(), NOW())
ON DUPLICATE KEY UPDATE role = 'ADMIN';
