package com.genzfits.model;

import jakarta.persistence.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import java.util.Date;
import java.util.List;

@Entity
@Table(name = "orders")
@EntityListeners(AuditingEntityListener.class)
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "order_items", joinColumns = @JoinColumn(name = "order_id"))
    private List<OrderItem> items;

    @Column(nullable = false)
    private Double total;

    @Column(nullable = false)
    private String status = "confirmed";

    @Column(nullable = false)
    private String paymentMethod = "upi";

    @Column(nullable = false)
    private String paymentStatus = "completed";

    @CreatedDate
    @Temporal(TemporalType.TIMESTAMP)
    @Column(nullable = false, updatable = false)
    private Date createdAt;

    // Return Lifecycle Fields
    @Column(name = "return_reason")
    private String returnReason;

    @Column(name = "return_comment")
    private String returnComment;

    @Column(name = "return_request_date")
    @Temporal(TemporalType.TIMESTAMP)
    private Date returnRequestDate;

    @Column(name = "return_confirmed_date")
    @Temporal(TemporalType.TIMESTAMP)
    private Date returnConfirmedDate;

    @Column(name = "pickup_date")
    @Temporal(TemporalType.TIMESTAMP)
    private Date pickupDate;

    @Column(name = "refund_date")
    @Temporal(TemporalType.TIMESTAMP)
    private Date refundDate;

    @Column(name = "delivered_date")
    @Temporal(TemporalType.TIMESTAMP)
    private Date deliveredDate;

    @Embedded
    @AttributeOverrides({
        @AttributeOverride(name = "fullName", column = @Column(name = "shipping_full_name", nullable = false)),
        @AttributeOverride(name = "address", column = @Column(name = "shipping_address", nullable = false)),
        @AttributeOverride(name = "city", column = @Column(name = "shipping_city", nullable = false)),
        @AttributeOverride(name = "state", column = @Column(name = "shipping_state", nullable = false)),
        @AttributeOverride(name = "zipCode", column = @Column(name = "shipping_zip_code", nullable = false)),
        @AttributeOverride(name = "village", column = @Column(name = "shipping_village")),
        @AttributeOverride(name = "phone", column = @Column(name = "shipping_phone", nullable = false)),
        @AttributeOverride(name = "email", column = @Column(name = "shipping_email", nullable = false)),
        @AttributeOverride(name = "landmark", column = @Column(name = "shipping_landmark"))
    })
    private ShippingInfo shippingInfo;

    // Add this missing field for coins tracking
    @Column(name = "coins_awarded")
    private Integer coinsAwarded = 0;

    // Constructors
    public Order() {}

    public Order(User user, List<OrderItem> items, Double total, ShippingInfo shippingInfo) {
        this.user = user;
        this.items = items;
        this.total = total;
        this.shippingInfo = shippingInfo;
    }

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public List<OrderItem> getItems() { return items; }
    public void setItems(List<OrderItem> items) { this.items = items; }
    public Double getTotal() { return total; }
    public void setTotal(Double total) { this.total = total; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }
    public String getPaymentStatus() { return paymentStatus; }
    public void setPaymentStatus(String paymentStatus) { this.paymentStatus = paymentStatus; }
    public Date getCreatedAt() { return createdAt; }
    public void setCreatedAt(Date createdAt) { this.createdAt = createdAt; }
    public ShippingInfo getShippingInfo() { return shippingInfo; }
    public void setShippingInfo(ShippingInfo shippingInfo) { this.shippingInfo = shippingInfo; }
    public Integer getCoinsAwarded() { return coinsAwarded; }
    public void setCoinsAwarded(Integer coinsAwarded) { this.coinsAwarded = coinsAwarded; }

    // Return Fields Getters and Setters
    public String getReturnReason() { return returnReason; }
    public void setReturnReason(String returnReason) { this.returnReason = returnReason; }
    
    public String getReturnComment() { return returnComment; }
    public void setReturnComment(String returnComment) { this.returnComment = returnComment; }
    
    public Date getReturnRequestDate() { return returnRequestDate; }
    public void setReturnRequestDate(Date returnRequestDate) { this.returnRequestDate = returnRequestDate; }
    
    public Date getReturnConfirmedDate() { return returnConfirmedDate; }
    public void setReturnConfirmedDate(Date returnConfirmedDate) { this.returnConfirmedDate = returnConfirmedDate; }
    
    public Date getPickupDate() { return pickupDate; }
    public void setPickupDate(Date pickupDate) { this.pickupDate = pickupDate; }
    
    public Date getRefundDate() { return refundDate; }
    public void setRefundDate(Date refundDate) { this.refundDate = refundDate; }

    public Date getDeliveredDate() { return deliveredDate; }
    public void setDeliveredDate(Date deliveredDate) { this.deliveredDate = deliveredDate; }

    // ... rest of the class remains the same (OrderItem and ShippingInfo inner classes)
    @Embeddable
    public static class OrderItem {
        @Column(name = "product_id", nullable = false)
        private Long productId;
        
        @Column(name = "product_name", nullable = false)
        private String productName;
        
        @Column(name = "quantity", nullable = false)
        private Integer quantity;
        
        @Column(name = "price", nullable = false)
        private Double price;
        
        @Column(name = "selected_size")
        private String selectedSize;
        
        @Column(name = "image")
        private String image;

        // Constructors, getters and setters...
        public OrderItem() {}

        public OrderItem(Long productId, String productName, Integer quantity, Double price, String selectedSize, String image) {
            this.productId = productId;
            this.productName = productName;
            this.quantity = quantity;
            this.price = price;
            this.selectedSize = selectedSize;
            this.image = image;
        }

        public Long getProductId() { return productId; }
        public void setProductId(Long productId) { this.productId = productId; }
        public String getProductName() { return productName; }
        public void setProductName(String productName) { this.productName = productName; }
        public Integer getQuantity() { return quantity; }
        public void setQuantity(Integer quantity) { this.quantity = quantity; }
        public Double getPrice() { return price; }
        public void setPrice(Double price) { this.price = price; }
        public String getSelectedSize() { return selectedSize; }
        public void setSelectedSize(String selectedSize) { this.selectedSize = selectedSize; }
        public String getImage() { return image; }
        public void setImage(String image) { this.image = image; }
    }

    @Embeddable
    public static class ShippingInfo {
        @Column(name = "full_name", nullable = false)
        private String fullName;
        
        @Column(name = "address", nullable = false)
        private String address;
        
        @Column(name = "city", nullable = false)
        private String city;
        
        @Column(name = "state", nullable = false)
        private String state;
        
        @Column(name = "zip_code", nullable = false)
        private String zipCode;
        
        @Column(name = "village")
        private String village;
        
        @Column(name = "phone", nullable = false)
        private String phone;
        
        @Column(name = "email", nullable = false)
        private String email;
        
        @Column(name = "landmark")
        private String landmark;

        // Constructors, getters and setters...
        public ShippingInfo() {}

        public ShippingInfo(String fullName, String address, String city, String state, String zipCode, String village, String phone, String email, String landmark) {
            this.fullName = fullName;
            this.address = address;
            this.city = city;
            this.state = state;
            this.zipCode = zipCode;
            this.village = village;
            this.phone = phone;
            this.email = email;
            this.landmark = landmark;
        }

        public String getFullName() { return fullName; }
        public void setFullName(String fullName) { this.fullName = fullName; }
        public String getAddress() { return address; }
        public void setAddress(String address) { this.address = address; }
        public String getCity() { return city; }
        public void setCity(String city) { this.city = city; }
        public String getState() { return state; }
        public void setState(String state) { this.state = state; }
        public String getZipCode() { return zipCode; }
        public void setZipCode(String zipCode) { this.zipCode = zipCode; }
        public String getVillage() { return village; }
        public void setVillage(String village) { this.village = village; }
        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getLandmark() { return landmark; }
        public void setLandmark(String landmark) { this.landmark = landmark; }
    }
}