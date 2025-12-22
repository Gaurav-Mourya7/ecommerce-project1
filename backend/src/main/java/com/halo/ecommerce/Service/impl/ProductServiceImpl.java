package com.halo.ecommerce.Service.impl;

import com.halo.ecommerce.Entity.Category;
import com.halo.ecommerce.Entity.Product;
import com.halo.ecommerce.Entity.Seller;
import com.halo.ecommerce.Exceptions.ProductException;
import com.halo.ecommerce.Repository.CategoryRepository;
import com.halo.ecommerce.Repository.ProductRepository;
import com.halo.ecommerce.Request.CreateProductRequest;
import com.halo.ecommerce.Service.ProductService;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.JoinType;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * @author Halo
 * @date 2021/11/15
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    @Override
    public Product createProduct(CreateProductRequest createProductRequest, Seller seller) throws IllegalAccessException {

        // Normalize categories to prevent mismatched hierarchies
        String c3 = createProductRequest.getCategory3();
        String c1 = createProductRequest.getCategory1();
        if (c3 != null) {
            String lc = c3.toLowerCase();
            if (lc.startsWith("men_")) c1 = "men";
            else if (lc.startsWith("women_")) c1 = "women";
            else if (lc.startsWith("kids_")) c1 = "kids";
        }
        String c2 = (createProductRequest.getCategory2() == null || createProductRequest.getCategory2().isBlank()) ? "clothing" : createProductRequest.getCategory2();

        Category category1 = categoryRepository.findByCategoryId(c1);

        if (category1==null){
            Category category = new Category();
            category.setCategoryId(c1);
            category.setLevel(1);
            category1 = categoryRepository.save(category);
        }

        Category category2 = categoryRepository.findByCategoryId(c2);

        if (category2==null){
            Category category = new Category();
            category.setCategoryId(c2);
            category.setLevel(2);
            category.setParentCategory(category1);
            category2 = categoryRepository.save(category);
        }

        Category category3 = categoryRepository.findByCategoryId(c3);

        if (category3==null){
            Category category = new Category();
            category.setCategoryId(c3);
            category.setLevel(3);
            category.setParentCategory(category2);
            category3 = categoryRepository.save(category);
        }

        int discountPercentage = calculatedDiscountPercentage(createProductRequest.getMrpPrice(),createProductRequest.getSellingPrice());

        Product product = new Product();
        product.setSeller(seller);
        product.setCategory(category3);
        product.setCreatedAt(LocalDateTime.now());
        product.setDescription(createProductRequest.getDescription());
        product.setTitle(createProductRequest.getTitle());
        product.setColor(createProductRequest.getColor());
        product.setSellingPrice(createProductRequest.getSellingPrice());
        product.setImages(createProductRequest.getImages());
        product.setMrpPrice(createProductRequest.getMrpPrice());
        product.setSizes(createProductRequest.getSizes());
        product.setDiscountPercent(discountPercentage);

        return productRepository.save(product);
    }

    private int calculatedDiscountPercentage(int mrpPrice, int sellingPrice) throws IllegalAccessException {

        if (mrpPrice<=0) {
            throw new IllegalAccessException("Actual Price must be greater than 0");
        }
        double discountPrice = mrpPrice-sellingPrice;
        double discountPercentages = (discountPrice/mrpPrice)*100;
        return (int)discountPercentages;
    }

    @Override
    public void deleteProduct(Long productId) throws ProductException {

        Product product = findProductById(productId);
        productRepository.delete(product);
    }

    @Override
    public Product updateProduct(Long productId, CreateProductRequest update) throws ProductException {

        Product existing = findProductById(productId);

        if (update.getTitle()!=null) existing.setTitle(update.getTitle());
        if (update.getDescription()!=null) existing.setDescription(update.getDescription());
        if (update.getColor()!=null) existing.setColor(update.getColor());
        if (update.getImages()!=null && !update.getImages().isEmpty()) existing.setImages(update.getImages());
        if (update.getSizes()!=null) existing.setSizes(update.getSizes());
        if (update.getMrpPrice()>0) existing.setMrpPrice(update.getMrpPrice());
        if (update.getSellingPrice()>0) existing.setSellingPrice(update.getSellingPrice());

        // recalc discount if prices present
        try {
            if (existing.getMrpPrice()>0 && existing.getSellingPrice()>0) {
                existing.setDiscountPercent(calculatedDiscountPercentage(existing.getMrpPrice(), existing.getSellingPrice()));
            }
        } catch (IllegalAccessException ignored) {}

        // update category through category1/2/3 if provided
        if (update.getCategory1()!=null && update.getCategory2()!=null && update.getCategory3()!=null) {
            Category category1 = categoryRepository.findByCategoryId(update.getCategory1());
            if (category1==null){
                Category c = new Category();
                c.setCategoryId(update.getCategory1());
                c.setLevel(1);
                category1 = categoryRepository.save(c);
            }
            Category category2 = categoryRepository.findByCategoryId(update.getCategory2());
            if (category2==null){
                Category c = new Category();
                c.setCategoryId(update.getCategory2());
                c.setLevel(2);
                c.setParentCategory(category1);
                category2 = categoryRepository.save(c);
            }
            Category category3 = categoryRepository.findByCategoryId(update.getCategory3());
            if (category3==null){
                Category c = new Category();
                c.setCategoryId(update.getCategory3());
                c.setLevel(3);
                c.setParentCategory(category2);
                category3 = categoryRepository.save(c);
            }
            existing.setCategory(category3);
        }

        return productRepository.save(existing);
    }

    @Override
    public Product findProductById(Long productId) throws ProductException {
        return productRepository.findById(productId).orElseThrow(()->
                new ProductException("product not found with id"+productId));
    }

    @Override
    public List<Product> searchProducts(String query) {
        return productRepository.searchProduct(query);
    }

    @Override
    public Page<Product> getAllProducts(String category, String brand, String color, String sizes, Integer minPrice, Integer maxPrice, Integer minDiscount, String sort, String stocks, String searchQuery, Integer pageNumber) {

        Specification<Product> specification = ((root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (category != null && !category.isEmpty()) {
                Join<Product, Category> categoryJoin = root.join("category");
                List<Predicate> categoryPredicates = new ArrayList<>();

                // If it's a base category (men, women, kids, accessories, electronics)
                if (category.matches("^(men|women|kids|accessories|electronics|cosmetics)$")) {
                    // Match by category hierarchy (direct children and deeper)
                    categoryPredicates.add(criteriaBuilder.like(categoryJoin.get("categoryId"), category + "_%"));
                    // Also include direct matches to the base category
                    categoryPredicates.add(criteriaBuilder.equal(categoryJoin.get("categoryId"), category));
                } else if (category.equalsIgnoreCase("all")) {
                    // Don't add any predicates for 'All' type
                } else {
                    // For specific subcategories, match exactly
                    categoryPredicates.add(criteriaBuilder.equal(categoryJoin.get("categoryId"), category));
                }

                // Match by numeric ID if provided
                try {
                    Long catId = Long.parseLong(category);
                    categoryPredicates.add(criteriaBuilder.equal(categoryJoin.get("id"), catId));
                } catch (NumberFormatException ignored) {}

                if (!categoryPredicates.isEmpty()) {
                    predicates.add(criteriaBuilder.or(categoryPredicates.toArray(new Predicate[0])));
                }
            }
            if (color!=null && !color.isEmpty()){
                System.out.println("color"+color);
                predicates.add(
                        criteriaBuilder.equal(
                                criteriaBuilder.lower(root.get("color")),
                                color.toLowerCase()
                        )
                );
            }
            if (sizes!=null && !sizes.isEmpty()){

                predicates.add(criteriaBuilder.equal(root.get("sizes"),sizes));
            }
            if (minPrice!=null){

                predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get("sellingPrice"),minPrice));
            }
            if (maxPrice!=null){

                predicates.add(criteriaBuilder.lessThanOrEqualTo(root.get("sellingPrice"),maxPrice));
            }
            if (minDiscount!=null){
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get("discountPercent"),minDiscount));
            }
            if (stocks!=null){
                predicates.add(criteriaBuilder.equal(root.get("quantity"),stocks));
            }
            if (searchQuery != null && !searchQuery.isEmpty()) {
                Predicate titleLike = criteriaBuilder.like(criteriaBuilder.lower(root.get("title")), "%" + searchQuery.toLowerCase() + "%");
                predicates.add(titleLike);
            }
            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        });
        Pageable pageable;
        if (sort != null && !sort.isEmpty()) {
            pageable = switch (sort) {
                case "price_low" -> PageRequest.of(pageNumber != null ? pageNumber : 0, 10,
                        Sort.by("sellingPrice").ascending());
                case "price_high" -> PageRequest.of(pageNumber != null ? pageNumber : 0, 10,
                        Sort.by("sellingPrice").descending());
                case "new" -> PageRequest.of(pageNumber != null ? pageNumber : 0, 10,
                        Sort.by("createdAt").descending());
                default -> PageRequest.of(pageNumber != null ? pageNumber : 0, 10,
                        Sort.by("sellingPrice").ascending());
            };
        }
        else {
            pageable = PageRequest.of(pageNumber!=null ? pageNumber:0,10,Sort.by("createdAt").descending());
        }
        return productRepository.findAll(specification,pageable);
    }

    @Override
    public List<Product> getProductBySellerId(Long sellerId) {
        return productRepository.findBySellerId(sellerId);
    }
}
