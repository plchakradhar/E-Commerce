package com.genzfits.controller;

import com.genzfits.model.CartItem;
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
@RequestMapping("/api/cart")
public class CartController {

    @Autowired
    private UserService userService;

    private boolean isUserLoggedIn(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session == null || session.getAttribute("user") == null) {
            System.out.println("User not logged in - No session or user attribute");
            return false;
        }
        System.out.println("User is logged in - Session exists");
        return true;
    }

    @GetMapping("/{userId}")
    public ResponseEntity<?> getCart(@PathVariable Long userId, HttpServletRequest request) {
        System.out.println("GET /api/cart/" + userId + " called");
        
        if (!isUserLoggedIn(request)) {
            System.out.println("Unauthorized access to cart");
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized: User not logged in"));
        }
        
        try {
            List<CartItem> cart = userService.getCart(userId);
            System.out.println("Returning " + cart.size() + " cart items");
            return ResponseEntity.ok(cart);
        } catch (Exception e) {
            System.out.println("Error fetching cart: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("error", "Error fetching cart: " + e.getMessage()));
        }
    }

    @PostMapping("")
    public ResponseEntity<?> addToCart(@RequestBody Map<String, Object> cartRequest, HttpServletRequest request) {
        System.out.println("POST /api/cart called with: " + cartRequest);
        
        if (!isUserLoggedIn(request)) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized: User not logged in"));
        }
        
        try {
            if (!cartRequest.containsKey("userId") || !cartRequest.containsKey("productId") || 
                !cartRequest.containsKey("quantity") || !cartRequest.containsKey("selectedSize")) {
                return ResponseEntity.badRequest().body(Map.of("error", "Missing required fields: userId, productId, quantity, selectedSize"));
            }

            Long userId = Long.valueOf(cartRequest.get("userId").toString());
            Long productId = Long.valueOf(cartRequest.get("productId").toString());
            int quantity = Integer.parseInt(cartRequest.get("quantity").toString());
            String selectedSize = cartRequest.get("selectedSize").toString();

            if (quantity <= 0) {
                return ResponseEntity.badRequest().body(Map.of("error", "Quantity must be greater than 0"));
            }
            if (selectedSize == null || selectedSize.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Selected size is required"));
            }

            boolean success = userService.addToCart(userId, productId, quantity, selectedSize);
            if (success) {
                System.out.println("Successfully added to cart");
                return ResponseEntity.ok(Map.of(
                    "status", "success", 
                    "message", "Product added to cart successfully"
                ));
            } else {
                System.out.println("Failed to add to cart");
                return ResponseEntity.badRequest().body(Map.of(
                    "status", "error", 
                    "message", "Failed to add product to cart"
                ));
            }
        } catch (NumberFormatException e) {
            System.out.println("Number format error: " + e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid number format: " + e.getMessage()));
        } catch (Exception e) {
            System.out.println("Unexpected error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("error", "Error adding to cart: " + e.getMessage()));
        }
    }

    @PutMapping("/{userId}/{cartItemId}")
    public ResponseEntity<?> updateCartItem(@PathVariable Long userId, @PathVariable Long cartItemId, 
                                           @RequestBody Map<String, Integer> quantityRequest, HttpServletRequest request) {
        System.out.println("PUT /api/cart/" + userId + "/" + cartItemId + " called with: " + quantityRequest);
        
        if (!isUserLoggedIn(request)) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized: User not logged in"));
        }
        
        try {
            int quantity = quantityRequest.get("quantity");
            if (quantity <= 0) {
                return ResponseEntity.badRequest().body(Map.of("error", "Quantity must be greater than 0"));
            }
            boolean success = userService.updateCartItem(userId, cartItemId, quantity);
            if (success) {
                return ResponseEntity.ok(Map.of(
                    "status", "success", 
                    "message", "Cart updated successfully"
                ));
            } else {
                return ResponseEntity.badRequest().body(Map.of(
                    "status", "error", 
                    "message", "Failed to update cart"
                ));
            }
        } catch (Exception e) {
            System.out.println("Error updating cart: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("error", "Error updating cart: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{userId}/{cartItemId}")
    public ResponseEntity<?> removeFromCart(@PathVariable Long userId, @PathVariable Long cartItemId, HttpServletRequest request) {
        System.out.println("DELETE /api/cart/" + userId + "/" + cartItemId + " called");
        
        if (!isUserLoggedIn(request)) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized: User not logged in"));
        }
        
        try {
            boolean success = userService.removeFromCart(userId, cartItemId);
            if (success) {
                return ResponseEntity.ok(Map.of(
                    "status", "success", 
                    "message", "Item removed from cart"
                ));
            } else {
                return ResponseEntity.badRequest().body(Map.of(
                    "status", "error", 
                    "message", "Failed to remove item from cart"
                ));
            }
        } catch (Exception e) {
            System.out.println("Error removing from cart: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("error", "Error removing from cart: " + e.getMessage()));
        }
    }

    @DeleteMapping("/clear/{userId}")
    public ResponseEntity<?> clearCart(@PathVariable Long userId, HttpServletRequest request) {
        System.out.println("DELETE /api/cart/clear/" + userId + " called");
        
        if (!isUserLoggedIn(request)) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized: User not logged in"));
        }
        
        try {
            userService.clearCart(userId);
            return ResponseEntity.ok(Map.of(
                "status", "success", 
                "message", "Cart cleared successfully"
            ));
        } catch (Exception e) {
            System.out.println("Error clearing cart: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("error", "Error clearing cart: " + e.getMessage()));
        }
    }

    @GetMapping("/debug/{userId}")
    public ResponseEntity<?> debugCart(@PathVariable Long userId, HttpServletRequest request) {
        System.out.println("DEBUG /api/cart/debug/" + userId + " called");
        
        if (!isUserLoggedIn(request)) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        }
        
        try {
            List<CartItem> cart = userService.getCart(userId);
            Map<String, Object> debugInfo = new HashMap<>();
            debugInfo.put("userId", userId);
            debugInfo.put("cartItemsCount", cart.size());
            debugInfo.put("cartItems", cart);
            
            for (CartItem item : cart) {
                System.out.println("DEBUG - CartItem: ID=" + item.getId() + 
                    ", Product=" + (item.getProduct() != null ? item.getProduct().getName() : "null") +
                    ", Quantity=" + item.getQuantity() +
                    ", Size=" + item.getSelectedSize());
            }
            
            return ResponseEntity.ok(debugInfo);
        } catch (Exception e) {
            System.out.println("Debug error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("error", "Debug failed: " + e.getMessage()));
        }
    }
}