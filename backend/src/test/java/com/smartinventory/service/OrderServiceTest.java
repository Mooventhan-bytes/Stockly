package com.smartinventory.service;

import com.smartinventory.dto.OrderRequest;
import com.smartinventory.dto.OrderResponse;
import com.smartinventory.entity.*;
import com.smartinventory.exception.ConflictException;
import com.smartinventory.repository.OrderRepository;
import com.smartinventory.repository.ProductRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OrderServiceTest {
    @Mock OrderRepository orders;
    @Mock ProductRepository products;
    @Mock InventoryService inventory;
    @InjectMocks OrderService service;

    private Product product(long id, String price, int stock) {
        Product p = new Product();
        p.setId(id); p.setName("Pen"); p.setSku("PEN-" + id);
        p.setPrice(new BigDecimal(price)); p.setStockQuantity(stock); p.setReorderThreshold(2);
        return p;
    }

    private OrderRequest request(long productId, int qty) {
        return new OrderRequest("Test Customer", null, null, List.of(new OrderRequest.Item(productId, qty)));
    }

    private CustomerOrder order(long id, OrderStatus status, Product p, int qty) {
        CustomerOrder o = new CustomerOrder();
        o.setId(id); o.setCustomerName("Test"); o.setStatus(status); o.setCreatedAt(Instant.now());
        o.setTotalAmount(p.getPrice().multiply(BigDecimal.valueOf(qty)));
        OrderItem it = new OrderItem();
        it.setOrder(o); it.setProduct(p); it.setProductName(p.getName()); it.setSku(p.getSku());
        it.setUnitPrice(p.getPrice()); it.setQuantity(qty); it.setLineTotal(o.getTotalAmount());
        o.getItems().add(it);
        return o;
    }

    @Test
    void createCalculatesTotalOnTheServerAndDeductsStock() {
        Product p = product(1, "100.00", 10);
        when(products.lockAllByIds(any())).thenReturn(List.of(p));
        when(orders.saveAndFlush(any())).thenAnswer(inv -> { CustomerOrder o = inv.getArgument(0); o.setId(5L); return o; });

        OrderResponse r = service.create(request(1, 2), null);

        assertEquals(new BigDecimal("200.00"), r.totalAmount());
        assertEquals("ORD-1005", r.orderNumber());
        assertEquals(OrderStatus.PENDING, r.status());
        verify(inventory).apply(p, -2, "Order ORD-1005");
    }

    @Test
    void createIsRejectedWhenStockIsInsufficient() {
        Product p = product(1, "100.00", 1);
        when(products.lockAllByIds(any())).thenReturn(List.of(p));

        assertThrows(ConflictException.class, () -> service.create(request(1, 2), null));

        verify(orders, never()).saveAndFlush(any());
        verify(inventory, never()).apply(any(), anyInt(), anyString());
    }

    @Test
    void repeatedIdempotencyKeyReturnsTheSameOrder() {
        CustomerOrder existing = order(7, OrderStatus.PENDING, product(1, "10.00", 5), 1);
        when(orders.findByIdempotencyKey("abc")).thenReturn(Optional.of(existing));

        OrderResponse r = service.create(request(1, 1), "abc");

        assertEquals("ORD-1007", r.orderNumber());
        verifyNoInteractions(products, inventory);
    }

    @Test
    void cancellingReturnsStock() {
        Product p = product(1, "100.00", 8);
        when(orders.findById(9L)).thenReturn(Optional.of(order(9, OrderStatus.PENDING, p, 2)));
        when(products.lockAllByIds(any())).thenReturn(List.of(p));

        OrderResponse r = service.updateStatus(9L, OrderStatus.CANCELLED);

        assertEquals(OrderStatus.CANCELLED, r.status());
        verify(inventory).apply(p, 2, "Order ORD-1009 cancelled");
    }

    @Test
    void invalidStatusChangeIsRejected() {
        when(orders.findById(9L)).thenReturn(Optional.of(order(9, OrderStatus.DELIVERED, product(1, "10.00", 5), 1)));

        assertThrows(ConflictException.class, () -> service.updateStatus(9L, OrderStatus.CANCELLED));

        verifyNoInteractions(inventory);
    }
}
