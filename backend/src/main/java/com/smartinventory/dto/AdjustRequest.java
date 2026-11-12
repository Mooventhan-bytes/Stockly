package com.smartinventory.dto;

import com.smartinventory.entity.MovementType;
import jakarta.validation.constraints.*;

public record AdjustRequest(
        @NotNull(message = "Choose add or remove.") MovementType type,
        @Min(value = 1, message = "Quantity must be at least 1.") int quantity,
        @NotBlank(message = "Choose a reason.") @Size(max = 255) String reason) {}
