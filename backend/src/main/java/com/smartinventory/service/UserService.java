package com.smartinventory.service;

import com.smartinventory.dto.CreateUserRequest;
import com.smartinventory.dto.UpdateUserRequest;
import com.smartinventory.dto.UserResponse;
import com.smartinventory.entity.AppUser;
import com.smartinventory.entity.RoleName;
import com.smartinventory.exception.ConflictException;
import com.smartinventory.exception.NotFoundException;
import com.smartinventory.repository.RoleRepository;
import com.smartinventory.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository users;
    private final RoleRepository roles;
    private final PasswordEncoder encoder;

    @Transactional(readOnly = true)
    public List<UserResponse> list() { return users.findAll(Sort.by("fullName")).stream().map(UserResponse::of).toList(); }

    @Transactional
    public UserResponse create(CreateUserRequest r) {
        String email = r.email().trim().toLowerCase();
        if (users.existsByEmailIgnoreCase(email)) throw new ConflictException("A user with this email already exists.");
        AppUser u = new AppUser();
        u.setFullName(r.fullName().trim());
        u.setEmail(email);
        u.setPasswordHash(encoder.encode(r.password()));
        u.getRoles().add(roles.findByName(r.role()).orElseThrow());
        return UserResponse.of(users.save(u));
    }

    @Transactional
    public UserResponse update(Long id, UpdateUserRequest r, String currentEmail) {
        AppUser u = users.findById(id).orElseThrow(() -> new NotFoundException("User not found."));
        if (u.getEmail().equalsIgnoreCase(currentEmail) && (!r.enabled() || r.role() != RoleName.ADMIN)) {
            throw new ConflictException("You can't disable your own account or remove your own admin access.");
        }
        u.setFullName(r.fullName().trim());
        u.setEnabled(r.enabled());
        u.getRoles().clear();
        u.getRoles().add(roles.findByName(r.role()).orElseThrow());
        if (r.newPassword() != null && !r.newPassword().isBlank()) u.setPasswordHash(encoder.encode(r.newPassword()));
        return UserResponse.of(u);
    }
}
