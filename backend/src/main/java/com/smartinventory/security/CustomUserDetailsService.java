package com.smartinventory.security;

import com.smartinventory.entity.AppUser;
import com.smartinventory.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {
    private final UserRepository users;

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String email) {
        AppUser u = users.findByEmailIgnoreCase(email).orElseThrow(() -> new UsernameNotFoundException("Unknown user"));
        return org.springframework.security.core.userdetails.User.withUsername(u.getEmail())
                .password(u.getPasswordHash()).disabled(!u.isEnabled())
                .authorities(u.getRoles().stream().map(r -> "ROLE_" + r.getName().name()).toArray(String[]::new)).build();
    }
}
