package com.smartinventory.dto;

import com.smartinventory.entity.OrderStatus;
import jakarta.validation.constraints.NotNull;

public record StatusRequest(@NotNull(message = "Choose a status.") OrderStatus status) {}
