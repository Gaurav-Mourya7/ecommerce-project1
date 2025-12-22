package com.halo.ecommerce.Repository;

import com.halo.ecommerce.Domain.AccountStatus;
import com.halo.ecommerce.Entity.Seller;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface SellerRepository extends JpaRepository<Seller,Long> {

    @Query("SELECT s FROM Seller s WHERE s.email = :email GROUP BY s.email")
    Seller findByEmail(String email);

    List<Seller> findByAccountStatus(AccountStatus status);
}
