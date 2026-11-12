package com.smartinventory.service;

import com.smartinventory.dto.AdjustRequest;
import com.smartinventory.dto.MovementResponse;
import com.smartinventory.dto.PageResponse;
import com.smartinventory.entity.*;
import com.smartinventory.exception.ConflictException;
import com.smartinventory.exception.NotFoundException;
import com.smartinventory.repository.ProductRepository;
import com.smartinventory.repository.StockMovementRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.Instant;

@Service
@RequiredArgsConstructor
public class InventoryService {
    private final ProductRepository products;
    private final StockMovementRepository movements;
    private final AlertService alerts;

    @Transactional
    public MovementResponse adjust(Long productId, AdjustRequest r) {
        Product p = products.findByIdForUpdate(productId).orElseThrow(() -> new NotFoundException("Product not found."));
        int delta = r.type() == MovementType.IN ? r.quantity() : -r.quantity();
        return toResponse(apply(p, delta, r.reason().trim()));
    }

    /** The single place where stock changes. The product row must already be locked by the caller. */
    @Transactional
    public StockMovement apply(Product p, int delta, String reason) {
        int before = p.getStockQuantity();
        int after = before + delta;
        if (after < 0) throw new ConflictException("Only " + before + " in stock for " + p.getName() + ", so " + Math.abs(delta) + " cannot be removed.");
        p.setStockQuantity(after);
        StockMovement m = new StockMovement();
        m.setProduct(p); m.setType(delta >= 0 ? MovementType.IN : MovementType.OUT); m.setQuantity(Math.abs(delta));
        m.setQuantityBefore(before); m.setQuantityAfter(after); m.setReason(reason); m.setCreatedAt(Instant.now());
        movements.save(m);
        alerts.refresh(p);
        return m;
    }

    @Transactional(readOnly = true)
    public PageResponse<MovementResponse> history(Long productId, int page, int size) {
        var pageable = PageRequest.of(Math.max(page, 0), Math.min(Math.max(size, 1), 100), Sort.by("createdAt").descending());
        var result = productId == null ? movements.findAll(pageable) : movements.findByProductId(productId, pageable);
        return PageResponse.of(result.map(this::toResponse));
    }

    private MovementResponse toResponse(StockMovement m) {
        return new MovementResponse(m.getId(), m.getProduct().getId(), m.getProduct().getName(), m.getProduct().getSku(), m.getType(),
                m.getQuantity(), m.getQuantityBefore(), m.getQuantityAfter(), m.getReason(), m.getCreatedAt());
    }
}
