package com.smartinventory.controller;

import com.smartinventory.dto.DashboardSummary;
import com.smartinventory.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {
    private final DashboardService service;

    @GetMapping("/summary")
    public DashboardSummary summary() { return service.summary(); }
}
