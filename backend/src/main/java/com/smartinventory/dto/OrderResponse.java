package com.smartinventory.dto;

import com.smartinventory.entity.OrderStatus;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public record OrderResponse(Long id, String orderNumber, String customerName, String customerPhone, String customerEmail,
                            OrderStatus status, BigDecimal totalAmount, Instant createdAt,
                            List<Line> items, List<HistoryEntry> history) {
    public record Line(Long productId, String productName, String sku, BigDecimal unitPrice, int quantity, BigDecimal lineTotal) {}
    public record HistoryEntry(OrderStatus status, Instant changedAt) {}
}
