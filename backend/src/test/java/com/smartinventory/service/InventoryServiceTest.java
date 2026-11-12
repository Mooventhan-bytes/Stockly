package com.smartinventory.service;

import com.smartinventory.dto.AdjustRequest;
import com.smartinventory.entity.MovementType;
import com.smartinventory.entity.Product;
import com.smartinventory.entity.StockMovement;
import com.smartinventory.exception.ConflictException;
import com.smartinventory.repository.ProductRepository;
import com.smartinventory.repository.StockMovementRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import java.math.BigDecimal;
import java.util.Optional;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class InventoryServiceTest {
    @Mock ProductRepository products;
    @Mock StockMovementRepository movements;
    @Mock AlertService alerts;
    @InjectMocks InventoryService service;

    private Product product(int stock) {
        Product p = new Product();
        p.setId(1L); p.setName("Pen"); p.setSku("PEN-1"); p.setPrice(BigDecimal.TEN);
        p.setStockQuantity(stock); p.setReorderThreshold(2);
        return p;
    }

    @Test
    void stockCanNeverGoNegative() {
        Product p = product(3);

        assertThrows(ConflictException.class, () -> service.apply(p, -5, "Damaged"));

        assertEquals(3, p.getStockQuantity());
        verify(movements, never()).save(any());
    }

    @Test
    void addingStockRecordsMovementAndRefreshesAlerts() {
        Product p = product(3);

        service.apply(p, 4, "Restock received");

        assertEquals(7, p.getStockQuantity());
        ArgumentCaptor<StockMovement> c = ArgumentCaptor.forClass(StockMovement.class);
        verify(movements).save(c.capture());
        assertEquals(MovementType.IN, c.getValue().getType());
        assertEquals(3, c.getValue().getQuantityBefore());
        assertEquals(7, c.getValue().getQuantityAfter());
        verify(alerts).refresh(p);
    }

    @Test
    void adjustRemovesStockFromTheLockedProduct() {
        Product p = product(5);
        when(products.findByIdForUpdate(1L)).thenReturn(Optional.of(p));

        service.adjust(1L, new AdjustRequest(MovementType.OUT, 2, "Damaged"));

        assertEquals(3, p.getStockQuantity());
    }
}
