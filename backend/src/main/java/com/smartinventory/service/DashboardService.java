package com.smartinventory.service;

import com.smartinventory.dto.DashboardSummary;
import com.smartinventory.entity.OrderStatus;
import com.smartinventory.repository.OrderRepository;
import com.smartinventory.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class DashboardService {
    private final ProductRepository products;
    private final OrderRepository orders;
    private final AlertService alerts;

    @Transactional(readOnly = true)
    public DashboardSummary summary() {
        return new DashboardSummary(products.count(), products.totalUnits(), products.countLow(), products.countByStockQuantity(0),
                orders.countByStatus(OrderStatus.PENDING), alerts.activeCount());
    }
}
