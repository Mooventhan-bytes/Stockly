package com.smartinventory.service;

import com.smartinventory.dto.CategoryRequest;
import com.smartinventory.dto.CategoryResponse;
import com.smartinventory.entity.Category;
import com.smartinventory.exception.ConflictException;
import com.smartinventory.exception.NotFoundException;
import com.smartinventory.repository.CategoryRepository;
import com.smartinventory.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryService {
    private final CategoryRepository categories;
    private final ProductRepository products;

    @Transactional(readOnly = true)
    public List<CategoryResponse> list() {
        return categories.findAll(Sort.by("name")).stream().map(this::toResponse).toList();
    }

    @Transactional
    public CategoryResponse create(CategoryRequest r) {
        String name = r.name().trim();
        if (categories.existsByNameIgnoreCase(name)) throw new ConflictException("A category with this name already exists.");
        Category c = new Category();
        c.setName(name);
        c.setDescription(r.description());
        return toResponse(categories.save(c));
    }

    @Transactional
    public CategoryResponse update(Long id, CategoryRequest r) {
        Category c = find(id);
        String name = r.name().trim();
        if (categories.existsByNameIgnoreCaseAndIdNot(name, id)) throw new ConflictException("A category with this name already exists.");
        c.setName(name);
        c.setDescription(r.description());
        return toResponse(c);
    }

    @Transactional
    public void delete(Long id) {
        Category c = find(id);
        long n = products.countByCategoryId(id);
        if (n > 0) throw new ConflictException(n + " product(s) use this category. Move them to another category first.");
        categories.delete(c);
    }

    Category find(Long id) {
        return categories.findById(id).orElseThrow(() -> new NotFoundException("Category not found."));
    }

    private CategoryResponse toResponse(Category c) {
        return new CategoryResponse(c.getId(), c.getName(), c.getDescription(), products.countByCategoryId(c.getId()));
    }
}
