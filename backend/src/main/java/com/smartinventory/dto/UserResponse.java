package com.smartinventory.dto;

import com.smartinventory.entity.AppUser;

public record UserResponse(Long id, String fullName, String email, String role, boolean enabled) {
    public static UserResponse of(AppUser u) {
        String role = u.getRoles().stream().map(r -> r.getName().name()).findFirst().orElse("STAFF");
        return new UserResponse(u.getId(), u.getFullName(), u.getEmail(), role, u.isEnabled());
    }
}
