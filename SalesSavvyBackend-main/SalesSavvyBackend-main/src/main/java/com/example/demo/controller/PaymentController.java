package com.example.demo.controller;

import com.example.demo.entity.OrderItem;
import com.example.demo.entity.User;
import com.example.demo.service.PaymentService;
import com.example.demo.repository.UserRepository;
import com.razorpay.RazorpayException;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@CrossOrigin(origins = "http://localhost:5174", allowCredentials = "true")
@RequestMapping("/api/payment")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    @Autowired
    private UserRepository userRepository;

    /**
     * Create Razorpay Order
     */
    @PostMapping("/create")
    public ResponseEntity<?> createPaymentOrder(@RequestBody Map<String, Object> requestBody, HttpServletRequest request) {
        try {
            // Fetch authenticated user
            User user = (User) request.getAttribute("authenticatedUser");
            if (user == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "User not authenticated"));
            }

            // Extract totalAmount and cartItems
            BigDecimal totalAmount = new BigDecimal(requestBody.get("totalAmount").toString());
            List<Map<String, Object>> cartItemsRaw = (List<Map<String, Object>>) requestBody.get("cartItems");

            // Extract shipping details if provided
            String recipientName = requestBody.containsKey("recipientName") ? (String) requestBody.get("recipientName") : user.getUsername();
            String phone = requestBody.containsKey("phone") ? (String) requestBody.get("phone") : "";
            String shippingAddress = requestBody.containsKey("shippingAddress") ? (String) requestBody.get("shippingAddress") : "";
            String city = requestBody.containsKey("city") ? (String) requestBody.get("city") : "";
            String postalCode = requestBody.containsKey("postalCode") ? (String) requestBody.get("postalCode") : "";

            // Convert cartItemsRaw to List<OrderItem>
            List<OrderItem> cartItems = cartItemsRaw.stream().map(item -> {
                OrderItem orderItem = new OrderItem();
                orderItem.setProductId(Integer.parseInt(item.get("productId").toString()));
                orderItem.setQuantity(Integer.parseInt(item.get("quantity").toString()));
                BigDecimal pricePerUnit = new BigDecimal(item.get("price").toString());
                orderItem.setPricePerUnit(pricePerUnit);
                orderItem.setTotalPrice(pricePerUnit.multiply(BigDecimal.valueOf(orderItem.getQuantity())));
                return orderItem;
            }).collect(Collectors.toList());

            // Call payment service
            String razorpayOrderId = paymentService.createOrder(
                    user.getUserId(), totalAmount, cartItems,
                    recipientName, phone, shippingAddress, city, postalCode
            );

            return ResponseEntity.ok(razorpayOrderId);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (RazorpayException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Error creating Razorpay order: " + e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "Invalid request data: " + e.getMessage()));
        }
    }

    /**
     * Verify Razorpay Payment
     */
    @PostMapping("/verify")
    public ResponseEntity<?> verifyPayment(@RequestBody Map<String, Object> requestBody, HttpServletRequest request) {
        try {
            User user = (User) request.getAttribute("authenticatedUser");
            if (user == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "User not authenticated"));
            }

            int userId = user.getUserId();
            String razorpayOrderId = (String) requestBody.get("razorpayOrderId");
            String razorpayPaymentId = (String) requestBody.get("razorpayPaymentId");
            String razorpaySignature = (String) requestBody.get("razorpaySignature");

            boolean isVerified = paymentService.verifyPayment(razorpayOrderId, razorpayPaymentId, razorpaySignature, userId);

            if (isVerified) {
                return ResponseEntity.ok(Map.of("message", "Payment verified successfully"));
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "Payment verification failed"));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Error verifying payment: " + e.getMessage()));
        }
    }
}
