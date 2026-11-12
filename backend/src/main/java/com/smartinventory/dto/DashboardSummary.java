package com.smartinventory.dto;

public record DashboardSummary(long totalProducts, long totalUnits, long lowStock, long outOfStock, long pendingOrders, long activeAlerts) {}
