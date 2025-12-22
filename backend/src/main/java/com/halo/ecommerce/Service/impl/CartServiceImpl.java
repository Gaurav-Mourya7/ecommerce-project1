package com.halo.ecommerce.Service.impl;

import com.halo.ecommerce.Entity.Cart;
import com.halo.ecommerce.Entity.CartItem;
import com.halo.ecommerce.Entity.Product;
import com.halo.ecommerce.Entity.User;
import com.halo.ecommerce.Repository.CartItemRepository;
import com.halo.ecommerce.Repository.CartRepository;
import com.halo.ecommerce.Service.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CartServiceImpl implements CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;

    @Override
    public CartItem addCartItem(User user, Product product, String size, int quantity) throws IllegalAccessException {

        Cart cart = findUserCart(user);
        CartItem isPresent = cartItemRepository.findByCartAndProductAndSize(cart,product,size);

        if (isPresent==null){
            CartItem cartItem = new CartItem();
            cartItem.setProduct(product);
            cartItem.setSize(size);
            cartItem.setQuantity(quantity);
            cartItem.setUserId(user.getId());

            int totalPrice = quantity*product.getSellingPrice();
            cartItem.setSellingPrice(totalPrice);
            cartItem.setMrpPrice(quantity*product.getMrpPrice());

            cart.getCartItems().add(cartItem);
            cartItem.setCart(cart);

            return cartItemRepository.save(cartItem);
        }
        return isPresent;
    }

    @Override
    public Cart findUserCart(User user) throws IllegalAccessException {

        Cart cart = cartRepository.findByUserId(user.getId());

        int totalPrice = 0;
        int totalDiscountPrice = 0;
        int totalItem = 0;

        for (CartItem cartItem: cart.getCartItems()){
            totalPrice+=cartItem.getMrpPrice();
            totalDiscountPrice+= cartItem.getSellingPrice();
            totalItem+=cartItem.getQuantity();
        }

        cart.setTotalMrpPrice(totalPrice);
        cart.setTotalItem(totalItem);
        cart.setTotalSellingPrice(totalDiscountPrice);
        cart.setDiscount(calculatedDiscountPercentage(totalPrice,totalDiscountPrice));
        cart.setTotalItem(totalItem);
        return cart;
    }

    private int calculatedDiscountPercentage(int mrpPrice, int sellingPrice) throws IllegalAccessException {

        if (mrpPrice<=0) {
           return 0;
        }
        double discountPrice = mrpPrice-sellingPrice;
        double discountPercentages = (discountPrice/mrpPrice)*100;
        return (int)discountPercentages;
    }

}
