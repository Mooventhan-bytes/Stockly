package com.smartinventory.dto;

import com.smartinventory.entity.StockStatus;
import java.math.BigDecimal;

public record ProductResponse(Long id, String name, String sku, Long categoryId, String categoryName, String description,
                              BigDecimal price, int stockQuantity, int reorderThreshold, StockStatus status) {}
