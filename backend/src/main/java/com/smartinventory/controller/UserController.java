package com.smartinventory.controller;

import com.smartinventory.dto.CreateUserRequest;
import com.smartinventory.dto.UpdateUserRequest;
import com.smartinventory.dto.UserResponse;
import com.smartinventory.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;

/** Restricted to ADMIN in SecurityConfig. */
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {
    private final UserService service;

    @GetMapping
    public List<UserResponse> list() { return service.list(); }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public UserResponse create(@Valid @RequestBody CreateUserRequest r) { return service.create(r); }

    @PutMapping("/{id}")
    public UserResponse update(@PathVariable Long id, @Valid @RequestBody UpdateUserRequest r, Authentication auth) {
        return service.update(id, r, auth.getName());
    }
}
