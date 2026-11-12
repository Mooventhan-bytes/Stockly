package com.smartinventory.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.Instant;

@Entity
@Table(name = "stock_movements", indexes = {
        @Index(name = "idx_movements_product", columnList = "product_id"),
        @Index(name = "idx_movements_created", columnList = "createdAt") })
@Getter @Setter @NoArgsConstructor
public class StockMovement {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "product_id")
    private Product product;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 10)
    private MovementType type;
    @Column(nullable = false) private int quantity;
    @Column(nullable = false) private int quantityBefore;
    @Column(nullable = false) private int quantityAfter;
    @Column(nullable = false, length = 255) private String reason;
    @Column(nullable = false) private Instant createdAt;
}
