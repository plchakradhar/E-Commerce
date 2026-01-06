package com.genzfits.service;

import com.genzfits.model.Order;
import com.genzfits.model.User;
import com.genzfits.repository.OrderRepository;
import com.genzfits.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private UserRepository userRepository;

    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    public List<Order> getUserOrders(Long userId) {
        try {
            System.out.println("Getting orders for user ID: " + userId);
            List<Order> orders = orderRepository.findByUser_Id(userId);

            // Sort by createdAt descending
            orders = orders.stream()
                    .sorted((o1, o2) -> {
                        if (o1.getCreatedAt() == null && o2.getCreatedAt() == null)
                            return 0;
                        if (o1.getCreatedAt() == null)
                            return 1;
                        if (o2.getCreatedAt() == null)
                            return -1;
                        return o2.getCreatedAt().compareTo(o1.getCreatedAt());
                    })
                    .collect(Collectors.toList());

            System.out.println("Found " + orders.size() + " orders in database");

            // Debug: Print each order
            for (Order order : orders) {
                System.out.println("Order ID: " + order.getId() +
                        ", User ID: " + (order.getUser() != null ? order.getUser().getId() : "null") +
                        ", Total: " + order.getTotal() +
                        ", Status: " + order.getStatus() +
                        ", Items: " + (order.getItems() != null ? order.getItems().size() : 0));
            }

            return orders;
        } catch (Exception e) {
            System.err.println("Error fetching user orders: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to fetch user orders: " + e.getMessage(), e);
        }
    }

    public Order updateOrderStatus(Long id, String status) {
        try {
            Optional<Order> orderOpt = orderRepository.findById(id);
            if (orderOpt.isPresent()) {
                Order order = orderOpt.get();
                // Set delivered date if status is 'delivered'
                if ("delivered".equalsIgnoreCase(status) && !"delivered".equalsIgnoreCase(order.getStatus())) {
                    order.setDeliveredDate(new java.util.Date());
                }

                order.setStatus(status);
                Order updatedOrder = orderRepository.save(order);
                System.out.println("Order status updated to: " + status + " for order ID: " + id);
                return updatedOrder;
            } else {
                System.err.println("Order not found with ID: " + id);
                return null;
            }
        } catch (Exception e) {
            System.err.println("Error updating order status: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to update order status: " + e.getMessage(), e);
        }
    }

    public Optional<Order> getOrderById(Long id) {
        try {
            return orderRepository.findById(id);
        } catch (Exception e) {
            System.err.println("Error fetching order by ID: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to fetch order: " + e.getMessage(), e);
        }
    }

    public Order saveOrder(Order order) {
        try {
            System.out.println("Saving order to database...");

            // Validate required fields
            if (order.getUser() == null || order.getUser().getId() == null) {
                throw new IllegalArgumentException("Order must have a valid user");
            }

            if (order.getItems() == null || order.getItems().isEmpty()) {
                throw new IllegalArgumentException("Order must have at least one item");
            }

            if (order.getTotal() == null || order.getTotal() <= 0) {
                throw new IllegalArgumentException("Order total must be greater than 0");
            }

            // Ensure the user exists and is managed by JPA
            Long userId = order.getUser().getId();
            Optional<User> userOptional = userRepository.findById(userId);
            if (userOptional.isEmpty()) {
                throw new RuntimeException("User not found with ID: " + userId);
            }

            User managedUser = userOptional.get();
            order.setUser(managedUser);

            // Ensure shipping info is valid
            if (order.getShippingInfo() == null) {
                throw new IllegalArgumentException("Shipping information is required");
            }

            Order savedOrder = orderRepository.save(order);
            System.out.println("Order saved successfully with ID: " + savedOrder.getId());

            return savedOrder;
        } catch (Exception e) {
            System.err.println("Error saving order: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to save order: " + e.getMessage(), e);
        }
    }

    public Order requestReturn(Long orderId, String reason, String comment) {
        try {
            Optional<Order> orderOpt = orderRepository.findById(orderId);
            if (orderOpt.isEmpty()) {
                throw new RuntimeException("Order not found");
            }

            Order order = orderOpt.get();

            // Validate 5-day return window
            if (order.getDeliveredDate() != null) {
                long diffInMillies = Math.abs(new java.util.Date().getTime() - order.getDeliveredDate().getTime());
                long diff = java.util.concurrent.TimeUnit.DAYS.convert(diffInMillies,
                        java.util.concurrent.TimeUnit.MILLISECONDS);

                if (diff > 5) {
                    throw new RuntimeException(
                            "Return window closed. Returns are only allowed within 5 days of delivery.");
                }
            } else if (!"delivered".equalsIgnoreCase(order.getStatus())) {
                // Optional: Only allow return if delivered?
                // For now, if not delivered, maybe allow cancellation instead?
                // But this is return logic. Let's assume must be delivered to return.
                throw new RuntimeException("Product hasn't been delivered yet.");
            }

            order.setStatus("return_requested");
            order.setReturnReason(reason);
            order.setReturnComment(comment);
            order.setReturnRequestDate(new java.util.Date());

            return orderRepository.save(order);
        } catch (Exception e) {
            throw new RuntimeException(e.getMessage());
        }
    }

    public void deleteOrder(Long id) {
        try {
            if (orderRepository.existsById(id)) {
                orderRepository.deleteById(id);
                System.out.println("Order deleted with ID: " + id);
            } else {
                throw new RuntimeException("Order not found with ID: " + id);
            }
        } catch (Exception e) {
            System.err.println("Error deleting order: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to delete order: " + e.getMessage(), e);
        }
    }
}