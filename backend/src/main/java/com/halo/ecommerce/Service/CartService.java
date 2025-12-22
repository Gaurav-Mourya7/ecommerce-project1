package com.halo.ecommerce.Service;

import com.halo.ecommerce.Entity.Cart;
import com.halo.ecommerce.Entity.CartItem;
import com.halo.ecommerce.Entity.Product;
import com.halo.ecommerce.Entity.User;

public interface CartService {

    CartItem addCartItem(User user, Product product, String size, int quantity) throws IllegalAccessException;
    Cart findUserCart(User user) throws IllegalAccessException;

}
