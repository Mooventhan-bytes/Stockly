package com.smartinventory.dto;

import jakarta.validation.constraints.NotBlank;

public record LoginRequest(@NotBlank(message = "Enter your email.") String email, @NotBlank(message = "Enter your password.") String password) {}
