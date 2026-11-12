package com.smartinventory.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "orders", indexes = { @Index(name = "idx_orders_status", columnList = "status"), @Index(name = "idx_orders_created", columnList = "createdAt") })
@Getter @Setter @NoArgsConstructor
public class CustomerOrder {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false, length = 150) private String customerName;
    @Column(length = 30) private String customerPhone;
    @Column(length = 150) private String customerEmail;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 20) private OrderStatus status;
    @Column(nullable = false, precision = 12, scale = 2) private BigDecimal totalAmount;
    @Column(nullable = false) private Instant createdAt;
    @Column(unique = true, length = 64) private String idempotencyKey;
    @Version private long version;
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true) @OrderBy("id")
    private List<OrderItem> items = new ArrayList<>();
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true) @OrderBy("id")
    private List<OrderStatusHistory> history = new ArrayList<>();

    public String orderNumber() { return "ORD-" + (1000 + id); }
}
