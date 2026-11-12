package com.smartinventory.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CategoryRequest(
        @NotBlank(message = "Enter a category name.") @Size(max = 100) String name,
        @Size(max = 255) String description) {}
