package com.genzfits.controller;

import com.genzfits.model.Order;
import com.genzfits.model.User;
import com.genzfits.service.OrderService;
import com.genzfits.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private OrderService orderService;

    @Autowired
    private UserService userService;

    @PostMapping("")
    public ResponseEntity<?> createOrder(@RequestBody Map<String, Object> orderRequest) {
        try {
            // Validate required fields
            if (orderRequest.get("userId") == null) {
                return ResponseEntity.badRequest().body(createErrorResponse("User ID is required"));
            }
            if (orderRequest.get("total") == null) {
                return ResponseEntity.badRequest().body(createErrorResponse("Total amount is required"));
            }
            if (orderRequest.get("items") == null) {
                return ResponseEntity.badRequest().body(createErrorResponse("Order items are required"));
            }
            if (orderRequest.get("shippingInfo") == null) {
                return ResponseEntity.badRequest().body(createErrorResponse("Shipping information is required"));
            }

            // Extract data from the request with validation
            Long userId;
            Double total;
            Map<String, Object> shippingInfoMap;
            List<Map<String, Object>> items;

            try {
                userId = Long.valueOf(orderRequest.get("userId").toString());
                total = Double.valueOf(orderRequest.get("total").toString());
                shippingInfoMap = (Map<String, Object>) orderRequest.get("shippingInfo");
                items = (List<Map<String, Object>>) orderRequest.get("items");
            } catch (Exception e) {
                return ResponseEntity.badRequest()
                        .body(createErrorResponse("Invalid request data format: " + e.getMessage()));
            }

            // Validate items
            if (items.isEmpty()) {
                return ResponseEntity.badRequest().body(createErrorResponse("Order must contain at least one item"));
            }

            // Get user from database
            Optional<User> userOptional = userService.getUserById(userId);
            if (userOptional.isEmpty()) {
                return ResponseEntity.badRequest().body(createErrorResponse("User not found with ID: " + userId));
            }

            User user = userOptional.get();

            // Create shipping info with validation
            Order.ShippingInfo shippingInfo = new Order.ShippingInfo();
            try {
                shippingInfo.setFullName(getStringValue(shippingInfoMap, "fullName", true));
                shippingInfo.setAddress(getStringValue(shippingInfoMap, "address", true));
                shippingInfo.setCity(getStringValue(shippingInfoMap, "city", true));
                shippingInfo.setState(getStringValue(shippingInfoMap, "state", true));
                shippingInfo.setZipCode(getStringValue(shippingInfoMap, "zipCode", true));
                shippingInfo.setVillage(getStringValue(shippingInfoMap, "village", false));
                shippingInfo.setPhone(getStringValue(shippingInfoMap, "phone", true));
                shippingInfo.setEmail(getStringValue(shippingInfoMap, "email", true));
                shippingInfo.setLandmark(getStringValue(shippingInfoMap, "landmark", false));
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest().body(createErrorResponse(e.getMessage()));
            }

            // Create order items
            List<Order.OrderItem> orderItems = items.stream().map(item -> {
                Order.OrderItem orderItem = new Order.OrderItem();
                try {
                    orderItem.setProductId(Long.valueOf(item.get("productId").toString()));
                    orderItem.setProductName(getStringValue(item, "productName", true));
                    orderItem.setQuantity(Integer.valueOf(item.get("quantity").toString()));
                    orderItem.setPrice(Double.valueOf(item.get("price").toString()));
                    orderItem.setSelectedSize(getStringValue(item, "selectedSize", false));

                    // Handle images - take first image if available
                    if (item.get("images") != null && item.get("images") instanceof List<?> imageList
                            && !imageList.isEmpty()) {
                        Object firstImage = imageList.get(0);
                        if (firstImage != null) {
                            orderItem.setImage(firstImage.toString());
                        }
                    } else if (item.get("image") != null) {
                        orderItem.setImage(item.get("image").toString());
                    }
                } catch (Exception e) {
                    throw new RuntimeException("Invalid item data: " + e.getMessage());
                }
                return orderItem;
            }).toList();

            // Create and save order
            Order order = new Order(user, orderItems, total, shippingInfo);
            Order savedOrder = orderService.saveOrder(order);

            // Handle coins for the order - 10 coins per item
            userService.handleOrderCoins(savedOrder);

            // Clear user's cart after successful order
            try {
                userService.clearCart(userId);
            } catch (Exception cartError) {
                // Don't fail the order if cart clearing fails
            }

            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("message", "Order created successfully");
            response.put("orderId", savedOrder.getId());
            response.put("order", savedOrder);
            response.put("coinsAwarded", items.size() * 10); // 10 coins per item
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            System.err.println("Error creating order: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(createErrorResponse("Error creating order: " + e.getMessage()));
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getUserOrders(@PathVariable Long userId) {
        try {
            List<Order> orders = orderService.getUserOrders(userId);
            return ResponseEntity.ok(orders);
        } catch (Exception e) {
            System.err.println("Error fetching orders: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(createErrorResponse("Error fetching orders: " + e.getMessage()));
        }
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<?> getOrderById(@PathVariable Long orderId) {
        try {
            Optional<Order> order = orderService.getOrderById(orderId);
            if (order.isPresent()) {
                return ResponseEntity.ok(order.get());
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            System.err.println("Error fetching order: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(createErrorResponse("Error fetching order: " + e.getMessage()));
        }
    }

    @PutMapping("/{orderId}/status")
    public ResponseEntity<?> updateOrderStatus(@PathVariable Long orderId,
            @RequestBody Map<String, String> statusRequest) {
        try {
            if (statusRequest == null || !statusRequest.containsKey("status")) {
                return ResponseEntity.badRequest().body(createErrorResponse("Status is required"));
            }

            String status = statusRequest.get("status");
            if (status == null || status.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(createErrorResponse("Status cannot be empty"));
            }

            Order updatedOrder = orderService.updateOrderStatus(orderId, status);
            if (updatedOrder != null) {
                // Handle coin deduction if order is returned
                if ("returned".equalsIgnoreCase(status) || "cancelled".equalsIgnoreCase(status)) {
                    userService.handleReturnCoins(updatedOrder);
                }

                return ResponseEntity.ok(updatedOrder);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            System.err.println("Error updating order status: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest()
                    .body(createErrorResponse("Error updating order status: " + e.getMessage()));
        }
    }

    @PutMapping("/{orderId}/return")
    public ResponseEntity<?> returnOrder(@PathVariable Long orderId, @RequestBody Map<String, String> returnDetails) {
        try {
            String reason = returnDetails != null ? returnDetails.get("reason") : null;
            String comment = returnDetails != null ? returnDetails.get("comment") : null;

            Order updatedOrder = orderService.requestReturn(orderId, reason, comment);

            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("message", "Return requested successfully");
            response.put("order", updatedOrder);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            System.err.println("Error processing return: " + e.getMessage());
            // e.printStackTrace();
            return ResponseEntity.badRequest().body(createErrorResponse("Error processing return: " + e.getMessage()));
        }
    }

    @PutMapping("/{orderId}/cancel")
    public ResponseEntity<?> cancelOrder(@PathVariable Long orderId) {
        try {
            Optional<Order> orderOpt = orderService.getOrderById(orderId);
            if (orderOpt.isPresent()) {
                Order order = orderOpt.get();
                order.setStatus("cancelled");
                Order updatedOrder = orderService.saveOrder(order);

                // Handle coin deduction for cancellation
                userService.handleReturnCoins(updatedOrder);

                Map<String, Object> response = new HashMap<>();
                response.put("status", "success");
                response.put("message", "Order cancelled successfully");
                response.put("order", updatedOrder);
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            System.err.println("Error processing cancellation: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest()
                    .body(createErrorResponse("Error processing cancellation: " + e.getMessage()));
        }
    }

    @GetMapping("")
    public ResponseEntity<?> getAllOrders() {
        try {
            List<Order> orders = orderService.getAllOrders();
            return ResponseEntity.ok(orders);
        } catch (Exception e) {
            System.err.println("Error fetching all orders: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(createErrorResponse("Error fetching orders: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{orderId}")
    public ResponseEntity<?> deleteOrder(@PathVariable Long orderId) {
        try {
            Optional<Order> orderOpt = orderService.getOrderById(orderId);
            if (orderOpt.isPresent()) {
                Order order = orderOpt.get();

                // Deduct coins before deleting the order
                userService.handleReturnCoins(order);

                orderService.deleteOrder(orderId);

                Map<String, Object> response = new HashMap<>();
                response.put("status", "success");
                response.put("message", "Order deleted successfully");
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            System.err.println("Error deleting order: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(createErrorResponse("Error deleting order: " + e.getMessage()));
        }
    }

    @GetMapping("/{orderId}/coins-info")
    public ResponseEntity<?> getOrderCoinsInfo(@PathVariable Long orderId) {
        try {
            Optional<Order> orderOpt = orderService.getOrderById(orderId);
            if (orderOpt.isPresent()) {
                Order order = orderOpt.get();
                int itemCount = order.getItems().size();
                int coinsEarned = itemCount * 10; // 10 coins per item

                Map<String, Object> response = new HashMap<>();
                response.put("orderId", orderId);
                response.put("itemCount", itemCount);
                response.put("coinsEarned", coinsEarned);
                response.put("status", order.getStatus());

                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            System.err.println("Error fetching order coins info: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest()
                    .body(createErrorResponse("Error fetching order coins info: " + e.getMessage()));
        }
    }

    // Helper methods
    private Map<String, String> createErrorResponse(String errorMessage) {
        Map<String, String> response = new HashMap<>();
        response.put("error", errorMessage);
        return response;
    }

    private String getStringValue(Map<String, Object> map, String key, boolean required) {
        Object value = map.get(key);
        if (required && (value == null || value.toString().trim().isEmpty())) {
            throw new IllegalArgumentException("Required field '" + key + "' is missing or empty");
        }
        return value != null ? value.toString() : null;
    }
}