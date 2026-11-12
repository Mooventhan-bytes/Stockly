package com.smartinventory.repository;

import com.smartinventory.entity.CustomerOrder;
import com.smartinventory.entity.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<CustomerOrder, Long> {
    Optional<CustomerOrder> findByIdempotencyKey(String key);
    long countByStatus(OrderStatus status);

    @Query("""
        select o from CustomerOrder o
        where (:q = '' or lower(o.customerName) like lower(concat('%', :q, '%')))
          and (:status is null or o.status = :status)
        """)
    Page<CustomerOrder> search(@Param("q") String q, @Param("status") OrderStatus status, Pageable pageable);
}
