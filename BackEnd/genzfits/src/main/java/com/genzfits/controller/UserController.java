package com.genzfits.controller;

import com.genzfits.model.CoinHistory;
import com.genzfits.model.User;
import com.genzfits.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
@RestController
@RequestMapping("/api/users")
public class UserController {
    @Autowired
    private UserService userService;

    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@RequestBody User user, HttpServletRequest request) {
        Map<String, Object> response = new HashMap<>();
        try {
            if (userService.usernameExists(user.getUsername())) {
                response.put("status", "error");
                response.put("message", "Username already exists");
                return ResponseEntity.badRequest().body(response);
            }
            if (userService.emailExists(user.getEmail())) {
                response.put("status", "error");
                response.put("message", "Email already exists");
                return ResponseEntity.badRequest().body(response);
            }
            if (userService.mobileExists(user.getMobile())) {
                response.put("status", "error");
                response.put("message", "Mobile number already exists");
                return ResponseEntity.badRequest().body(response);
            }
            
            User savedUser = userService.saveUser(user);
            Optional<User> completeUser = userService.getUserById(savedUser.getId());
            HttpSession session = request.getSession();
            session.setAttribute("user", completeUser.orElse(savedUser));
            session.setMaxInactiveInterval(600);
            
            response.put("status", "success");
            response.put("message", "User registered successfully!");
            response.put("data", completeUser.orElse(savedUser));
            response.put("coins", completeUser.orElse(savedUser).getCoins());
            response.put("referralCode", completeUser.orElse(savedUser).getReferralCode());
            response.put("sessionId", session.getId());
            
            System.out.println("=== USER SIGNUP COMPLETE ===");
            System.out.println("User ID: " + completeUser.get().getId());
            System.out.println("Username: " + completeUser.get().getUsername());
            System.out.println("Referral Code: " + completeUser.get().getReferralCode());
            System.out.println("Coins: " + completeUser.get().getCoins());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("status", "error");
            response.put("message", "Server error, try again later.");
            return ResponseEntity.internalServerError().body(response);
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody Map<String, String> loginRequest, HttpServletRequest request) {
        Map<String, Object> response = new HashMap<>();
        try {
            String identifier = loginRequest.get("identifier");
            String password = loginRequest.get("password");
            if (identifier == null || identifier.isEmpty() || password == null || password.isEmpty()) {
                response.put("status", "error");
                response.put("message", "Identifier and password are required");
                return ResponseEntity.badRequest().body(response);
            }
            boolean isValid = userService.validateUser(identifier, password);
            if (isValid) {
                Optional<User> userOptional = userService.getUserByIdentifier(identifier);
                if (userOptional.isPresent()) {
                    Optional<User> completeUser = userService.getUserById(userOptional.get().getId());
                    HttpSession session = request.getSession();
                    session.setAttribute("user", completeUser.orElse(userOptional.get()));
                    session.setMaxInactiveInterval(600);
                    
                    response.put("status", "success");
                    response.put("message", "Login successful");
                    response.put("data", completeUser.orElse(userOptional.get()));
                    response.put("coins", completeUser.orElse(userOptional.get()).getCoins());
                    response.put("referralCode", completeUser.orElse(userOptional.get()).getReferralCode());
                    response.put("sessionId", session.getId());
                    
                    System.out.println("=== USER LOGIN COMPLETE ===");
                    System.out.println("User ID: " + completeUser.get().getId());
                    System.out.println("Username: " + completeUser.get().getUsername());
                    System.out.println("Referral Code: " + completeUser.get().getReferralCode());
                    System.out.println("Coins: " + completeUser.get().getCoins());
                    
                    return ResponseEntity.ok(response);
                }
            }
            response.put("status", "error");
            response.put("message", "Invalid credentials");
            return ResponseEntity.status(401).body(response);
        } catch (Exception e) {
            response.put("status", "error");
            response.put("message", "Server error, try again later.");
            return ResponseEntity.internalServerError().body(response);
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logoutUser(HttpServletRequest request) {
        Map<String, Object> response = new HashMap<>();
        try {
            HttpSession session = request.getSession(false);
            if (session != null) {
                session.invalidate();
            }
            response.put("status", "success");
            response.put("message", "Logged out successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("status", "error");
            response.put("message", "Error during logout");
            return ResponseEntity.internalServerError().body(response);
        }
    }

    @GetMapping("/check-session")
    public ResponseEntity<?> checkSession(HttpServletRequest request) {
        Map<String, Object> response = new HashMap<>();
        HttpSession session = request.getSession(false);
        
        if (session != null && session.getAttribute("user") != null) {
            User sessionUser = (User) session.getAttribute("user");
            Optional<User> freshUser = userService.getUserById(sessionUser.getId());
            if (freshUser.isPresent()) {
                session.setAttribute("user", freshUser.get());
                response.put("status", "active");
                response.put("user", freshUser.get());
                response.put("coins", freshUser.get().getCoins());
                response.put("referralCode", freshUser.get().getReferralCode());
                response.put("sessionId", session.getId());
                
                System.out.println("=== SESSION CHECK ===");
                System.out.println("User: " + freshUser.get().getUsername());
                System.out.println("Referral Code: " + freshUser.get().getReferralCode());
                System.out.println("Coins: " + freshUser.get().getCoins());
                
                return ResponseEntity.ok(response);
            }
        }
        
        // Return 200 with inactive status instead of 401
        response.put("status", "inactive");
        response.put("message", "No active session");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{userId}/coin-history")
    public ResponseEntity<?> getCoinHistory(@PathVariable Long userId, HttpServletRequest request) {
        Map<String, Object> response = new HashMap<>();
        try {
            HttpSession session = request.getSession(false);
            if (session == null || session.getAttribute("user") == null) {
                response.put("status", "error");
                response.put("message", "Unauthorized");
                return ResponseEntity.status(401).body(response);
            }
            
            User currentUser = (User) session.getAttribute("user");
            if (!currentUser.getId().equals(userId) && !currentUser.getIsAdmin()) {
                response.put("status", "error");
                response.put("message", "Forbidden");
                return ResponseEntity.status(403).body(response);
            }
            
            List<CoinHistory> coinHistory = userService.getCoinHistory(userId);
            response.put("status", "success");
            response.put("coinHistory", coinHistory);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("status", "error");
            response.put("message", "Error fetching coin history");
            return ResponseEntity.internalServerError().body(response);
        }
    }

    @PutMapping("/{id}/address")
    public ResponseEntity<?> updateUserAddress(@PathVariable Long id, @RequestBody Map<String, String> addressData, HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session == null || session.getAttribute("user") == null) {
            return ResponseEntity.status(401).body("Unauthorized");
        }
        User currentUser = (User) session.getAttribute("user");
        if (!currentUser.getId().equals(id)) {
            return ResponseEntity.status(403).body("Forbidden");
        }
        try {
            Optional<User> userOptional = userService.getUserById(id);
            if (userOptional.isPresent()) {
                User user = userOptional.get();
                user.setAddress(addressData.get("address"));
                user.setVillage(addressData.get("village"));
                user.setCity(addressData.get("city"));
                user.setState(addressData.get("state"));
                user.setZipCode(addressData.get("zipCode"));
                user.setLandmark(addressData.get("landmark"));
                User updated = userService.saveUser(user);
                session.setAttribute("user", updated);
                return ResponseEntity.ok(updated);
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error updating address");
        }
    }

    @PostMapping("/send-reset-otp")
    public ResponseEntity<?> sendResetOtp(@RequestBody Map<String, String> request) {
        Map<String, Object> response = new HashMap<>();
        try {
            String email = request.get("email");
            if (email == null || email.isEmpty()) {
                response.put("status", "error");
                response.put("message", "Email is required");
                return ResponseEntity.badRequest().body(response);
            }
            if (!email.matches("^[A-Za-z0-9+_.-]+@(.+)$")) {
                response.put("status", "error");
                response.put("message", "Please enter a valid email address");
                return ResponseEntity.badRequest().body(response);
            }
            Optional<User> userOptional = userService.getUserByEmail(email);
            if (!userOptional.isPresent()) {
                response.put("status", "error");
                response.put("message", "No account found with this email address");
                return ResponseEntity.status(404).body(response);
            }
            userService.generateAndSendOtp(email);
            response.put("status", "success");
            response.put("message", "OTP sent successfully to your email address. Please check your inbox and spam/junk folder.");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("status", "error");
            response.put("message", "Failed to send OTP. Please try again later.");
            return ResponseEntity.internalServerError().body(response);
        }
    }

    @PostMapping("/verify-reset-otp")
    public ResponseEntity<?> verifyResetOtp(@RequestBody Map<String, String> request) {
        Map<String, Object> response = new HashMap<>();
        try {
            String email = request.get("email");
            String otp = request.get("otp");
            if (email == null || email.isEmpty() || otp == null || otp.isEmpty()) {
                response.put("status", "error");
                response.put("message", "Email and OTP are required");
                return ResponseEntity.badRequest().body(response);
            }
            boolean isValid = userService.verifyOtp(email, otp);
            if (isValid) {
                response.put("status", "success");
                response.put("message", "OTP verified successfully");
                return ResponseEntity.ok(response);
            } else {
                response.put("status", "error");
                response.put("message", "Invalid or expired OTP");
                return ResponseEntity.status(400).body(response);
            }
        } catch (Exception e) {
            response.put("status", "error");
            response.put("message", "OTP verification failed");
            return ResponseEntity.internalServerError().body(response);
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> request) {
        Map<String, Object> response = new HashMap<>();
        try {
            String email = request.get("email");
            String newPassword = request.get("newPassword");
            String confirmPassword = request.get("confirmPassword");
            if (email == null || email.isEmpty() || newPassword == null || newPassword.isEmpty()) {
                response.put("status", "error");
                response.put("message", "Email and new password are required");
                return ResponseEntity.badRequest().body(response);
            }
            if (!newPassword.equals(confirmPassword)) {
                response.put("status", "error");
                response.put("message", "Passwords do not match");
                return ResponseEntity.badRequest().body(response);
            }
            if (newPassword.length() < 6) {
                response.put("status", "error");
                response.put("message", "Password must be at least 6 characters long");
                return ResponseEntity.badRequest().body(response);
            }
            boolean success = userService.resetPassword(email, newPassword);
            if (success) {
                response.put("status", "success");
                response.put("message", "Password reset successfully");
                return ResponseEntity.ok(response);
            } else {
                response.put("status", "error");
                response.put("message", "Failed to reset password");
                return ResponseEntity.status(400).body(response);
            }
        } catch (Exception e) {
            response.put("status", "error");
            response.put("message", "Password reset failed");
            return ResponseEntity.internalServerError().body(response);
        }
    }
    @GetMapping("/{userId}/referral-link")
    public ResponseEntity<?> getReferralLink(@PathVariable Long userId, HttpServletRequest request) {
        Map<String, Object> response = new HashMap<>();
        try {
            HttpSession session = request.getSession(false);
            if (session == null || session.getAttribute("user") == null) {
                response.put("status", "error");
                response.put("message", "Unauthorized");
                return ResponseEntity.status(401).body(response);
            }
            
            Optional<User> userOpt = userService.getUserById(userId);
            if (userOpt.isPresent()) {
                User user = userOpt.get();
                
                // Ensure user has a referral code
                if (user.getReferralCode() == null || user.getReferralCode().isEmpty()) {
                    // Generate referral code if missing
                    String newReferralCode = userService.generateReferralCode(user.getUsername(), user.getMobile());
                    user.setReferralCode(newReferralCode);
                    user = userService.saveUser(user);
                    System.out.println("Generated missing referral code: " + newReferralCode);
                }
                
                String referralLink = "http://localhost:5173/signup?ref=" + user.getReferralCode();
                
                response.put("status", "success");
                response.put("referralLink", referralLink);
                response.put("referralCode", user.getReferralCode());
                return ResponseEntity.ok(response);
            } else {
                response.put("status", "error");
                response.put("message", "User not found");
                return ResponseEntity.status(404).body(response);
            }
        } catch (Exception e) {
            response.put("status", "error");
            response.put("message", "Error generating referral link");
            return ResponseEntity.internalServerError().body(response);
        }
    }
}