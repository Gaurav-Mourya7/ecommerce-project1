package com.halo.ecommerce.Service;

import com.halo.ecommerce.Entity.CartItem;

public interface CartItemsService {

    CartItem updateCartItem(Long userId, Long id, CartItem cartItem) throws Exception;
    void removeCartItem(Long userId, Long cartItemId) throws Exception;
    CartItem findCartItemById(Long id) throws Exception;
}


