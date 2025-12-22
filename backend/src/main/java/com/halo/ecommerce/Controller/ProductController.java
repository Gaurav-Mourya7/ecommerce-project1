package com.halo.ecommerce.Controller;

import com.halo.ecommerce.Entity.Product;
import com.halo.ecommerce.Exceptions.ProductException;
import com.halo.ecommerce.Service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/products")
public class ProductController {

    private final ProductService productService;

    @GetMapping("/{productId}")
    public ResponseEntity<Product> getProductId(@PathVariable Long productId) throws ProductException {
        Product product = productService.findProductById(productId);
        return new ResponseEntity<>(product, HttpStatus.OK);
    }

    @GetMapping("/search")
    public ResponseEntity<List<Product>> searchProduct(@RequestParam(required = false) String query) {
        List<Product> products = productService.searchProducts(query);
        return new ResponseEntity<>(products, HttpStatus.OK);
    }

    @GetMapping
    public ResponseEntity<Page<Product>> getAllProducts(@RequestParam(required = false) String category,
                                                        @RequestParam(required = false) String brand,
                                                        @RequestParam(required = false) String color,
                                                        @RequestParam(required = false) String sizes,
                                                        @RequestParam(required = false) Integer minPrice,
                                                        @RequestParam(required = false) Integer maxPrice,
                                                        @RequestParam(required = false) Integer minDiscount,
                                                        @RequestParam(required = false) String sort,
                                                        @RequestParam(required = false) String stocks,
                                                        @RequestParam(required = false, name = "query") String query,
                                                        @RequestParam(defaultValue = "0") Integer pageNumber) {
        System.out.println("colors p --------"+pageNumber);
        return new ResponseEntity<>(productService.getAllProducts(category,brand,color,sizes,minPrice,maxPrice,
                                                        minDiscount,sort,stocks,query,pageNumber), HttpStatus.OK);
    }
}
