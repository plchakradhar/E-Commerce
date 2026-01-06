package com.genzfits.model;

import jakarta.persistence.*;
import org.springframework.data.annotation.CreatedDate;
import java.util.Date;

@Entity
@Table(name = "coin_history")
public class CoinHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String type; // 'earned', 'spent', 'referral_bonus', 'order_bonus', 'welcome_bonus', 'return_deduction'

    @Column(nullable = false)
    private Integer amount;

    @Column(nullable = false)
    private String description;

    @Column
    private Long orderId;

    @Column
    private String referral;

    @Column(nullable = false)
    private Integer balanceAfter;

    @CreatedDate
    @Temporal(TemporalType.TIMESTAMP)
    @Column(nullable = false, updatable = false)
    private Date date;

    // Constructors
    public CoinHistory() {}

    public CoinHistory(User user, String type, Integer amount, String description, Integer balanceAfter) {
        this.user = user;
        this.type = type;
        this.amount = amount;
        this.description = description;
        this.balanceAfter = balanceAfter;
        this.date = new Date();
    }

    public CoinHistory(User user, String type, Integer amount, String description, Long orderId, Integer balanceAfter) {
        this.user = user;
        this.type = type;
        this.amount = amount;
        this.description = description;
        this.orderId = orderId;
        this.balanceAfter = balanceAfter;
        this.date = new Date();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public Integer getAmount() { return amount; }
    public void setAmount(Integer amount) { this.amount = amount; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Long getOrderId() { return orderId; }
    public void setOrderId(Long orderId) { this.orderId = orderId; }
    public String getReferral() { return referral; }
    public void setReferral(String referral) { this.referral = referral; }
    public Integer getBalanceAfter() { return balanceAfter; }
    public void setBalanceAfter(Integer balanceAfter) { this.balanceAfter = balanceAfter; }
    public Date getDate() { return date; }
    public void setDate(Date date) { this.date = date; }
}