package com.example.demo.controller;

import com.example.demo.entity.User;
import com.example.demo.service.CartService;
import com.example.demo.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@CrossOrigin(origins = "http://localhost:5174", allowCredentials = "true")
@RequestMapping("/api/cart")
public class CartController {

    @Autowired
    private CartService cartService;

    @Autowired
    private UserRepository userRepository;

    private User getAuthenticatedUser(HttpServletRequest request, Map<String, Object> body, String queryUsername) {
        User user = (User) request.getAttribute("authenticatedUser");
        if (user != null) {
            return user;
        }
        String username = queryUsername;
        if (username == null && body != null && body.containsKey("username")) {
            username = (String) body.get("username");
        }
        if (username != null && !username.isEmpty()) {
            return userRepository.findByUsername(username).orElse(null);
        }
        return null;
    }

    // Get cart item count
    @GetMapping("/items/count")
    public ResponseEntity<Integer> getCartItemCount(
            @RequestParam(required = false) String username,
            HttpServletRequest request) {
        User user = getAuthenticatedUser(request, null, username);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(0);
        }
        int count = cartService.getCartItemCount(user.getUserId());
        return ResponseEntity.ok(count);
    }

    // Fetch all cart items for the user
    @GetMapping("/items")
    public ResponseEntity<Map<String, Object>> getCartItems(HttpServletRequest request) {
        User user = getAuthenticatedUser(request, null, null);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        Map<String, Object> cartItems = cartService.getCartItems(user.getUserId());
        return ResponseEntity.ok(cartItems);
    }

    // Add an item to the cart
    @PostMapping("/add")
    public ResponseEntity<?> addToCart(@RequestBody Map<String, Object> body, HttpServletRequest request) {
        User user = getAuthenticatedUser(request, body, null);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Unauthorized"));
        }

        try {
            int productId = Integer.parseInt(body.get("productId").toString());
            int quantity = body.containsKey("quantity") ? Integer.parseInt(body.get("quantity").toString()) : 1;

            cartService.addToCart(user.getUserId(), productId, quantity);
            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("message", "Product added to cart"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Failed to add item to cart"));
        }
    }

    // Update Cart Item Quantity
    @PutMapping("/update")
    public ResponseEntity<?> updateCartItemQuantity(@RequestBody Map<String, Object> body, HttpServletRequest request) {
        User user = getAuthenticatedUser(request, body, null);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Unauthorized"));
        }

        try {
            int productId = Integer.parseInt(body.get("productId").toString());
            int quantity = Integer.parseInt(body.get("quantity").toString());

            cartService.updateCartItemQuantity(user.getUserId(), productId, quantity);
            return ResponseEntity.ok(Map.of("message", "Cart updated"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Failed to update cart"));
        }
    }

    // Delete Cart Item - REST path
    @DeleteMapping("/items/{productId}")
    public ResponseEntity<Void> deleteCartItemByPath(@PathVariable int productId, HttpServletRequest request) {
        User user = getAuthenticatedUser(request, null, null);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        cartService.deleteCartItem(user.getUserId(), productId);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }

    // Delete Cart Item - Backward-compatible path
    @DeleteMapping("/delete")
    public ResponseEntity<Void> deleteCartItem(
            @RequestBody(required = false) Map<String, Object> body,
            @RequestParam(required = false) Integer productId,
            HttpServletRequest request) {
        User user = getAuthenticatedUser(request, body, null);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        int targetProductId = 0;
        if (productId != null) {
            targetProductId = productId;
        } else if (body != null && body.containsKey("productId")) {
            targetProductId = Integer.parseInt(body.get("productId").toString());
        }

        if (targetProductId > 0) {
            cartService.deleteCartItem(user.getUserId(), targetProductId);
        }
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }
}
