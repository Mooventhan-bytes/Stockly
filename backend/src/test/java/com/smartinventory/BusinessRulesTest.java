package com.smartinventory;

import com.smartinventory.entity.OrderStatus;
import com.smartinventory.entity.Product;
import com.smartinventory.entity.StockStatus;
import org.junit.jupiter.api.Test;
import static com.smartinventory.entity.OrderStatus.*;
import static org.junit.jupiter.api.Assertions.*;

class BusinessRulesTest {

    @Test
    void allowedOrderTransitions() {
        assertTrue(PENDING.canMoveTo(CONFIRMED));
        assertTrue(PENDING.canMoveTo(CANCELLED));
        assertTrue(CONFIRMED.canMoveTo(SHIPPED));
        assertTrue(CONFIRMED.canMoveTo(CANCELLED));
        assertTrue(SHIPPED.canMoveTo(DELIVERED));
    }

    @Test
    void forbiddenOrderTransitions() {
        assertFalse(PENDING.canMoveTo(DELIVERED));
        assertFalse(PENDING.canMoveTo(SHIPPED));
        assertFalse(SHIPPED.canMoveTo(CANCELLED));
        for (OrderStatus s : OrderStatus.values()) {
            assertFalse(DELIVERED.canMoveTo(s));
            assertFalse(CANCELLED.canMoveTo(s));
        }
    }

    @Test
    void stockStatusUsesReorderThreshold() {
        Product p = new Product();
        p.setReorderThreshold(5);
        p.setStockQuantity(0);
        assertEquals(StockStatus.OUT, p.status());
        p.setStockQuantity(5);
        assertEquals(StockStatus.LOW, p.status());
        p.setStockQuantity(6);
        assertEquals(StockStatus.IN, p.status());
    }
}
