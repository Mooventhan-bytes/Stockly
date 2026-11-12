package com.smartinventory.controller;

import com.smartinventory.dto.AuthResponse;
import com.smartinventory.dto.LoginRequest;
import com.smartinventory.dto.UserResponse;
import com.smartinventory.entity.AppUser;
import com.smartinventory.exception.NotFoundException;
import com.smartinventory.repository.UserRepository;
import com.smartinventory.security.JwtService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthenticationManager authManager;
    private final UserRepository users;
    private final JwtService jwt;

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest r) {
        String email = r.email().trim();
        authManager.authenticate(new UsernamePasswordAuthenticationToken(email, r.password())); // throws if wrong
        AppUser u = users.findByEmailIgnoreCase(email).orElseThrow(() -> new NotFoundException("User not found."));
        var roleNames = u.getRoles().stream().map(x -> x.getName().name()).toList();
        return new AuthResponse(jwt.generate(u.getEmail(), roleNames), UserResponse.of(u));
    }

    @GetMapping("/me")
    public UserResponse me(Authentication auth) {
        return users.findByEmailIgnoreCase(auth.getName()).map(UserResponse::of).orElseThrow(() -> new NotFoundException("User not found."));
    }
}
