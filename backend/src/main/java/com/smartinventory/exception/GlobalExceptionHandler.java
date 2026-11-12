package com.smartinventory.exception;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(NotFoundException.class)
    ResponseEntity<ApiError> notFound(NotFoundException e) { return build(HttpStatus.NOT_FOUND, e.getMessage(), null); }

    @ExceptionHandler(ConflictException.class)
    ResponseEntity<ApiError> conflict(ConflictException e) { return build(HttpStatus.CONFLICT, e.getMessage(), null); }

    @ExceptionHandler(DataIntegrityViolationException.class)
    ResponseEntity<ApiError> integrity(DataIntegrityViolationException e) {
        return build(HttpStatus.CONFLICT, "That change conflicts with existing data (for example a duplicate SKU).", null);
    }

    @ExceptionHandler(AuthenticationException.class)
    ResponseEntity<ApiError> badLogin(AuthenticationException e) { return build(HttpStatus.UNAUTHORIZED, "Incorrect email or password.", null); }

    @ExceptionHandler(ObjectOptimisticLockingFailureException.class)
    ResponseEntity<ApiError> stale(ObjectOptimisticLockingFailureException e) {
        return build(HttpStatus.CONFLICT, "Someone else changed this record. Reload and try again.", null);
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    ResponseEntity<ApiError> unreadable(HttpMessageNotReadableException e) {
        return build(HttpStatus.BAD_REQUEST, "The request body is missing or has an invalid value.", null);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    ResponseEntity<ApiError> invalid(MethodArgumentNotValidException e) {
        Map<String, String> fields = new LinkedHashMap<>();
        e.getBindingResult().getFieldErrors().forEach(f -> fields.putIfAbsent(f.getField(), f.getDefaultMessage()));
        return build(HttpStatus.BAD_REQUEST, "Please correct the highlighted fields.", fields);
    }

    private ResponseEntity<ApiError> build(HttpStatus s, String msg, Map<String, String> fields) {
        return ResponseEntity.status(s).body(new ApiError(Instant.now(), s.value(), msg, fields));
    }
}
