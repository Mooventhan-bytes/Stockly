package com.smartinventory.controller;

import com.smartinventory.dto.OrderRequest;
import com.smartinventory.dto.OrderResponse;
import com.smartinventory.dto.PageResponse;
import com.smartinventory.dto.StatusRequest;
import com.smartinventory.entity.OrderStatus;
import com.smartinventory.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {
    private final OrderService service;

    @GetMapping
    public PageResponse<OrderResponse> list(@RequestParam(required = false) String q,
                                            @RequestParam(required = false) OrderStatus status,
                                            @RequestParam(defaultValue = "0") int page,
                                            @RequestParam(defaultValue = "10") int size) {
        return service.list(q, status, page, size);
    }

    @GetMapping("/{id}")
    public OrderResponse get(@PathVariable Long id) { return service.get(id); }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public OrderResponse create(@Valid @RequestBody OrderRequest r, @RequestHeader(value = "Idempotency-Key", required = false) String key) {
        return service.create(r, key);
    }

    @PutMapping("/{id}/status")
    public OrderResponse updateStatus(@PathVariable Long id, @Valid @RequestBody StatusRequest r) { return service.updateStatus(id, r.status()); }
}
