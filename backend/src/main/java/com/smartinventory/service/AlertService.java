package com.smartinventory.service;

import com.smartinventory.dto.AlertResponse;
import com.smartinventory.entity.*;
import com.smartinventory.repository.LowStockAlertRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AlertService {
    private final LowStockAlertRepository alerts;

    /** Call inside the same transaction as any stock or threshold change. Keeps one open alert per product,
     *  updates it when low becomes out, and resolves it when stock is back above the threshold. */
    @Transactional
    public void refresh(Product p) {
        StockStatus s = p.status();
        AlertKind kind = s == StockStatus.OUT ? AlertKind.OUT : s == StockStatus.LOW ? AlertKind.LOW : null;
        var open = alerts.findByActiveProductId(p.getId());
        if (kind == null) {
            open.ifPresent(a -> { a.setResolvedAt(Instant.now()); a.setActiveProductId(null); });
        } else if (open.isPresent()) {
            LowStockAlert a = open.get();
            a.setKind(kind); a.setStockQuantity(p.getStockQuantity()); a.setThreshold(p.getReorderThreshold());
        } else {
            LowStockAlert a = new LowStockAlert();
            a.setProduct(p); a.setKind(kind); a.setStockQuantity(p.getStockQuantity()); a.setThreshold(p.getReorderThreshold());
            a.setCreatedAt(Instant.now()); a.setActiveProductId(p.getId());
            alerts.save(a);
        }
    }

    @Transactional(readOnly = true)
    public List<AlertResponse> list(boolean active) {
        var list = active ? alerts.findByResolvedAtIsNullOrderByCreatedAtDesc() : alerts.findByResolvedAtIsNotNullOrderByResolvedAtDesc();
        return list.stream().map(a -> new AlertResponse(a.getId(), a.getProduct().getId(), a.getProduct().getName(), a.getProduct().getSku(),
                a.getKind(), a.getStockQuantity(), a.getThreshold(), a.getCreatedAt(), a.getResolvedAt())).toList();
    }

    @Transactional(readOnly = true)
    public long activeCount() { return alerts.countByResolvedAtIsNull(); }
}
