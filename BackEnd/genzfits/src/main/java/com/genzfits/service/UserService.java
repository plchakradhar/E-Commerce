package com.genzfits.service;

import com.genzfits.model.*;
import com.genzfits.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Random;

@Service
@Transactional
public class UserService {
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private ProductRepository productRepository;
    
    @Autowired
    private CartItemRepository cartItemRepository;
    
    @Autowired
    private OrderRepository orderRepository;
    
    @Autowired
    private OtpRepository otpRepository;
    
    @Autowired
    private CoinHistoryRepository coinHistoryRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private EmailService emailService;

    // Generate referral code using username + next three letters + msl
 // In UserService.java - Replace the generateReferralCode method with this:
    public String generateReferralCode(String username, String mobile) {
        try {
            System.out.println("=== GENERATING REFERRAL CODE ===");
            System.out.println("Username: " + username + ", Mobile: " + mobile);
            
            // Simple and reliable referral code generation
            // Format: First 3 letters of username + next 3 letters + "msl"
            StringBuilder referralCode = new StringBuilder();
            
            // Take first 3 characters of username in uppercase
            String baseUsername = username.length() >= 3 ? username.substring(0, 3) : username;
            referralCode.append(baseUsername.toUpperCase());
            
            // Add next three letters in alphabet for each character
            for (int i = 0; i < Math.min(3, username.length()); i++) {
                char c = username.charAt(i);
                if (Character.isLetter(c)) {
                    char shiftedChar = (char) (c + 3);
                    // Handle wrap-around for letters
                    if (Character.isUpperCase(c)) {
                        if (shiftedChar > 'Z') {
                            shiftedChar = (char) (shiftedChar - 26);
                        }
                    } else {
                        if (shiftedChar > 'z') {
                            shiftedChar = (char) (shiftedChar - 26);
                        }
                    }
                    referralCode.append(shiftedChar);
                } else {
                    // If not a letter, use the character as is
                    referralCode.append(c);
                }
            }
            
            // Add "msl" at the end
            referralCode.append("msl");
            
            String finalCode = referralCode.toString().toUpperCase();
            
            // Ensure the code is unique
            String uniqueCode = finalCode;
            int counter = 1;
            while (userRepository.findByReferralCode(uniqueCode).isPresent()) {
                uniqueCode = finalCode + counter;
                counter++;
                if (counter > 10) {
                    // Fallback: use timestamp
                    uniqueCode = username.toUpperCase() + "MSL" + (System.currentTimeMillis() % 1000);
                    break;
                }
            }
            
            System.out.println("Generated Referral Code: " + uniqueCode);
            return uniqueCode;
            
        } catch (Exception e) {
            System.err.println("Error in generateReferralCode: " + e.getMessage());
            // Fallback: username + MSL + random number
            return username.toUpperCase() + "MSL" + (new Random().nextInt(900) + 100);
        }
    }

    public User saveUser(User user) {
        // Generate referral code for new users
        if (user.getReferralCode() == null) {
            String referralCode = generateReferralCode(user.getUsername(), user.getMobile());
            user.setReferralCode(referralCode);
            System.out.println("=== REFERRAL CODE GENERATED ===");
            System.out.println("Username: " + user.getUsername());
            System.out.println("Mobile: " + user.getMobile());
            System.out.println("Generated Referral Code: " + referralCode);
        }
        
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        User savedUser = userRepository.save(user);
        
        // Debug: Check if referral code was saved
        System.out.println("=== AFTER SAVING USER ===");
        System.out.println("Saved User ID: " + savedUser.getId());
        System.out.println("Saved Referral Code: " + savedUser.getReferralCode());
        
        // Handle referral bonus if referredBy is provided
        if (user.getReferredBy() != null && !user.getReferredBy().isEmpty()) {
            System.out.println("User was referred by: " + user.getReferredBy());
            handleReferralSignup(user.getReferredBy(), savedUser);
        } else {
            // Give welcome bonus of 5 coins for new users without referral
            savedUser.setCoins((savedUser.getCoins() != null ? savedUser.getCoins() : 0) + 5);
            userRepository.save(savedUser);
            
            // Create coin history for welcome bonus
            CoinHistory welcomeHistory = new CoinHistory(
                savedUser, 
                "welcome_bonus", 
                5, 
                "Welcome bonus for signing up", 
                savedUser.getCoins()
            );
            coinHistoryRepository.save(welcomeHistory);
        }
        
        return savedUser;
    }

