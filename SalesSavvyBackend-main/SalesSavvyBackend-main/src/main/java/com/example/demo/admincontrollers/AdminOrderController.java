package com.example.demo.admincontrollers;

import com.example.demo.entity.Order;
import com.example.demo.entity.OrderItem;
import com.example.demo.entity.OrderStatus;
import com.example.demo.entity.Product;
import com.example.demo.entity.User;
import com.example.demo.repository.OrderItemRepository;
import com.example.demo.repository.OrderRepository;
import com.example.demo.repository.ProductRepository;
import com.example.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@CrossOrigin(origins = "http://localhost:5174", allowCredentials = "true")
@RequestMapping("/admin/orders")
public class AdminOrderController {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public ResponseEntity<?> getAllOrders() {
        try {
            List<Order> orders = orderRepository.findAllByOrderByCreatedAtDesc();
            List<Map<String, Object>> response = new ArrayList<>();

            for (Order order : orders) {
                Map<String, Object> orderMap = new HashMap<>();
                orderMap.put("orderId", order.getOrderId());
                orderMap.put("userId", order.getUserId());
                
                Optional<User> userOpt = userRepository.findById(order.getUserId());
                orderMap.put("username", userOpt.isPresent() ? userOpt.get().getUsername() : "User #" + order.getUserId());
                orderMap.put("email", userOpt.isPresent() ? userOpt.get().getEmail() : "");

                orderMap.put("totalAmount", order.getTotalAmount());
                orderMap.put("status", order.getStatus() != null ? order.getStatus().name() : "PENDING");
                orderMap.put("createdAt", order.getCreatedAt() != null ? order.getCreatedAt().toString() : "");
                orderMap.put("recipientName", order.getRecipientName());
                orderMap.put("phone", order.getPhone());
                orderMap.put("shippingAddress", order.getShippingAddress());
                orderMap.put("city", order.getCity());
                orderMap.put("postalCode", order.getPostalCode());

                List<OrderItem> items = orderItemRepository.findByOrderId(order.getOrderId());
                List<Map<String, Object>> itemDetailsList = new ArrayList<>();
                for (OrderItem item : items) {
                    Map<String, Object> itemMap = new HashMap<>();
                    itemMap.put("productId", item.getProductId());
                    Optional<Product> prodOpt = productRepository.findById(item.getProductId());
                    itemMap.put("name", prodOpt.isPresent() ? prodOpt.get().getName() : "Product #" + item.getProductId());
                    itemMap.put("quantity", item.getQuantity());
                    itemMap.put("pricePerUnit", item.getPricePerUnit());
                    itemMap.put("totalPrice", item.getTotalPrice());
                    itemDetailsList.add(itemMap);
                }
                orderMap.put("items", itemDetailsList);
                response.add(orderMap);
            }

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{orderId}/status")
    public ResponseEntity<?> updateOrderStatus(
            @PathVariable String orderId,
            @RequestBody Map<String, String> request) {
        try {
            String statusStr = request.get("status");
            if (statusStr == null || statusStr.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Status is required"));
            }

            OrderStatus newStatus;
            try {
                newStatus = OrderStatus.valueOf(statusStr.trim().toUpperCase());
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid status: " + statusStr));
            }

            Order order = orderRepository.findById(orderId)
                    .orElseThrow(() -> new IllegalArgumentException("Order not found with ID: " + orderId));

            order.setStatus(newStatus);
            order.setUpdatedAt(LocalDateTime.now());
            orderRepository.save(order);

            return ResponseEntity.ok(Map.of("message", "Order status updated successfully", "status", newStatus.name()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", e.getMessage()));
        }
    }
}
