package com.genzfits.controller;

import com.genzfits.model.User;
import com.genzfits.model.Product;
import com.genzfits.model.Order;
import com.genzfits.service.UserService;
import com.genzfits.service.ProductService;
import com.genzfits.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.io.IOException;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private UserService userService;

    @Autowired
    private ProductService productService;

    @Autowired
    private OrderService orderService;

    private boolean isAdminLoggedIn(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        System.out.println("=== ADMIN AUTH CHECK ===");
        System.out.println("Session exists: " + (session != null));
        
        if (session != null) {
            User user = (User) session.getAttribute("user");
            System.out.println("User in session: " + (user != null));
            if (user != null) {
                System.out.println("User ID: " + user.getId());
                System.out.println("User Email: " + user.getEmail());
                System.out.println("Is Admin: " + user.getIsAdmin());
            }
            return user != null && Boolean.TRUE.equals(user.getIsAdmin());
        }
        System.out.println("No valid admin session found");
        return false;
    }

    @GetMapping("/debug-session")
    public ResponseEntity<?> debugSession(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        Map<String, Object> debugInfo = new HashMap<>();
        
        debugInfo.put("sessionExists", session != null);
        if (session != null) {
            User user = (User) session.getAttribute("user");
            debugInfo.put("userInSession", user != null);
            if (user != null) {
                debugInfo.put("userId", user.getId());
                debugInfo.put("userEmail", user.getEmail());
                debugInfo.put("userName", user.getUsername());
                debugInfo.put("isAdmin", user.getIsAdmin());
            }
            debugInfo.put("sessionId", session.getId());
        }
        
        System.out.println("Debug Session Info: " + debugInfo);
        return ResponseEntity.ok(debugInfo);
    }

    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers(HttpServletRequest request) {
        System.out.println("=== ADMIN USERS ENDPOINT CALLED ===");
        
        if (!isAdminLoggedIn(request)) {
            System.out.println("UNAUTHORIZED ACCESS ATTEMPT TO USERS ENDPOINT");
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Unauthorized");
            errorResponse.put("message", "Admin access required");
            return ResponseEntity.status(401).body(errorResponse);
        }
        
        try {
            List<User> users = userService.getAllUsers();
            System.out.println("Successfully retrieved users count: " + users.size());
            
            if (!users.isEmpty()) {
                System.out.println("First 3 users:");
                for (int i = 0; i < Math.min(3, users.size()); i++) {
                    User u = users.get(i);
                    System.out.println("User " + i + ": ID=" + u.getId() + ", Email=" + u.getEmail() + ", Admin=" + u.getIsAdmin());
                }
            }
            
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            System.out.println("Error fetching users: " + e.getMessage());
            e.printStackTrace();
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Server Error");
            errorResponse.put("message", "Failed to fetch users: " + e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id, HttpServletRequest request) {
        if (!isAdminLoggedIn(request)) {
            return ResponseEntity.status(401).body("Unauthorized");
        }
        try {
            userService.deleteUser(id);
            Map<String, String> response = new HashMap<>();
            response.put("message", "User deleted successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error deleting user: " + e.getMessage());
        }
    }

    @GetMapping("/products")
    public ResponseEntity<List<Product>> getAllProducts() {
        System.out.println("=== PRODUCTS ENDPOINT CALLED ===");
        List<Product> products = productService.getAllProducts();
        System.out.println("Retrieved products count: " + products.size());
        
        // Debug: Print first few products with their images
        if (!products.isEmpty()) {
            for (int i = 0; i < Math.min(3, products.size()); i++) {
                Product p = products.get(i);
                System.out.println("Product " + i + ": " + p.getName() + " - Images: " + p.getImages());
            }
        }
        
        return ResponseEntity.ok(products);
    }

    @GetMapping("/products/{id}")
    public ResponseEntity<Product> getProductById(@PathVariable Long id) {
        Optional<Product> product = productService.getProductById(id);
        if (product.isPresent()) {
            Product p = product.get();
            System.out.println("=== PRODUCT DETAILS ===");
            System.out.println("Product ID: " + p.getId());
            System.out.println("Product Name: " + p.getName());
            System.out.println("Product Images: " + p.getImages());
            return ResponseEntity.ok(p);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/products/category/{category}")
    public ResponseEntity<List<Product>> getProductsByCategory(@PathVariable String category) {
        return ResponseEntity.ok(productService.getProductsByCategory(category));
    }

    @GetMapping("/products/search")
    public List<Product> searchProducts(@RequestParam String query) {
        return productService.searchProducts(query);
    }

    @PostMapping("/products")
    public ResponseEntity<?> addProduct(@RequestBody Product product, HttpServletRequest request) {
        if (!isAdminLoggedIn(request)) {
            return ResponseEntity.status(401).body("Unauthorized");
        }
        try {
            if (product.getImages() == null || product.getImages().isEmpty()) {
                return ResponseEntity.badRequest().body("At least one image is required");
            }
            
            System.out.println("=== ADDING PRODUCT ===");
            System.out.println("Product Name: " + product.getName());
            System.out.println("Product Images: " + product.getImages());
            
            Product saved = productService.saveProduct(product);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error adding product: " + e.getMessage());
        }
    }

    @PutMapping("/products/{id}")
    public ResponseEntity<?> updateProduct(@PathVariable Long id, @RequestBody Product product, HttpServletRequest request) {
        if (!isAdminLoggedIn(request)) {
            return ResponseEntity.status(401).body("Unauthorized");
        }
        try {
            Product updated = productService.updateProduct(id, product);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error updating product: " + e.getMessage());
        }
    }

    @DeleteMapping("/products/{id}")
    public ResponseEntity<?> deleteProduct(@PathVariable Long id, HttpServletRequest request) {
        if (!isAdminLoggedIn(request)) {
            return ResponseEntity.status(401).body("Unauthorized");
        }
        try {
            productService.deleteProduct(id);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Product deleted successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error deleting product: " + e.getMessage());
        }
    }

    @GetMapping("/orders")
    public ResponseEntity<?> getAllOrders(HttpServletRequest request) {
        System.out.println("=== ADMIN ORDERS ENDPOINT CALLED ===");
        
        if (!isAdminLoggedIn(request)) {
            System.out.println("UNAUTHORIZED ACCESS ATTEMPT TO ORDERS ENDPOINT");
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Unauthorized");
            errorResponse.put("message", "Admin access required");
            return ResponseEntity.status(401).body(errorResponse);
        }
        
        try {
            List<Order> orders = orderService.getAllOrders();
            System.out.println("Successfully retrieved orders count: " + orders.size());
            
            if (!orders.isEmpty()) {
                System.out.println("First 3 orders:");
                for (int i = 0; i < Math.min(3, orders.size()); i++) {
                    Order o = orders.get(i);
                    System.out.println("Order " + i + ": ID=" + o.getId() + ", Total=" + o.getTotal() + ", Status=" + o.getStatus());
                }
            }
            
            return ResponseEntity.ok(orders);
        } catch (Exception e) {
            System.out.println("Error fetching orders: " + e.getMessage());
            e.printStackTrace();
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Server Error");
            errorResponse.put("message", "Failed to fetch orders: " + e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    @PutMapping("/orders/{id}")
    public ResponseEntity<?> updateOrderStatus(@PathVariable Long id, @RequestBody Map<String, String> status, HttpServletRequest request) {
        if (!isAdminLoggedIn(request)) {
            return ResponseEntity.status(401).body("Unauthorized");
        }
        try {
            Order updated = orderService.updateOrderStatus(id, status.get("status"));
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error updating order: " + e.getMessage());
        }
    }

    // Add this debug endpoint to check uploaded files
    @GetMapping("/debug-media")
    public ResponseEntity<?> debugMediaFiles() {
        try {
            Path uploadPath = Paths.get("src/main/resources/static/media/");
            Path targetPath = Paths.get("target/classes/static/media/");
            Path rootPath = Paths.get("media/");
            
            Map<String, Object> debugInfo = new HashMap<>();
            
            // Check source directory
            if (Files.exists(uploadPath)) {
                try (Stream<Path> files = Files.list(uploadPath)) {
                    List<String> sourceFiles = files
                        .map(path -> path.getFileName().toString())
                        .collect(Collectors.toList());
                    debugInfo.put("sourceFiles", sourceFiles);
                    debugInfo.put("sourcePath", uploadPath.toAbsolutePath().toString());
                }
            } else {
                debugInfo.put("sourceFiles", "Directory does not exist");
            }
            
            // Check target directory
            if (Files.exists(targetPath)) {
                try (Stream<Path> files = Files.list(targetPath)) {
                    List<String> targetFiles = files
                        .map(path -> path.getFileName().toString())
                        .collect(Collectors.toList());
                    debugInfo.put("targetFiles", targetFiles);
                    debugInfo.put("targetPath", targetPath.toAbsolutePath().toString());
                }
            } else {
                debugInfo.put("targetFiles", "Directory does not exist");
            }
            
            // Check root media directory
            if (Files.exists(rootPath)) {
                try (Stream<Path> files = Files.list(rootPath)) {
                    List<String> rootFiles = files
                        .map(path -> path.getFileName().toString())
                        .collect(Collectors.toList());
                    debugInfo.put("rootFiles", rootFiles);
                    debugInfo.put("rootPath", rootPath.toAbsolutePath().toString());
                }
            } else {
                debugInfo.put("rootFiles", "Directory does not exist");
            }
            
            return ResponseEntity.ok(debugInfo);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error reading media directories: " + e.getMessage());
        }
    }

    @PostMapping("/products/upload-images")
    public ResponseEntity<?> uploadProductImages(@RequestParam("files") MultipartFile[] files, HttpServletRequest request) {
        if (!isAdminLoggedIn(request)) {
            return ResponseEntity.status(401).body("Unauthorized");
        }
        try {
            List<String> mediaUrls = new ArrayList<>();
            
            // Create multiple upload directories
            Path[] uploadPaths = {
                Paths.get("src/main/resources/static/media/"),
                Paths.get("target/classes/static/media/"),
                Paths.get("media/")  // Root directory
            };

            for (MultipartFile file : files) {
                // Accept both images and videos
                if (!file.getContentType().startsWith("image/") && !file.getContentType().startsWith("video/")) {
                    return ResponseEntity.badRequest().body("Only image and video files are allowed");
                }
                
                // Set file size limit to 50MB
                if (file.getSize() > 50 * 1024 * 1024) {
                    return ResponseEntity.badRequest().body("File size exceeds 50MB");
                }
                
                // Generate unique filename with original extension
                String originalFileName = file.getOriginalFilename();
                String fileExtension = "";
                if (originalFileName != null && originalFileName.contains(".")) {
                    fileExtension = originalFileName.substring(originalFileName.lastIndexOf("."));
                }
                
                // Create timestamp-based filename to avoid conflicts
                String timestamp = String.valueOf(System.currentTimeMillis());
                String randomSuffix = String.valueOf((int)(Math.random() * 1000));
                String fileName = timestamp + "_" + randomSuffix + fileExtension;
                
                // Save to all directories
                for (Path uploadPath : uploadPaths) {
                    if (!Files.exists(uploadPath)) {
                        Files.createDirectories(uploadPath);
                        System.out.println("Created directory: " + uploadPath.toAbsolutePath());
                    }
                    
                    Path filePath = uploadPath.resolve(fileName);
                    Files.copy(file.getInputStream(), filePath);
                    System.out.println("Saved file to: " + filePath.toAbsolutePath());
                }
                
                // Return URL that matches the static resource path
                String mediaUrl = "media/" + fileName; // No leading slash for better compatibility
                mediaUrls.add(mediaUrl);
                
                System.out.println("=== FILE UPLOAD SUCCESS ===");
                System.out.println("Original filename: " + originalFileName);
                System.out.println("Saved as: " + fileName);
                System.out.println("Media URL: " + mediaUrl);
                System.out.println("File size: " + file.getSize() + " bytes");
                System.out.println("Content type: " + file.getContentType());
            }

            return ResponseEntity.ok(mediaUrls);
        } catch (Exception e) {
            System.err.println("Error uploading media: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Error uploading media: " + e.getMessage());
        }
    }

    // Enhanced media file serving from multiple locations
    @GetMapping("/media/{filename:.+}")
    public ResponseEntity<byte[]> getMediaFile(@PathVariable String filename) {
        try {
            // Try multiple possible locations in order of priority
            Path[] possiblePaths = {
                Paths.get("media/" + filename),                    // Root media directory
                Paths.get("src/main/resources/static/media/" + filename),
                Paths.get("target/classes/static/media/" + filename),
                Paths.get("./media/" + filename)
            };
            
            Path filePath = null;
            for (Path path : possiblePaths) {
                if (Files.exists(path) && !Files.isDirectory(path)) {
                    filePath = path;
                    System.out.println("✅ Found file at: " + path.toAbsolutePath());
                    break;
                } else {
                    System.out.println("❌ File not found at: " + path.toAbsolutePath());
                }
            }
            
            if (filePath == null || !Files.exists(filePath)) {
                System.out.println("❌ File not found in any location: " + filename);
                return ResponseEntity.notFound().build();
            }
            
            byte[] fileBytes = Files.readAllBytes(filePath);
            String mimeType = Files.probeContentType(filePath);
            if (mimeType == null) {
                // Fallback MIME types
                if (filename.toLowerCase().endsWith(".mp4")) mimeType = "video/mp4";
                else if (filename.toLowerCase().endsWith(".jpg") || filename.toLowerCase().endsWith(".jpeg")) mimeType = "image/jpeg";
                else if (filename.toLowerCase().endsWith(".png")) mimeType = "image/png";
                else if (filename.toLowerCase().endsWith(".gif")) mimeType = "image/gif";
                else if (filename.toLowerCase().endsWith(".webp")) mimeType = "image/webp";
                else mimeType = "application/octet-stream";
            }
            
            System.out.println("✅ Serving media file: " + filename + " with type: " + mimeType + " size: " + fileBytes.length + " bytes");
            return ResponseEntity.ok()
                .header("Content-Type", mimeType)
                .header("Cache-Control", "public, max-age=3600")
                .body(fileBytes);
        } catch (IOException e) {
            System.err.println("❌ Error reading file: " + filename + " - " + e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }
}