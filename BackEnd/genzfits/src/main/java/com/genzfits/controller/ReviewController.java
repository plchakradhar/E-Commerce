package com.genzfits.controller;

import com.genzfits.model.Review;
import com.genzfits.service.ReviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/reviews")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class ReviewController {

    @Autowired
    private ReviewService reviewService;

    @PostMapping("/add")
    public ResponseEntity<?> addReview(
            @RequestParam("productId") Long productId,
            @RequestParam("userId") Long userId,
            @RequestParam("orderId") Long orderId,
            @RequestParam("rating") Integer rating,
            @RequestParam(value = "comment", required = false) String comment,
            @RequestParam(value = "images", required = false) List<MultipartFile> images) {
        
        try {
            System.out.println("Received review request - ProductId: " + productId + ", UserId: " + userId + ", OrderId: " + orderId + ", Rating: " + rating);
            
            Review review = reviewService.addReview(productId, userId, orderId, rating, comment, images);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Review added successfully");
            response.put("review", review);
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.err.println("Error adding review: " + e.getMessage());
            e.printStackTrace();
            
            Map<String, String> response = new HashMap<>();
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<List<Review>> getProductReviews(@PathVariable Long productId) {
        List<Review> reviews = reviewService.getProductReviews(productId);
        return ResponseEntity.ok(reviews);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Review>> getUserReviews(@PathVariable Long userId) {
        List<Review> reviews = reviewService.getUserReviews(userId);
        return ResponseEntity.ok(reviews);
    }

    @GetMapping("/order/{orderId}/product/{productId}")
    public ResponseEntity<?> getReviewByOrderAndProduct(
            @PathVariable Long orderId,
            @PathVariable Long productId) {
        
        Review review = reviewService.getReviewByOrderAndProduct(orderId, productId);
        if (review != null) {
            return ResponseEntity.ok(review);
        } else {
            Map<String, String> response = new HashMap<>();
            response.put("message", "Review not found");
            return ResponseEntity.ok(response);
        }
    }

    @DeleteMapping("/{reviewId}")
    public ResponseEntity<?> deleteReview(@PathVariable Long reviewId) {
        try {
            reviewService.deleteReview(reviewId);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Review deleted successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
}