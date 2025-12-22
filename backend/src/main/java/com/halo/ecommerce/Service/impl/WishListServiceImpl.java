package com.halo.ecommerce.Service.impl;

import com.halo.ecommerce.Entity.Product;
import com.halo.ecommerce.Entity.User;
import com.halo.ecommerce.Entity.WishList;
import com.halo.ecommerce.Repository.WishListRepository;
import com.halo.ecommerce.Service.WishListService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class WishListServiceImpl implements WishListService {

    private final WishListRepository wishListRepository;

    @Override
    public WishList createWishList(User user) {

        WishList wishList = new WishList();
        wishList.setUser(user);
        return wishListRepository.save(wishList);
    }

    @Override
    public WishList getWishListByUserId(User user) {

        WishList wishList = wishListRepository.findByUserId(user.getId());

        if (wishList==null){
            wishList = createWishList(user);
        }
        return wishList;
    }

    @Override
    public WishList addProductToWishList(User user, Product product) {

        WishList wishList = getWishListByUserId(user);

        if (wishList.getProducts().contains(product)) {
            wishList.getProducts().remove(product); // toggle off
        } else {
            wishList.getProducts().add(product); // toggle on
        }
        return wishListRepository.save(wishList);
    }
}
