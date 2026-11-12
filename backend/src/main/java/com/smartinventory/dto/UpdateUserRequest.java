package com.smartinventory.dto;

import com.smartinventory.entity.RoleName;
import jakarta.validation.constraints.*;

/** newPassword is optional: leave it out (null) to keep the current password. */
public record UpdateUserRequest(
        @NotBlank(message = "Enter a name.") @Size(max = 100) String fullName,
        @NotNull(message = "Choose a role.") RoleName role,
        boolean enabled,
        @Size(min = 8, max = 72, message = "Password must be 8 to 72 characters.") String newPassword) {}
