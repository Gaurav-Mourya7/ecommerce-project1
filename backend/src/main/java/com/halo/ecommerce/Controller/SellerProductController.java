package com.halo.ecommerce.Controller;

import com.halo.ecommerce.Entity.Product;
import com.halo.ecommerce.Entity.Seller;
import com.halo.ecommerce.Exceptions.ProductException;
import com.halo.ecommerce.Request.CreateProductRequest;
import com.halo.ecommerce.Service.ProductService;
import com.halo.ecommerce.Service.SellerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/sellers/products")
public class SellerProductController {

    private final SellerService sellerService;
    private final ProductService productService;

    @GetMapping
    public ResponseEntity<List<Product>> getProductBySellerId(@RequestHeader("Authorization") String jwt) throws Exception {

        Seller seller = sellerService.getSellerProfile(jwt);
        List<Product> products = productService.getProductBySellerId(seller.getId());
        return new ResponseEntity<>(products, HttpStatus.OK);
    }

    @PostMapping
    public ResponseEntity<Product> createProduct(@RequestBody CreateProductRequest createProductRequest, @RequestHeader("Authorization") String jwt) throws Exception {

        Seller seller = sellerService.getSellerProfile(jwt);
        Product product = productService.createProduct(createProductRequest,seller);
        return new ResponseEntity<>(product,HttpStatus.OK);
    }

    @DeleteMapping("/{productId}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long productId) throws ProductException {

            productService.deleteProduct(productId);
            return new ResponseEntity<>(HttpStatus.OK);
    }

    @PutMapping("/{productId}")
    public ResponseEntity<Product> updateProduct(@PathVariable Long productId, @RequestBody CreateProductRequest product) throws ProductException {

            Product updateProduct = productService.updateProduct(productId,product);
            return new ResponseEntity<>(updateProduct,HttpStatus.OK);
    }
}
