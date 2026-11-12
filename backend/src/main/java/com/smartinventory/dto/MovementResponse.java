package com.smartinventory.dto;

import com.smartinventory.entity.MovementType;
import java.time.Instant;

public record MovementResponse(Long id, Long productId, String productName, String sku, MovementType type,
                               int quantity, int quantityBefore, int quantityAfter, String reason, Instant createdAt) {}
