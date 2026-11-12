package com.smartinventory.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.Instant;

@Entity
@Table(name = "low_stock_alerts")
@Getter @Setter @NoArgsConstructor
public class LowStockAlert {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "product_id")
    private Product product;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 10)
    private AlertKind kind;
    @Column(nullable = false) private int stockQuantity;
    @Column(nullable = false) private int threshold;
    @Column(nullable = false) private Instant createdAt;
    private Instant resolvedAt;
    /** Holds the product id while the alert is open and NULL once resolved; the unique constraint
     *  therefore allows at most one open alert per product. */
    @Column(unique = true) private Long activeProductId;
}
