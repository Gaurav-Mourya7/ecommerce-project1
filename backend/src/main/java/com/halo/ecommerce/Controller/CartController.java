package com.halo.ecommerce.Controller;

import com.halo.ecommerce.Entity.Cart;
import com.halo.ecommerce.Entity.CartItem;
import com.halo.ecommerce.Entity.Product;
import com.halo.ecommerce.Entity.User;
import com.halo.ecommerce.Request.AddItemRequest;
import com.halo.ecommerce.Response.ApiResponse;
import com.halo.ecommerce.Service.CartItemsService;
import com.halo.ecommerce.Service.CartService;
import com.halo.ecommerce.Service.ProductService;
import com.halo.ecommerce.Service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/cart")
public class CartController {

    private final CartService cartServices;
    private final UserService userService;
    private final ProductService productService;
    private final CartItemsService cartItemsService;

    @GetMapping
    public ResponseEntity<Cart> findUserCartHandler(@RequestHeader("Authorization") String jwt) throws Exception {

        User user = userService.findUserByJwtToken(jwt);
        Cart cart = cartServices.findUserCart(user);

        System.out.println("cart:"+cart.getUser().getEmail());

        return new ResponseEntity<>(cart, HttpStatus.OK);
    }

    @PutMapping("/add")
        public ResponseEntity<CartItem> addItemToCart(@RequestBody AddItemRequest addItemRequest,@RequestHeader("Authorization") String jwt) throws Exception {

        User user = userService.findUserByJwtToken(jwt);
        Product product = productService.findProductById(addItemRequest.getProductId());
        CartItem item = cartServices.addCartItem(user,product,addItemRequest.getSize(),addItemRequest.getQuantity());

        ApiResponse apiResponse = new ApiResponse();
        apiResponse.setMessage("Item Added To Cart Successfully");
        return new ResponseEntity<>(item,HttpStatus.ACCEPTED);
    }

    @DeleteMapping("/item/{cartItemId}")
    public ResponseEntity<ApiResponse> deleteCartItemHandler(@PathVariable Long cartItemId,@RequestHeader("Authorization") String jwt) throws Exception {

        User user = userService.findUserByJwtToken(jwt);
        cartItemsService.removeCartItem(user.getId(), cartItemId);

        ApiResponse apiResponse = new ApiResponse();
        apiResponse.setMessage("Item Remove From Cart Successfully");
        return new ResponseEntity<>(apiResponse,HttpStatus.ACCEPTED);
    }

    @PutMapping("/item/{cartItemId}")
    public ResponseEntity<CartItem> deleteCartItemHandler(@PathVariable Long cartItemId,@RequestHeader("Authorization") String jwt,@RequestBody CartItem cartItem) throws Exception {

        User user = userService.findUserByJwtToken(jwt);
        CartItem updateCartItem = cartItemsService.updateCartItem(user.getId(), cartItemId, cartItem);
        return new ResponseEntity<>(updateCartItem, HttpStatus.ACCEPTED);
    }
}
