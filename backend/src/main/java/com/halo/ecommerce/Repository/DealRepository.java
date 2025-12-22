package com.halo.ecommerce.Repository;

import com.halo.ecommerce.Entity.Deal;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DealRepository extends JpaRepository<Deal,Long> {
}
