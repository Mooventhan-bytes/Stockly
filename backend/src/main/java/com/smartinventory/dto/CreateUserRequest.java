package com.smartinventory.dto;

import com.smartinventory.entity.RoleName;
import jakarta.validation.constraints.*;

public record CreateUserRequest(
        @NotBlank(message = "Enter a name.") @Size(max = 100) String fullName,
        @NotBlank(message = "Enter an email.") @Email(message = "Enter a valid email.") @Size(max = 150) String email,
        @NotBlank(message = "Enter a password.") @Size(min = 8, max = 72, message = "Password must be 8 to 72 characters.") String password,
        @NotNull(message = "Choose a role.") RoleName role) {}