    // Handle referral signup - give 5 coins to new user and 20 to referrer
    private void handleReferralSignup(String referralCode, User newUser) {
        try {
            Optional<User> referrerOpt = userRepository.findByReferralCode(referralCode);
            if (referrerOpt.isPresent()) {
                User referrer = referrerOpt.get();
                
                // Give 5 coins to new user
                newUser.setCoins((newUser.getCoins() != null ? newUser.getCoins() : 0) + 5);
                newUser.setReferredBy(referralCode);
                userRepository.save(newUser);
                
                // Create coin history for new user
                CoinHistory newUserHistory = new CoinHistory(
                    newUser, 
                    "referral_bonus", 
                    5, 
                    "Welcome bonus for using referral code: " + referralCode, 
                    newUser.getCoins()
                );
                coinHistoryRepository.save(newUserHistory);
                
                // Give 20 coins to referrer
                referrer.setCoins((referrer.getCoins() != null ? referrer.getCoins() : 0) + 20);
                referrer.setReferralEarnings((referrer.getReferralEarnings() != null ? referrer.getReferralEarnings() : 0) + 20);
                userRepository.save(referrer);
                
                // Create coin history for referrer
                CoinHistory referrerHistory = new CoinHistory(
                    referrer, 
                    "referral_bonus", 
                    20, 
                    "Referral bonus - " + newUser.getUsername(), 
                    referrer.getCoins()
                );
                referrerHistory.setReferral(newUser.getUsername());
                coinHistoryRepository.save(referrerHistory);
                
                System.out.println("=== REFERRAL BONUS AWARDED ===");
                System.out.println("New user " + newUser.getUsername() + " received 5 coins");
                System.out.println("Referrer " + referrer.getUsername() + " received 20 coins");
            } else {
                System.out.println("Referrer not found with code: " + referralCode);
                // Give standard welcome bonus if referrer not found
                newUser.setCoins((newUser.getCoins() != null ? newUser.getCoins() : 0) + 5);
                userRepository.save(newUser);
                
                CoinHistory welcomeHistory = new CoinHistory(
                    newUser, 
                    "welcome_bonus", 
                    5, 
                    "Welcome bonus for signing up", 
                    newUser.getCoins()
                );
                coinHistoryRepository.save(welcomeHistory);
            }
        } catch (Exception e) {
            System.err.println("Error handling referral signup: " + e.getMessage());
            e.printStackTrace();
        }
    }

    // Handle order coins - 10 coins per item
    @Transactional
    public void handleOrderCoins(Order order) {
        try {
            User user = order.getUser();
            int itemCount = order.getItems().size();
            int coinsToAdd = itemCount * 10; // 10 coins per item
            
            // Update user coins
            user.setCoins((user.getCoins() != null ? user.getCoins() : 0) + coinsToAdd);
            user.setTotalOrders((user.getTotalOrders() != null ? user.getTotalOrders() : 0) + 1);
            userRepository.save(user);
            
            // Create coin history
            CoinHistory coinHistory = new CoinHistory(
                user,
                "order_bonus",
                coinsToAdd,
                "Order placed #" + order.getId() + " - " + itemCount + " items",
                order.getId(),
                user.getCoins()
            );
            coinHistoryRepository.save(coinHistory);
            
            System.out.println("=== ORDER COINS AWARDED ===");
            System.out.println("User: " + user.getUsername());
            System.out.println("Order ID: " + order.getId());
            System.out.println("Items: " + itemCount);
            System.out.println("Coins awarded: " + coinsToAdd);
            
        } catch (Exception e) {
            System.err.println("Error handling order coins: " + e.getMessage());
            e.printStackTrace();
        }
    }

    // Handle return/refund - deduct coins
    @Transactional
    public void handleReturnCoins(Order order) {
        try {
            User user = order.getUser();
            int itemCount = order.getItems().size();
            int coinsToDeduct = itemCount * 10; // Deduct 10 coins per item
            
            // Ensure we don't go negative
            int currentCoins = user.getCoins() != null ? user.getCoins() : 0;
            int newCoins = Math.max(0, currentCoins - coinsToDeduct);
            
            user.setCoins(newCoins);
            userRepository.save(user);
            
            // Create coin history for deduction
            CoinHistory coinHistory = new CoinHistory(
                user,
                "return_deduction",
                -coinsToDeduct,
                "Order returned #" + order.getId() + " - " + itemCount + " items",
                order.getId(),
                user.getCoins()
            );
            coinHistoryRepository.save(coinHistory);
            
            System.out.println("=== RETURN COINS DEDUCTED ===");
            System.out.println("User: " + user.getUsername());
            System.out.println("Order ID: " + order.getId());
            System.out.println("Items: " + itemCount);
            System.out.println("Coins deducted: " + coinsToDeduct);
            
        } catch (Exception e) {
            System.err.println("Error handling return coins: " + e.getMessage());
            e.printStackTrace();
        }
    }

