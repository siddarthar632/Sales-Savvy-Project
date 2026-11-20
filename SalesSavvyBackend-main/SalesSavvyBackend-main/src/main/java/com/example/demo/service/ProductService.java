package com.example.demo.service;

import com.example.demo.entity.Category;
import com.example.demo.entity.Product;
import com.example.demo.entity.ProductImage;
import com.example.demo.repository.ProductRepository;
import com.example.demo.repository.ProductImageRepository;
import com.example.demo.repository.CategoryRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private ProductImageRepository productImageRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    public List<Product> getProducts(String categoryName, String searchQuery) {
        boolean hasCategory = categoryName != null && !categoryName.trim().isEmpty() && !categoryName.equalsIgnoreCase("All");
        boolean hasSearch = searchQuery != null && !searchQuery.trim().isEmpty();

        if (hasCategory && hasSearch) {
            Optional<Category> categoryOpt = categoryRepository.findByCategoryName(categoryName.trim());
            if (categoryOpt.isPresent()) {
                return productRepository.searchProductsByCategory(categoryOpt.get().getCategoryId(), searchQuery.trim());
            } else {
                return new ArrayList<>();
            }
        } else if (hasCategory) {
            Optional<Category> categoryOpt = categoryRepository.findByCategoryName(categoryName.trim());
            if (categoryOpt.isPresent()) {
                return productRepository.findByCategory_CategoryId(categoryOpt.get().getCategoryId());
            } else {
                return new ArrayList<>();
            }
        } else if (hasSearch) {
            return productRepository.searchProducts(searchQuery.trim());
        } else {
            return productRepository.findAll();
        }
    }

    public List<Product> getProductsByCategory(String categoryName) {
        return getProducts(categoryName, null);
    }

    public Optional<Product> getProductById(Integer productId) {
        return productRepository.findById(productId);
    }

    public List<String> getProductImages(Integer productId) {
        List<ProductImage> productImages = productImageRepository.findByProduct_ProductId(productId);
        List<String> imageUrls = new ArrayList<>();
        for (ProductImage image : productImages) {
            imageUrls.add(image.getImageUrl());
        }
        return imageUrls;
    }
}
