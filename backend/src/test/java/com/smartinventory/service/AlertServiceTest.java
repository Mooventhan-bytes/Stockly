package com.smartinventory.service;

import com.smartinventory.entity.AlertKind;
import com.smartinventory.entity.LowStockAlert;
import com.smartinventory.entity.Product;
import com.smartinventory.repository.LowStockAlertRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import java.time.Instant;
import java.util.Optional;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AlertServiceTest {
    @Mock LowStockAlertRepository alerts;
    @InjectMocks AlertService service;

    private Product product(int stock) {
        Product p = new Product();
        p.setId(1L); p.setName("Pen"); p.setReorderThreshold(5); p.setStockQuantity(stock);
        return p;
    }

    private LowStockAlert openAlert(AlertKind kind) {
        LowStockAlert a = new LowStockAlert();
        a.setKind(kind); a.setCreatedAt(Instant.now()); a.setActiveProductId(1L);
        return a;
    }

    @Test
    void lowStockCreatesOneOpenAlert() {
        service.refresh(product(3));

        ArgumentCaptor<LowStockAlert> c = ArgumentCaptor.forClass(LowStockAlert.class);
        verify(alerts).save(c.capture());
        assertEquals(AlertKind.LOW, c.getValue().getKind());
        assertEquals(1L, c.getValue().getActiveProductId());
    }

    @Test
    void lowBecomingOutUpdatesTheSameAlert() {
        LowStockAlert a = openAlert(AlertKind.LOW);
        when(alerts.findByActiveProductId(1L)).thenReturn(Optional.of(a));

        service.refresh(product(0));

        assertEquals(AlertKind.OUT, a.getKind());
        verify(alerts, never()).save(any());
    }

    @Test
    void restockingResolvesTheAlert() {
        LowStockAlert a = openAlert(AlertKind.LOW);
        when(alerts.findByActiveProductId(1L)).thenReturn(Optional.of(a));

        service.refresh(product(20));

        assertNotNull(a.getResolvedAt());
        assertNull(a.getActiveProductId());
    }

    @Test
    void healthyStockCreatesNoAlert() {
        service.refresh(product(20));

        verify(alerts, never()).save(any());
    }
}
