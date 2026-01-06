package com.genzfits.service;

import com.genzfits.model.*;
import com.genzfits.repository.ReviewRepository;
import com.genzfits.repository.ProductRepository;
import com.genzfits.repository.UserRepository;
import com.genzfits.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

@Service
public class ReviewService {

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OrderRepository orderRepository;

    private final String UPLOAD_DIR = "uploads/reviews/";

    public Review addReview(Long productId, Long userId, Long orderId, Integer rating, 
                          String comment, List<MultipartFile> images) throws IOException {
        
        // Validate inputs
        if (rating == null || rating < 1 || rating > 5) {
            throw new RuntimeException("Rating must be between 1 and 5");
        }

        // Check if review already exists
        if (reviewRepository.existsByOrderIdAndProductId(orderId, productId)) {
            throw new RuntimeException("You have already reviewed this product from this order");
        }

        // Validate product exists
        Product product = productRepository.findById(productId)
            .orElseThrow(() -> new RuntimeException("Product not found with id: " + productId));

        // Validate user exists
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        // Validate order exists and belongs to user
        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new RuntimeException("Order not found with id: " + orderId));

        if (!order.getUser().getId().equals(userId)) {
            throw new RuntimeException("Order does not belong to the user");
        }

        // Create review
        Review review = new Review();
        review.setProduct(product);
        review.setUser(user);
        review.setOrder(order);
        review.setRating(rating);
        review.setComment(comment != null ? comment : "");

        // Handle image uploads
        if (images != null && !images.isEmpty()) {
            for (MultipartFile image : images) {
                if (!image.isEmpty()) {
                    String imagePath = saveImage(image);
                    review.getImages().add(imagePath);
                }
            }
        }

        Review savedReview = reviewRepository.save(review);
        
        // Update product rating
        updateProductRating(productId);
        
        return savedReview;
    }

    private String saveImage(MultipartFile image) throws IOException {
        try {
            // Create upload directory if it doesn't exist
            Path uploadPath = Paths.get(UPLOAD_DIR);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // Generate unique filename
            String originalFileName = image.getOriginalFilename();
            String fileExtension = "";
            if (originalFileName != null && originalFileName.contains(".")) {
                fileExtension = originalFileName.substring(originalFileName.lastIndexOf("."));
            }
            
            String fileName = UUID.randomUUID().toString() + fileExtension;
            Path filePath = uploadPath.resolve(fileName);
            Files.copy(image.getInputStream(), filePath);

            return "/uploads/reviews/" + fileName;
        } catch (Exception e) {
            throw new IOException("Failed to save image: " + e.getMessage());
        }
    }

    private void updateProductRating(Long productId) {
        try {
            Double averageRating = reviewRepository.findAverageRatingByProductId(productId);
            Integer reviewCount = reviewRepository.countByProductId(productId);

            Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

            // Round to 1 decimal place
            if (averageRating != null) {
                averageRating = Math.round(averageRating * 10.0) / 10.0;
            }

            product.setRating(averageRating != null ? averageRating : 0.0);
            product.setReviewCount(reviewCount != null ? reviewCount : 0);
            
            productRepository.save(product);
        } catch (Exception e) {
            System.err.println("Error updating product rating: " + e.getMessage());
        }
    }

    public List<Review> getProductReviews(Long productId) {
        return reviewRepository.findByProductId(productId);
    }

    public List<Review> getUserReviews(Long userId) {
        return reviewRepository.findByUserId(userId);
    }

    public Review getReviewByOrderAndProduct(Long orderId, Long productId) {
        return reviewRepository.findByOrderIdAndProductId(orderId, productId)
            .orElse(null);
    }

    public void deleteReview(Long reviewId) {
        Review review = reviewRepository.findById(reviewId)
            .orElseThrow(() -> new RuntimeException("Review not found"));
        
        Long productId = review.getProduct().getId();
        reviewRepository.delete(review);
        
        // Update product rating after deletion
        updateProductRating(productId);
    }
}