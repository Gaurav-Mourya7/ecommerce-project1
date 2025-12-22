package com.halo.ecommerce.Repository;

import com.halo.ecommerce.Entity.Cart;
import com.halo.ecommerce.Entity.CartItem;
import com.halo.ecommerce.Entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CartItemRepository extends JpaRepository<CartItem,Long> {

    CartItem findByCartAndProductAndSize(Cart cart, Product product, String size);
}