    // Get coin history for user
    @Transactional(readOnly = true)
    public List<CoinHistory> getCoinHistory(Long userId) {
        try {
            return coinHistoryRepository.findByUserIdOrderByDateDesc(userId);
        } catch (Exception e) {
            System.err.println("Error fetching coin history: " + e.getMessage());
            return new ArrayList<>();
        }
    }

    // Existing methods remain the same...
    public boolean usernameExists(String username) {
        return userRepository.existsByUsername(username);
    }

    public boolean emailExists(String email) {
        return userRepository.existsByEmail(email);
    }

    public boolean mobileExists(String mobile) {
        return userRepository.existsByMobile(mobile);
    }

    public Optional<User> findByIdentifier(String identifier) {
        return userRepository.findByIdentifier(identifier);
    }

    public boolean validateUser(String identifier, String password) {
        Optional<User> userOptional = userRepository.findByIdentifier(identifier);
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            return passwordEncoder.matches(password, user.getPassword());
        }
        return false;
    }

    public Optional<User> getUserByIdentifier(String identifier) {
        return userRepository.findByIdentifier(identifier);
    }

    public Optional<User> getUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public Optional<User> getUserById(Long id) {
        return userRepository.findById(id);
    }

    // FORGOT PASSWORD METHODS
    public String generateAndSendOtp(String email) {
        try {
            Random random = new Random();
            String otp = String.format("%06d", random.nextInt(999999));
            LocalDateTime expiryTime = LocalDateTime.now().plusMinutes(5);
            Otp otpEntity = new Otp(email, otp, expiryTime);
            otpRepository.save(otpEntity);
            boolean emailSent = emailService.sendOtpEmail(email, otp);
            if (!emailSent) {
                throw new RuntimeException("Failed to send OTP email");
            }
            return otp;
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate and send OTP: " + e.getMessage());
        }
    }

    public boolean verifyOtp(String email, String otp) {
        try {
            Optional<Otp> otpOptional = otpRepository.findByEmailAndOtpAndUsedFalse(email, otp);
            if (!otpOptional.isPresent()) {
                return false;
            }
            Otp otpEntity = otpOptional.get();
            if (otpEntity.getExpiryTime().isBefore(LocalDateTime.now())) {
                otpRepository.delete(otpEntity);
                return false;
            }
            otpRepository.markOtpAsUsed(email, otp);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    public boolean resetPassword(String email, String newPassword) {
        try {
            Optional<User> userOptional = userRepository.findByEmail(email);
            if (userOptional.isPresent()) {
                User user = userOptional.get();
                user.setPassword(passwordEncoder.encode(newPassword));
                userRepository.save(user);
                return true;
            }
            return false;
        } catch (Exception e) {
            return false;
        }
    }

    // Wishlist methods
    @Transactional
    public boolean addToWishlist(Long userId, Long productId) {
        try {
            Optional<User> userOpt = userRepository.findById(userId);
            Optional<Product> productOpt = productRepository.findById(productId);
            if (userOpt.isPresent() && productOpt.isPresent()) {
                User user = userOpt.get();
                Product product = productOpt.get();
                if (user.getWishlist() == null) {
                    user.setWishlist(new ArrayList<>());
                }
                if (!user.getWishlist().contains(product)) {
                    user.getWishlist().add(product);
                    userRepository.save(user);
                    return true;
                }
            }
            return false;
        } catch (Exception e) {
            return false;
        }
    }

    @Transactional
    public boolean removeFromWishlist(Long userId, Long productId) {
        try {
            Optional<User> userOpt = userRepository.findById(userId);
            if (userOpt.isPresent()) {
                User user = userOpt.get();
                if (user.getWishlist() == null) {
                    user.setWishlist(new ArrayList<>());
                }
                boolean removed = user.getWishlist().removeIf(p -> p.getId().equals(productId));
                if (removed) {
                    userRepository.save(user);
                    return true;
                }
            }
            return false;
        } catch (Exception e) {
            return false;
        }
    }

    @Transactional(readOnly = true)
    public List<Product> getWishlist(Long userId) {
        try {
            Optional<User> userOpt = userRepository.findById(userId);
            if (userOpt.isPresent()) {
                User user = userOpt.get();
                return user.getWishlist() != null ? user.getWishlist() : new ArrayList<>();
            }
            return new ArrayList<>();
        } catch (Exception e) {
            return new ArrayList<>();
        }
    }

    @Transactional
    public void clearWishlist(Long userId) {
        try {
            Optional<User> userOpt = userRepository.findById(userId);
            if (userOpt.isPresent()) {
                User user = userOpt.get();
                if (user.getWishlist() == null) {
                    user.setWishlist(new ArrayList<>());
                }
                user.getWishlist().clear();
                userRepository.save(user);
            }
        } catch (Exception e) {
            // Log exception if needed
        }
    }

    // Cart methods
    @Transactional
    public boolean addToCart(Long userId, Long productId, int quantity, String selectedSize) {
        try {
            Optional<User> userOpt = userRepository.findById(userId);
            Optional<Product> productOpt = productRepository.findById(productId);
            if (userOpt.isPresent() && productOpt.isPresent()) {
                User user = userOpt.get();
                Product product = productOpt.get();
                Optional<CartItem> existingItem = cartItemRepository.findByUserAndProductAndSelectedSize(user, product, selectedSize);
                if (existingItem.isPresent()) {
                    CartItem item = existingItem.get();
                    item.setQuantity(item.getQuantity() + quantity);
                    cartItemRepository.save(item);
                } else {
                    CartItem newItem = new CartItem();
                    newItem.setUser(user);
                    newItem.setProduct(product);
                    newItem.setQuantity(quantity);
                    newItem.setSelectedSize(selectedSize);
                    cartItemRepository.save(newItem);
                }
                return true;
            }
            return false;
        } catch (Exception e) {
            return false;
        }
    }

    @Transactional
    public boolean updateCartItem(Long userId, Long cartItemId, int quantity) {
        try {
            Optional<CartItem> cartItemOpt = cartItemRepository.findById(cartItemId);
            if (cartItemOpt.isPresent()) {
                CartItem item = cartItemOpt.get();
                if (item.getUser().getId().equals(userId)) {
                    if (quantity <= 0) {
                        cartItemRepository.delete(item);
                    } else {
                        item.setQuantity(quantity);
                        cartItemRepository.save(item);
                    }
                    return true;
                }
            }
            return false;
        } catch (Exception e) {
            return false;
        }
    }

    @Transactional
    public boolean removeFromCart(Long userId, Long cartItemId) {
        try {
            Optional<CartItem> cartItemOpt = cartItemRepository.findById(cartItemId);
            if (cartItemOpt.isPresent()) {
                CartItem item = cartItemOpt.get();
                if (item.getUser().getId().equals(userId)) {
                    cartItemRepository.delete(item);
                    return true;
                }
            }
            return false;
        } catch (Exception e) {
            return false;
        }
    }

    @Transactional(readOnly = true)
    public List<CartItem> getCart(Long userId) {
        try {
            return cartItemRepository.findByUser_Id(userId);
        } catch (Exception e) {
            return new ArrayList<>();
        }
    }

    @Transactional
    public void clearCart(Long userId) {
        try {
            List<CartItem> cartItems = cartItemRepository.findByUser_Id(userId);
            cartItemRepository.deleteAll(cartItems);
        } catch (Exception e) {
            // Log exception if needed
        }
    }

    @Transactional
    public User updateUserStatus(Long userId, boolean active) {
        try {
            Optional<User> userOpt = userRepository.findById(userId);
            if (userOpt.isPresent()) {
                User user = userOpt.get();
                user.setActive(active);
                return userRepository.save(user);
            }
            return null;
        } catch (Exception e) {
            return null;
        }
    }

    @Transactional
    public User updateUser(Long userId, User userDetails) {
        try {
            Optional<User> userOpt = userRepository.findById(userId);
            if (userOpt.isPresent()) {
                User user = userOpt.get();
                user.setFullName(userDetails.getFullName());
                user.setUsername(userDetails.getUsername());
                user.setEmail(userDetails.getEmail());
                user.setMobile(userDetails.getMobile());
                user.setIsAdmin(userDetails.getIsAdmin());
                return userRepository.save(user);
            }
            return null;
        } catch (Exception e) {
            return null;
        }
    }

    @Transactional(readOnly = true)
    public int getCartCount(Long userId) {
        try {
            List<CartItem> cartItems = cartItemRepository.findByUser_Id(userId);
            return cartItems.stream().mapToInt(CartItem::getQuantity).sum();
        } catch (Exception e) {
            return 0;
        }
    }

    @Transactional(readOnly = true)
    public boolean isProductInCart(Long userId, Long productId, String size) {
        try {
            Optional<User> userOpt = userRepository.findById(userId);
            Optional<Product> productOpt = productRepository.findById(productId);
            if (userOpt.isPresent() && productOpt.isPresent()) {
                User user = userOpt.get();
                Product product = productOpt.get();
                Optional<CartItem> existingItem = cartItemRepository.findByUserAndProductAndSelectedSize(user, product, size);
                return existingItem.isPresent();
            }
            return false;
        } catch (Exception e) {
            return false;
        }
    }
}