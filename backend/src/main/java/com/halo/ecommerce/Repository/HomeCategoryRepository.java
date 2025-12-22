package com.halo.ecommerce.Repository;

import com.halo.ecommerce.Entity.HomeCategory;
import org.springframework.data.jpa.repository.JpaRepository;

public interface HomeCategoryRepository extends JpaRepository<HomeCategory,Long> {
}
