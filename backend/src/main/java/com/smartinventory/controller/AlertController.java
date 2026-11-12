package com.smartinventory.controller;

import com.smartinventory.dto.AlertResponse;
import com.smartinventory.service.AlertService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/alerts")
@RequiredArgsConstructor
public class AlertController {
    private final AlertService service;

    @GetMapping
    public List<AlertResponse> list(@RequestParam(defaultValue = "true") boolean active) { return service.list(active); }

    @GetMapping("/count")
    public Map<String, Long> count() { return Map.of("active", service.activeCount()); }
}
