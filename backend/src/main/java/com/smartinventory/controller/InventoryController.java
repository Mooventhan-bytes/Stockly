package com.smartinventory.controller;

import com.smartinventory.dto.AdjustRequest;
import com.smartinventory.dto.MovementResponse;
import com.smartinventory.dto.PageResponse;
import com.smartinventory.service.InventoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/inventory")
@RequiredArgsConstructor
public class InventoryController {
    private final InventoryService service;

    @PostMapping("/products/{id}/adjust")
    @ResponseStatus(HttpStatus.CREATED)
    public MovementResponse adjust(@PathVariable Long id, @Valid @RequestBody AdjustRequest r) { return service.adjust(id, r); }

    @GetMapping("/movements")
    public PageResponse<MovementResponse> movements(@RequestParam(required = false) Long productId,
                                                    @RequestParam(defaultValue = "0") int page,
                                                    @RequestParam(defaultValue = "20") int size) {
        return service.history(productId, page, size);
    }
}
