package com.halo.ecommerce.Controller;

import com.halo.ecommerce.Entity.Product;
import com.halo.ecommerce.Entity.User;
import com.halo.ecommerce.Entity.WishList;
import com.halo.ecommerce.Service.ProductService;
import com.halo.ecommerce.Service.UserService;
import com.halo.ecommerce.Service.WishListService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/wishList")
public class WishListController {

    private final WishListService wishListService;
    private final ProductService productService;
    private final UserService userService;

    @GetMapping()
    public ResponseEntity<WishList> getWishlistByUserId(
            @RequestHeader("Authorization") String jwt) throws Exception {

        User user = userService.findUserByJwtToken(jwt);
        WishList wishlist = wishListService.getWishListByUserId(user);
        return ResponseEntity.ok(wishlist);
    }

    @PostMapping("/add-product/{productId}")
    public ResponseEntity<WishList> addProductToWishlist(
            @PathVariable Long productId,
            @RequestHeader("Authorization") String jwt) throws Exception {

        Product product = productService.findProductById(productId);
        User user = userService.findUserByJwtToken(jwt);
        WishList updatedWishlist = wishListService.addProductToWishList(user, product);
        return ResponseEntity.ok(updatedWishlist);
    }

}
