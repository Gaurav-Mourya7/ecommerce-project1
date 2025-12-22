package com.halo.ecommerce.Service;

import com.halo.ecommerce.Entity.Product;
import com.halo.ecommerce.Entity.User;
import com.halo.ecommerce.Entity.WishList;

public interface WishListService {

    WishList createWishList(User user);

    WishList getWishListByUserId(User user);

    WishList addProductToWishList(User user, Product product);
}
