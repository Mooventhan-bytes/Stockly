package com.smartinventory.repository;

import com.smartinventory.entity.LowStockAlert;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface LowStockAlertRepository extends JpaRepository<LowStockAlert, Long> {
    Optional<LowStockAlert> findByActiveProductId(Long productId);
    long countByResolvedAtIsNull();
    List<LowStockAlert> findByResolvedAtIsNullOrderByCreatedAtDesc();
    List<LowStockAlert> findByResolvedAtIsNotNullOrderByResolvedAtDesc();
    void deleteByProductId(Long productId);
}
