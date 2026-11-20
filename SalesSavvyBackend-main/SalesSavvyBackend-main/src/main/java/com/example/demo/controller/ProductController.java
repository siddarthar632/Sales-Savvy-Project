package com.example.demo.controller;

import com.example.demo.entity.Product;
import com.example.demo.entity.User;
import com.example.demo.service.ProductService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@CrossOrigin(origins = "http://localhost:5174", allowCredentials = "true")
@RequestMapping("/api/products")
public class ProductController {

    @Autowired
    private ProductService productService;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getProducts(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String search,
            HttpServletRequest request) {
        try {
            User authenticatedUser = (User) request.getAttribute("authenticatedUser");

            // Fetch products based on category and search query
            List<Product> products = productService.getProducts(category, search);

            // Build the response
            Map<String, Object> response = new HashMap<>();
            
            // Add user info if authenticated
            if (authenticatedUser != null) {
                Map<String, String> userInfo = new HashMap<>();
                userInfo.put("name", authenticatedUser.getUsername());
                userInfo.put("role", authenticatedUser.getRole().name());
                response.put("user", userInfo);
            } else {
                response.put("user", null);
            }

            // Add product details
            List<Map<String, Object>> productList = new ArrayList<>();
            for (Product product : products) {
                Map<String, Object> productDetails = new HashMap<>();
                productDetails.put("product_id", product.getProductId());
                productDetails.put("name", product.getName());
                productDetails.put("description", product.getDescription());
                productDetails.put("price", product.getPrice());
                productDetails.put("stock", product.getStock());
                productDetails.put("category", product.getCategory() != null ? product.getCategory().getCategoryName() : "General");

                // Fetch product images
                List<String> images = productService.getProductImages(product.getProductId());
                productDetails.put("images", images);

                productList.add(productDetails);
            }
            response.put("products", productList);

            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getProductById(@PathVariable Integer id) {
        try {
            Optional<Product> productOpt = productService.getProductById(id);
            if (productOpt.isEmpty()) {
                return ResponseEntity.status(404).body(Map.of("error", "Product not found"));
            }
            Product product = productOpt.get();
            Map<String, Object> productDetails = new HashMap<>();
            productDetails.put("product_id", product.getProductId());
            productDetails.put("name", product.getName());
            productDetails.put("description", product.getDescription());
            productDetails.put("price", product.getPrice());
            productDetails.put("stock", product.getStock());
            productDetails.put("category", product.getCategory() != null ? product.getCategory().getCategoryName() : "General");
            productDetails.put("category_id", product.getCategory() != null ? product.getCategory().getCategoryId() : null);

            List<String> images = productService.getProductImages(product.getProductId());
            productDetails.put("images", images);

            return ResponseEntity.ok(productDetails);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }
}

