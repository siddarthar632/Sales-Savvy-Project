package com.example.demo.config;

import com.example.demo.entity.*;
import com.example.demo.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Component
public class DataInitializer implements CommandLineRunner {

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final ProductImageRepository productImageRepository;
    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public DataInitializer(CategoryRepository categoryRepository,
                           ProductRepository productRepository,
                           ProductImageRepository productImageRepository,
                           UserRepository userRepository) {
        this.categoryRepository = categoryRepository;
        this.productRepository = productRepository;
        this.productImageRepository = productImageRepository;
        this.userRepository = userRepository;
    }

    @Override
    public void run(String... args) {
        try {
            seedAdminUser();
        } catch (Exception e) {
            System.err.println(">>> [DataInitializer] Note on Admin seeding: " + e.getMessage());
        }

        try {
            seedCategoriesAndProducts();
        } catch (Exception e) {
            System.err.println(">>> [DataInitializer] Note on Catalog seeding: " + e.getMessage());
        }
    }

    private void seedAdminUser() {
        if (userRepository.findByUsername("admin").isEmpty()) {
            User admin = new User();
            admin.setUsername("admin");
            admin.setEmail("admin@salessavvy.com");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setRole(Role.ADMIN);
            admin.setCreatedAt(LocalDateTime.now());
            admin.setUpdatedAt(LocalDateTime.now());
            userRepository.save(admin);
            System.out.println(">>> [DataInitializer] Default Admin user created: username='admin', password='admin123'");
        }
    }

    private void seedCategoriesAndProducts() {
        // 1. Ensure categories exist
        String[] categoryNames = {"Shirts", "Pants", "Accessories", "Mobiles", "Mobile Accessories"};
        Map<String, Category> categoryMap = new HashMap<>();

        for (String catName : categoryNames) {
            Category category = categoryRepository.findByCategoryName(catName)
                    .orElseGet(() -> categoryRepository.save(new Category(catName)));
            categoryMap.put(catName, category);
        }

        // 2. Only seed products if the table is empty
        if (productRepository.count() == 0) {
            System.out.println(">>> [DataInitializer] No products found in database. Seeding initial catalog...");

            // Shirts
            createProduct("Classic Oxford Cotton Shirt",
                    "Premium 100% breathable cotton shirt, tailored slim fit with button-down collar. Perfect for formal and casual occasions.",
                    1499.00, 25, categoryMap.get("Shirts"),
                    "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=600&q=80");

            createProduct("Casual Linen Summer Shirt",
                    "Lightweight and airy pure linen casual shirt for maximum warm-weather style and breathability.",
                    1899.00, 18, categoryMap.get("Shirts"),
                    "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=600&q=80");

            // Pants
            createProduct("Slim Fit Stretch Denim Jeans",
                    "Durable washed indigo denim with flexible stretch fabric for effortless movement and all-day comfort.",
                    2199.00, 30, categoryMap.get("Pants"),
                    "https://images.unsplash.com/photo-1542272604-780c96856592?auto=format&fit=crop&w=600&q=80");

            createProduct("Tailored Chino Trousers",
                    "Versatile flat-front chinos crafted from soft cotton twill with comfortable modern tapered fit.",
                    1799.00, 20, categoryMap.get("Pants"),
                    "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=600&q=80");

            // Accessories
            createProduct("Minimalist Leather Chronograph Watch",
                    "Water-resistant luxury analog watch with genuine Italian leather strap and scratch-resistant sapphire crystal.",
                    3499.00, 15, categoryMap.get("Accessories"),
                    "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=600&q=80");

            createProduct("Polarized UV400 Aviator Sunglasses",
                    "Classic aviator sunglasses with anti-glare polarized protective lenses and ultra-lightweight metal frame.",
                    999.00, 40, categoryMap.get("Accessories"),
                    "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=600&q=80");

            // Mobiles
            createProduct("Pro Smartphone 5G 128GB",
                    "Flagship smartphone featuring 120Hz AMOLED display, triple camera AI system, and ultra-fast octa-core 5G processor.",
                    42999.00, 10, categoryMap.get("Mobiles"),
                    "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80");

            createProduct("Ultra Note Smartphone 256GB",
                    "High-performance flagship with integrated stylus pen, 5000mAh battery life, and cinematic 8K video capture.",
                    58999.00, 8, categoryMap.get("Mobiles"),
                    "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=600&q=80");

            // Mobile Accessories
            createProduct("Active Noise Cancelling Wireless Earbuds",
                    "True wireless stereo earbuds with active noise cancellation, deep punchy bass, and 30-hour battery life with charging case.",
                    2999.00, 50, categoryMap.get("Mobile Accessories"),
                    "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=600&q=80");

            createProduct("65W Fast GaN Wall Charger & Braided Cable",
                    "Ultra-compact dual-port USB-C fast charger with durable braided 2-meter fast-charging cable.",
                    1299.00, 60, categoryMap.get("Mobile Accessories"),
                    "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=600&q=80");

            System.out.println(">>> [DataInitializer] Catalog seeding complete! 10 sample products loaded.");
        }
    }

    private void createProduct(String name, String description, double price, int stock, Category category, String imageUrl) {
        try {
            Product product = new Product();
            product.setName(name);
            product.setDescription(description);
            product.setPrice(BigDecimal.valueOf(price));
            product.setStock(stock);
            product.setCategory(category);
            product.setCreatedAt(LocalDateTime.now());
            product.setUpdatedAt(LocalDateTime.now());

            Product savedProduct = productRepository.save(product);

            ProductImage productImage = new ProductImage();
            productImage.setProduct(savedProduct);
            productImage.setImageUrl(imageUrl);
            productImageRepository.save(productImage);
        } catch (Exception e) {
            System.err.println(">>> [DataInitializer] Could not seed product '" + name + "': " + e.getMessage());
        }
    }
}
