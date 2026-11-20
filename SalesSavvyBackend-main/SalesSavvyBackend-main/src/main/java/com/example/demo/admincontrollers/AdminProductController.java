// Admin Controller for Product functionality
package com.example.demo.admincontrollers;

import com.example.demo.entity.Product;
import com.example.demo.adminservices.AdminProductService;
import com.example.demo.repository.ProductImageRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin(origins = "http://localhost:5174", allowCredentials = "true")
@RequestMapping("/admin/products")
public class AdminProductController {

    private final AdminProductService adminProductService;
    private final ProductImageRepository productImageRepository;

    public AdminProductController(AdminProductService adminProductService, ProductImageRepository productImageRepository) {
        this.adminProductService = adminProductService;
        this.productImageRepository = productImageRepository;
    }

    @PostMapping("/add")
    public ResponseEntity<?> addProduct(@RequestBody Map<String, Object> productRequest) {
        try {
            String name = (String) productRequest.get("name");
            String description = (String) productRequest.get("description");
            Double price = Double.valueOf(String.valueOf(productRequest.get("price")));
            Integer stock = Integer.parseInt(productRequest.get("stock").toString());
            Integer categoryId = Integer.parseInt(productRequest.get("categoryId").toString());
            String imageUrl = (String) productRequest.get("imageUrl");

            Product addedProduct = adminProductService.addProductWithImage(name, description, price, stock, categoryId, imageUrl);
            Map<String, Object> res = formatProduct(addedProduct, imageUrl);
            return ResponseEntity.status(HttpStatus.CREATED).body(res);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Something went wrong"));
        }
    }

    @PutMapping("/update")
    public ResponseEntity<?> updateProduct(@RequestBody Map<String, Object> productRequest) {
        try {
            Integer productId = Integer.parseInt(productRequest.get("productId").toString());
            String name = (String) productRequest.get("name");
            String description = (String) productRequest.get("description");
            Double price = productRequest.containsKey("price") && productRequest.get("price") != null ? Double.valueOf(String.valueOf(productRequest.get("price"))) : null;
            Integer stock = productRequest.containsKey("stock") && productRequest.get("stock") != null ? Integer.parseInt(productRequest.get("stock").toString()) : null;
            Integer categoryId = productRequest.containsKey("categoryId") && productRequest.get("categoryId") != null ? Integer.parseInt(productRequest.get("categoryId").toString()) : null;
            String imageUrl = (String) productRequest.get("imageUrl");

            Product updated = adminProductService.updateProduct(productId, name, description, price, stock, categoryId, imageUrl);
            return ResponseEntity.ok(formatProduct(updated, imageUrl));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Something went wrong"));
        }
    }

    @GetMapping("/all")
    public ResponseEntity<?> getAllProducts() {
        try {
            List<Product> products = adminProductService.getAllProducts();
            List<Map<String, Object>> response = new ArrayList<>();
            for (Product p : products) {
                var images = productImageRepository.findByProduct_ProductId(p.getProductId());
                String imgUrl = images.isEmpty() ? null : images.get(0).getImageUrl();
                response.add(formatProduct(p, imgUrl));
            }
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Something went wrong"));
        }
    }
    
    @DeleteMapping("/delete")
    public ResponseEntity<?> deleteProductBody(@RequestBody(required = false) Map<String, Object> requestBody,
                                              @RequestParam(required = false) Integer productId) {
        try {
            Integer targetId = productId;
            if (targetId == null && requestBody != null && requestBody.containsKey("productId")) {
                targetId = Integer.parseInt(requestBody.get("productId").toString());
            }
            if (targetId == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Product ID is required"));
            }
            adminProductService.deleteProduct(targetId);
            return ResponseEntity.status(HttpStatus.OK).body(Map.of("message", "Product deleted successfully"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Something went wrong"));
        }
    }

    @DeleteMapping("/{productId}")
    public ResponseEntity<?> deleteProductPath(@PathVariable Integer productId) {
        try {
            adminProductService.deleteProduct(productId);
            return ResponseEntity.status(HttpStatus.OK).body(Map.of("message", "Product deleted successfully"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Something went wrong"));
        }
    }

    private Map<String, Object> formatProduct(Product p, String imageUrl) {
        Map<String, Object> map = new HashMap<>();
        map.put("productId", p.getProductId());
        map.put("name", p.getName());
        map.put("description", p.getDescription());
        map.put("price", p.getPrice());
        map.put("stock", p.getStock());
        map.put("imageUrl", imageUrl);
        map.put("category", p.getCategory() != null ? p.getCategory().getCategoryName() : "General");
        map.put("categoryId", p.getCategory() != null ? p.getCategory().getCategoryId() : null);
        map.put("createdAt", p.getCreatedAt());
        map.put("updatedAt", p.getUpdatedAt());
        return map;
    }
}
