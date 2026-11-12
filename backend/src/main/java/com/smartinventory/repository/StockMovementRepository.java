package com.smartinventory.repository;

import com.smartinventory.entity.StockMovement;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StockMovementRepository extends JpaRepository<StockMovement, Long> {
    Page<StockMovement> findByProductId(Long productId, Pageable pageable);
    void deleteByProductId(Long productId);
}
