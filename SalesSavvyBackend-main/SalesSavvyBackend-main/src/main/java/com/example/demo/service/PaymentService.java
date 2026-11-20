package com.example.demo.service;

import com.example.demo.entity.CartItem;
import com.example.demo.entity.Order;
import com.example.demo.entity.OrderItem;
import com.example.demo.entity.OrderStatus;
import com.example.demo.entity.Product;
import com.example.demo.repository.CartRepository;
import com.example.demo.repository.OrderItemRepository;
import com.example.demo.repository.OrderRepository;
import com.example.demo.repository.ProductRepository;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;

import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class PaymentService {

    @Value("${razorpay.key_id}")
    private String razorpayKeyId;

    @Value("${razorpay.key_secret}")
    private String razorpayKeySecret;

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final CartRepository cartRepository;
    private final ProductRepository productRepository;

    public PaymentService(OrderRepository orderRepository,
                          OrderItemRepository orderItemRepository,
                          CartRepository cartRepository,
                          ProductRepository productRepository) {
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.cartRepository = cartRepository;
        this.productRepository = productRepository;
    }

    @Transactional
    public String createOrder(int userId, BigDecimal totalAmount, List<OrderItem> cartItems,
                              String recipientName, String phone, String shippingAddress,
                              String city, String postalCode) throws RazorpayException {

        // Validate stock before initiating payment
        for (OrderItem item : cartItems) {
            Optional<Product> productOpt = productRepository.findById(item.getProductId());
            if (productOpt.isEmpty()) {
                throw new IllegalArgumentException("Product ID " + item.getProductId() + " not found.");
            }
            Product product = productOpt.get();
            if (product.getStock() < item.getQuantity()) {
                throw new IllegalArgumentException("Product '" + product.getName() + "' does not have sufficient stock. Available: " + product.getStock());
            }
        }

        // Create Razorpay client
        RazorpayClient razorpayClient = new RazorpayClient(razorpayKeyId, razorpayKeySecret);

        // Prepare Razorpay order request
        var orderRequest = new JSONObject();
        orderRequest.put("amount", totalAmount.multiply(BigDecimal.valueOf(100)).intValue()); // Amount in paise
        orderRequest.put("currency", "INR");
        orderRequest.put("receipt", "txn_" + System.currentTimeMillis());

        // Create Razorpay order
        com.razorpay.Order razorpayOrder = razorpayClient.orders.create(orderRequest);

        // Save order details in the database
        Order order = new Order();
        order.setOrderId(razorpayOrder.get("id"));
        order.setUserId(userId);
        order.setTotalAmount(totalAmount);
        order.setStatus(OrderStatus.PENDING);
        order.setCreatedAt(LocalDateTime.now());
        order.setRecipientName(recipientName);
        order.setPhone(phone);
        order.setShippingAddress(shippingAddress);
        order.setCity(city);
        order.setPostalCode(postalCode);
        orderRepository.save(order);

        return razorpayOrder.get("id");
    }

    // Overload for backward compatibility
    @Transactional
    public String createOrder(int userId, BigDecimal totalAmount, List<OrderItem> cartItems) throws RazorpayException {
        return createOrder(userId, totalAmount, cartItems, null, null, null, null, null);
    }

    @Transactional
    public boolean verifyPayment(String razorpayOrderId, String razorpayPaymentId, String razorpaySignature, int userId) {
        try {
            // Prepare signature validation attributes
            JSONObject attributes = new JSONObject();
            attributes.put("razorpay_order_id", razorpayOrderId);
            attributes.put("razorpay_payment_id", razorpayPaymentId);
            attributes.put("razorpay_signature", razorpaySignature);

            // Verify Razorpay signature
            boolean isSignatureValid = com.razorpay.Utils.verifyPaymentSignature(attributes, razorpayKeySecret);

            if (isSignatureValid) {
                // Update order status to SUCCESS
                Order order = orderRepository.findById(razorpayOrderId)
                    .orElseThrow(() -> new RuntimeException("Order not found"));
                order.setStatus(OrderStatus.SUCCESS);
                order.setUpdatedAt(LocalDateTime.now());
                orderRepository.save(order);

                // Fetch cart items for the user
                List<CartItem> cartItems = cartRepository.findCartItemsWithProductDetails(userId);

                // Save order items & decrement product stock atomically
                for (CartItem cartItem : cartItems) {
                    Product product = cartItem.getProduct();
                    
                    // Decrement stock
                    int updatedStock = Math.max(0, product.getStock() - cartItem.getQuantity());
                    product.setStock(updatedStock);
                    productRepository.save(product);

                    OrderItem orderItem = new OrderItem();
                    orderItem.setOrder(order);
                    orderItem.setProductId(product.getProductId());
                    orderItem.setQuantity(cartItem.getQuantity());
                    orderItem.setPricePerUnit(product.getPrice());
                    orderItem.setTotalPrice(product.getPrice().multiply(BigDecimal.valueOf(cartItem.getQuantity())));
                    orderItemRepository.save(orderItem);
                }

                // Clear user's cart
                cartRepository.deleteAllCartItemsByUserId(userId);

                return true;
            } else {
                return false;
            }
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    @Transactional
    public void saveOrderItems(String orderId, List<OrderItem> items) {
        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new RuntimeException("Order not found"));
        for (OrderItem item : items) {
            item.setOrder(order);
            orderItemRepository.save(item);
        }
    }
}
