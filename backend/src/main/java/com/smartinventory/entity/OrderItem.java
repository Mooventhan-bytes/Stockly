package com.smartinventory.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.math.BigDecimal;

/** Name, SKU and price are copied at order time so later product edits never change old orders. */
@Entity
@Table(name = "order_items", indexes = @Index(name = "idx_items_order", columnList = "order_id"))
@Getter @Setter @NoArgsConstructor
public class OrderItem {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "order_id")
    private CustomerOrder order;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "product_id")
    private Product product;
    @Column(nullable = false, length = 150) private String productName;
    @Column(nullable = false, length = 50) private String sku;
    @Column(nullable = false, precision = 12, scale = 2) private BigDecimal unitPrice;
    @Column(nullable = false) private int quantity;
    @Column(nullable = false, precision = 12, scale = 2) private BigDecimal lineTotal;
}
