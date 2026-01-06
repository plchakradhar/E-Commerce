package com.genzfits.controller;

import com.genzfits.model.Product;
import com.genzfits.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
@RestController
@RequestMapping("/api/wishlist")
public class WishlistController {

    @Autowired
    private UserService userService;

    private boolean isUserLoggedIn(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        return session != null && session.getAttribute("user") != null;
    }

    @GetMapping("/{userId}")
    public ResponseEntity<?> getWishlist(@PathVariable Long userId, HttpServletRequest request) {
        if (!isUserLoggedIn(request)) {
            Map<String, String> response = new HashMap<>();
            response.put("status", "error");
            response.put("message", "Unauthorized - Please login first");
            return ResponseEntity.status(401).body(response);
        }
        try {
            List<Product> wishlist = userService.getWishlist(userId);
            
            // Ensure all products have consistent data
            for (Product product : wishlist) {
                // Set default rating if null
                if (product.getRating() == null) {
                    product.setRating(4.5);
                }
                // Ensure stock is not null
                if (product.getStock() == null) {
                    product.setStock(0);
                }
            }
            
            return ResponseEntity.ok(wishlist);
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("status", "error");
            response.put("message", "Error fetching wishlist: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping("/{userId}/{productId}")
    public ResponseEntity<?> addToWishlist(@PathVariable Long userId, @PathVariable Long productId, HttpServletRequest request) {
        if (!isUserLoggedIn(request)) {
            Map<String, String> response = new HashMap<>();
            response.put("status", "error");
            response.put("message", "Unauthorized - Please login first");
            return ResponseEntity.status(401).body(response);
        }
        try {
            boolean success = userService.addToWishlist(userId, productId);
            Map<String, Object> response = new HashMap<>();
            if (success) {
                response.put("status", "success");
                response.put("message", "Product added to wishlist");
                
                // Return updated wishlist count
                List<Product> wishlist = userService.getWishlist(userId);
                response.put("wishlistCount", wishlist.size());
            } else {
                response.put("status", "error");
                response.put("message", "Failed to add product to wishlist - Product might already be in wishlist");
            }
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("status", "error");
            response.put("message", "Error adding to wishlist: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @DeleteMapping("/{userId}/{productId}")
    public ResponseEntity<?> removeFromWishlist(@PathVariable Long userId, @PathVariable Long productId, HttpServletRequest request) {
        if (!isUserLoggedIn(request)) {
            Map<String, String> response = new HashMap<>();
            response.put("status", "error");
            response.put("message", "Unauthorized - Please login first");
            return ResponseEntity.status(401).body(response);
        }
        try {
            boolean success = userService.removeFromWishlist(userId, productId);
            Map<String, Object> response = new HashMap<>();
            if (success) {
                response.put("status", "success");
                response.put("message", "Product removed from wishlist");
                
                // Return updated wishlist count
                List<Product> wishlist = userService.getWishlist(userId);
                response.put("wishlistCount", wishlist.size());
            } else {
                response.put("status", "error");
                response.put("message", "Failed to remove product from wishlist");
            }
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("status", "error");
            response.put("message", "Error removing from wishlist: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @DeleteMapping("/clear/{userId}")
    public ResponseEntity<?> clearWishlist(@PathVariable Long userId, HttpServletRequest request) {
        if (!isUserLoggedIn(request)) {
            Map<String, String> response = new HashMap<>();
            response.put("status", "error");
            response.put("message", "Unauthorized - Please login first");
            return ResponseEntity.status(401).body(response);
        }
        try {
            userService.clearWishlist(userId);
            Map<String, String> response = new HashMap<>();
            response.put("status", "success");
            response.put("message", "Wishlist cleared successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("status", "error");
            response.put("message", "Error clearing wishlist: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/count/{userId}")
    public ResponseEntity<?> getWishlistCount(@PathVariable Long userId, HttpServletRequest request) {
        if (!isUserLoggedIn(request)) {
            return ResponseEntity.ok(0);
        }
        try {
            List<Product> wishlist = userService.getWishlist(userId);
            return ResponseEntity.ok(wishlist.size());
        } catch (Exception e) {
            return ResponseEntity.ok(0);
        }
    }
}