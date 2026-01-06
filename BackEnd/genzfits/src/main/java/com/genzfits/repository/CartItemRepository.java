package com.genzfits.repository;

import com.genzfits.model.CartItem;
import com.genzfits.model.User;
import com.genzfits.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    List<CartItem> findByUser_Id(Long userId);
    Optional<CartItem> findByUserAndProductAndSelectedSize(User user, Product product, String selectedSize);
    void deleteByUser_Id(Long userId);
}