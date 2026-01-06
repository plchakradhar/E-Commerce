package com.genzfits.repository;

import com.genzfits.model.CoinHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CoinHistoryRepository extends JpaRepository<CoinHistory, Long> {
    List<CoinHistory> findByUserIdOrderByDateDesc(Long userId);
    List<CoinHistory> findByUserIdAndTypeOrderByDateDesc(Long userId, String type);
}