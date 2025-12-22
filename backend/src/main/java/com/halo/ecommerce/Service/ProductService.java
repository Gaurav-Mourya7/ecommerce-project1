package com.halo.ecommerce.Service;

import com.halo.ecommerce.Entity.Product;
import com.halo.ecommerce.Entity.Seller;
import com.halo.ecommerce.Exceptions.ProductException;
import com.halo.ecommerce.Request.CreateProductRequest;
import org.springframework.data.domain.Page;


import java.util.List;

public interface ProductService {

    Product createProduct(CreateProductRequest createProductRequest, Seller seller) throws IllegalAccessException;
    void deleteProduct(Long productId) throws ProductException;
    Product updateProduct(Long productId, CreateProductRequest update) throws ProductException;
    Product findProductById(Long productId) throws ProductException;
    List<Product> searchProducts(String query);
    Page<Product> getAllProducts(
            String category,
            String brand,
            String colors,
            String sizes,
            Integer minPrice,
            Integer maxPrice,
            Integer minDiscount,
            String sort,
            String stocks,
            String query,
            Integer pageNumber
    );
    List<Product> getProductBySellerId(Long sellerId);

}
