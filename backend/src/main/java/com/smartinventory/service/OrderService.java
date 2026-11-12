package com.smartinventory.service;

import com.smartinventory.dto.OrderRequest;
import com.smartinventory.dto.OrderResponse;
import com.smartinventory.dto.PageResponse;
import com.smartinventory.entity.*;
import com.smartinventory.exception.ConflictException;
import com.smartinventory.exception.NotFoundException;
import com.smartinventory.repository.OrderRepository;
import com.smartinventory.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService {
    private final OrderRepository orders;
    private final ProductRepository products;
    private final InventoryService inventory;

    /** Prices and totals come from the database here, never from the client. Stock is deducted in the same transaction. */
    @Transactional
    public OrderResponse create(OrderRequest r, String idempotencyKey) {
        String key = idempotencyKey == null || idempotencyKey.isBlank() ? null : idempotencyKey.trim();
        if (key != null) {
            var existing = orders.findByIdempotencyKey(key);
            if (existing.isPresent()) return toResponse(existing.get()); // repeated request: same order, no duplicate
        }
        Map<Long, Integer> wanted = new TreeMap<>();
        r.items().forEach(i -> wanted.merge(i.productId(), i.quantity(), Integer::sum));
        Map<Long, Product> locked = lock(wanted.keySet());

        List<String> shortages = new ArrayList<>();
        wanted.forEach((id, q) -> {
            Product p = locked.get(id);
            if (p.getStockQuantity() < q) shortages.add(p.getName() + " (only " + p.getStockQuantity() + " left)");
        });
        if (!shortages.isEmpty()) throw new ConflictException("Not enough stock: " + String.join(", ", shortages) + ".");

        CustomerOrder o = new CustomerOrder();
        o.setCustomerName(r.customerName().trim());
        o.setCustomerPhone(r.customerPhone());
        o.setCustomerEmail(r.customerEmail());
        o.setStatus(OrderStatus.PENDING);
        o.setCreatedAt(Instant.now());
        o.setIdempotencyKey(key);
        BigDecimal total = BigDecimal.ZERO;
        for (var e : wanted.entrySet()) {
            Product p = locked.get(e.getKey());
            OrderItem it = new OrderItem();
            it.setOrder(o); it.setProduct(p); it.setProductName(p.getName()); it.setSku(p.getSku());
            it.setUnitPrice(p.getPrice()); it.setQuantity(e.getValue());
            it.setLineTotal(p.getPrice().multiply(BigDecimal.valueOf(e.getValue())));
            o.getItems().add(it);
            total = total.add(it.getLineTotal());
        }
        o.setTotalAmount(total);
        addHistory(o, OrderStatus.PENDING);
        orders.saveAndFlush(o);
        for (OrderItem it : o.getItems()) inventory.apply(it.getProduct(), -it.getQuantity(), "Order " + o.orderNumber());
        return toResponse(o);
    }

    @Transactional
    public OrderResponse updateStatus(Long id, OrderStatus next) {
        CustomerOrder o = find(id);
        if (!o.getStatus().canMoveTo(next)) {
            throw new ConflictException("A " + o.getStatus().name().toLowerCase() + " order can't move to " + next.name().toLowerCase() + ".");
        }
        if (next == OrderStatus.CANCELLED) { // give the stock back
            Map<Long, Product> locked = lock(o.getItems().stream().map(i -> i.getProduct().getId()).sorted().toList());
            for (OrderItem it : o.getItems()) inventory.apply(locked.get(it.getProduct().getId()), it.getQuantity(), "Order " + o.orderNumber() + " cancelled");
        }
        o.setStatus(next);
        addHistory(o, next);
        return toResponse(o);
    }

    @Transactional(readOnly = true)
    public OrderResponse get(Long id) { return toResponse(find(id)); }

    @Transactional(readOnly = true)
    public PageResponse<OrderResponse> list(String q, OrderStatus status, int page, int size) {
        var pageable = PageRequest.of(Math.max(page, 0), Math.min(Math.max(size, 1), 100), Sort.by("createdAt").descending());
        return PageResponse.of(orders.search(q == null ? "" : q.trim(), status, pageable).map(this::toResponse));
    }

    private Map<Long, Product> lock(Collection<Long> ids) {
        List<Product> list = products.lockAllByIds(ids);
        if (list.size() != ids.size()) throw new NotFoundException("One or more products no longer exist.");
        return list.stream().collect(Collectors.toMap(Product::getId, p -> p));
    }

    private void addHistory(CustomerOrder o, OrderStatus s) {
        OrderStatusHistory h = new OrderStatusHistory();
        h.setOrder(o); h.setStatus(s); h.setChangedAt(Instant.now());
        o.getHistory().add(h);
    }

    private CustomerOrder find(Long id) {
        return orders.findById(id).orElseThrow(() -> new NotFoundException("Order not found."));
    }

    private OrderResponse toResponse(CustomerOrder o) {
        return new OrderResponse(o.getId(), o.orderNumber(), o.getCustomerName(), o.getCustomerPhone(), o.getCustomerEmail(),
                o.getStatus(), o.getTotalAmount(), o.getCreatedAt(),
                o.getItems().stream().map(i -> new OrderResponse.Line(i.getProduct().getId(), i.getProductName(), i.getSku(), i.getUnitPrice(), i.getQuantity(), i.getLineTotal())).toList(),
                o.getHistory().stream().map(h -> new OrderResponse.HistoryEntry(h.getStatus(), h.getChangedAt())).toList());
    }
}
