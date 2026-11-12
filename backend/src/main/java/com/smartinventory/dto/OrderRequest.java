package com.smartinventory.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.util.List;

public record OrderRequest(
        @NotBlank(message = "Enter the customer name.") @Size(max = 150) String customerName,
        @Size(max = 30) String customerPhone,
        @Email(message = "Enter a valid email.") @Size(max = 150) String customerEmail,
        @NotEmpty(message = "Add at least one product.") List<@Valid Item> items) {
    public record Item(@NotNull(message = "Choose a product.") Long productId,
                       @Min(value = 1, message = "Quantity must be at least 1.") int quantity) {}
}
