package com.halo.ecommerce.Repository;

import com.halo.ecommerce.Entity.WishList;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WishListRepository extends JpaRepository<WishList,Long> {

    WishList findByUserId(Long userId);
}
