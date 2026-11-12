package com.smartinventory.service;

import com.smartinventory.dto.PageResponse;
import com.smartinventory.dto.ProductRequest;
import com.smartinventory.dto.ProductResponse;
import com.smartinventory.entity.Category;
import com.smartinventory.entity.Product;
import com.smartinventory.entity.StockStatus;
import com.smartinventory.exception.ConflictException;
import com.smartinventory.exception.NotFoundException;
import com.smartinventory.repository.CategoryRepository;
import com.smartinventory.repository.OrderItemRepository;
import com.smartinventory.repository.ProductRepository;
import com.smartinventory.repository.StockMovementRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ProductService {
    // Only these sort keys are accepted, so a request cannot sort by arbitrary fields.
    private static final Map<String, String> SORT_FIELDS =
            Map.of("name", "name", "category", "category.name", "price", "price", "stock", "stockQuantity");

    private final ProductRepository products;
    private final CategoryRepository categories;
    private final AlertService alerts;
    private final StockMovementRepository movements;
    private final OrderItemRepository orderItems;
    private final com.smartinventory.repository.LowStockAlertRepository alertRepo;

    @Transactional(readOnly = true)
    public PageResponse<ProductResponse> list(String q, Long categoryId, StockStatus status, int page, int size, String sort, String dir) {
        String field = SORT_FIELDS.getOrDefault(sort, "name");
        Sort s = "desc".equalsIgnoreCase(dir) ? Sort.by(field).descending() : Sort.by(field).ascending();
        var pageable = PageRequest.of(Math.max(page, 0), Math.min(Math.max(size, 1), 100), s);
        var result = products.search(q == null ? "" : q.trim(), categoryId, status == null ? "" : status.name(), pageable);
        return PageResponse.of(result.map(this::toResponse));
    }

    @Transactional(readOnly = true)
    public ProductResponse get(Long id) { return toResponse(find(id)); }

    @Transactional
    public ProductResponse create(ProductRequest r) {
        String sku = r.sku().trim().toUpperCase();
        if (products.existsBySku(sku)) throw new ConflictException("This SKU is already used by another product.");
        Product p = new Product();
        apply(p, r, sku);
        p.setStockQuantity(r.stockQuantity()); // opening stock; later changes go through inventory adjustments
        Product saved = products.save(p);
        alerts.refresh(saved);
        return toResponse(saved);
    }

    @Transactional
    public ProductResponse update(Long id, ProductRequest r) {
        Product p = find(id);
        String sku = r.sku().trim().toUpperCase();
        if (products.existsBySkuAndIdNot(sku, id)) throw new ConflictException("This SKU is already used by another product.");
        apply(p, r, sku); // stock quantity is deliberately not changed here
        alerts.refresh(p); // the threshold may have changed
        return toResponse(p);
    }

    @Transactional
    public void delete(Long id) {
        Product p = find(id);
        if (orderItems.existsByProductId(id)) throw new ConflictException("This product appears on existing orders, so it can't be deleted.");
        movements.deleteByProductId(id);
        alertRepo.deleteByProductId(id);
        products.delete(p);
    }

    private void apply(Product p, ProductRequest r, String sku) {
        Category c = categories.findById(r.categoryId()).orElseThrow(() -> new NotFoundException("Category not found."));
        p.setName(r.name().trim());
        p.setSku(sku);
        p.setCategory(c);
        p.setDescription(r.description());
        p.setPrice(r.price());
        p.setReorderThreshold(r.reorderThreshold());
    }

    private Product find(Long id) {
        return products.findById(id).orElseThrow(() -> new NotFoundException("Product not found."));
    }

    private ProductResponse toResponse(Product p) {
        return new ProductResponse(p.getId(), p.getName(), p.getSku(), p.getCategory().getId(), p.getCategory().getName(),
                p.getDescription(), p.getPrice(), p.getStockQuantity(), p.getReorderThreshold(), p.status());
    }
}
