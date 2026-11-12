package com.smartinventory.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.math.BigDecimal;

@Entity
@Table(name = "products",
        uniqueConstraints = @UniqueConstraint(name = "uk_products_sku", columnNames = "sku"),
        indexes = { @Index(name = "idx_products_name", columnList = "name"), @Index(name = "idx_products_category", columnList = "category_id") })
@Getter @Setter @NoArgsConstructor
public class Product {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false, length = 150)
    private String name;
    @Column(nullable = false, length = 50)
    private String sku;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;
    @Column(length = 500)
    private String description;
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal price;
    @Column(nullable = false)
    private int stockQuantity;
    @Column(nullable = false)
    private int reorderThreshold;
    @Version
    private long version;

    /** Derived from stock and threshold, so it is never stored twice. */
    public StockStatus status() {
        if (stockQuantity == 0) return StockStatus.OUT;
        return stockQuantity <= reorderThreshold ? StockStatus.LOW : StockStatus.IN;
    }
}
