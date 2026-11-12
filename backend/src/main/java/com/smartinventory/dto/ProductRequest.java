package com.smartinventory.dto;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;

public record ProductRequest(
        @NotBlank(message = "Enter a product name.") @Size(max = 150) String name,
        @NotBlank(message = "Enter a SKU.") @Pattern(regexp = "^[A-Za-z0-9-]+$", message = "Use letters, numbers and hyphens only.") @Size(max = 50) String sku,
        @NotNull(message = "Choose a category.") Long categoryId,
        @Size(max = 500) String description,
        @NotNull(message = "Enter a price.") @DecimalMin(value = "0.01", message = "Price must be above 0.") @Digits(integer = 10, fraction = 2) BigDecimal price,
        @Min(value = 0, message = "Stock cannot be negative.") int stockQuantity,
        @Min(value = 0, message = "Threshold cannot be negative.") int reorderThreshold) {}
