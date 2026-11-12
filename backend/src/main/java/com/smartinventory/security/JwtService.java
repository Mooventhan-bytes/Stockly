package com.smartinventory.security;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Collection;
import java.util.Date;

@Service
public class JwtService {
    private final SecretKey key;
    private final long expiryMinutes;

    public JwtService(@Value("${app.jwt.secret}") String secret, @Value("${app.jwt.expiry-minutes}") long expiryMinutes) {
        byte[] bytes = secret.getBytes(StandardCharsets.UTF_8);
        if (bytes.length < 32) throw new IllegalStateException("JWT_SECRET must be at least 32 characters long.");
        this.key = Keys.hmacShaKeyFor(bytes);
        this.expiryMinutes = expiryMinutes;
    }

    public String generate(String email, Collection<String> roles) {
        Instant now = Instant.now();
        return Jwts.builder().subject(email).claim("roles", roles)
                .issuedAt(Date.from(now)).expiration(Date.from(now.plusSeconds(expiryMinutes * 60)))
                .signWith(key).compact();
    }

    /** Returns the email in the token, or throws JwtException if the token is invalid or expired. */
    public String subject(String token) {
        return Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload().getSubject();
    }
}
