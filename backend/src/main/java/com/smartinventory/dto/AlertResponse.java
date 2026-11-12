package com.smartinventory.dto;

import com.smartinventory.entity.AlertKind;
import java.time.Instant;

public record AlertResponse(Long id, Long productId, String productName, String sku, AlertKind kind,
                            int stockQuantity, int threshold, Instant createdAt, Instant resolvedAt) {}
