package com.smartinventory.repository;

import com.smartinventory.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import jakarta.persistence.LockModeType;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import org.springframework.data.repository.query.Param;

public interface ProductRepository extends JpaRepository<Product, Long> {
    boolean existsBySku(String sku);
    boolean existsBySkuAndIdNot(String sku, Long id);
    long countByCategoryId(Long categoryId);
    long countByStockQuantity(int quantity);

    @Query("select coalesce(sum(p.stockQuantity), 0) from Product p")
    long totalUnits();

    @Query("select count(p) from Product p where p.stockQuantity > 0 and p.stockQuantity <= p.reorderThreshold")
    long countLow();

    /** Row locks: concurrent orders for the same product wait for each other instead of overselling. */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select p from Product p where p.id = :id")
    Optional<Product> findByIdForUpdate(@Param("id") Long id);

    /** Ordered by id so two orders locking several products always lock in the same order (no deadlocks). */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select p from Product p where p.id in :ids order by p.id")
    List<Product> lockAllByIds(@Param("ids") Collection<Long> ids);

    /** q and status use "" for "no filter"; categoryId uses null. */
    @Query("""
        select p from Product p
        where (:q = '' or lower(p.name) like lower(concat('%', :q, '%')) or lower(p.sku) like lower(concat('%', :q, '%')))
          and (:categoryId is null or p.category.id = :categoryId)
          and (:status = ''
               or (:status = 'OUT' and p.stockQuantity = 0)
               or (:status = 'LOW' and p.stockQuantity > 0 and p.stockQuantity <= p.reorderThreshold)
               or (:status = 'IN' and p.stockQuantity > p.reorderThreshold))
        """)
    Page<Product> search(@Param("q") String q, @Param("categoryId") Long categoryId,
                         @Param("status") String status, Pageable pageable);
}
