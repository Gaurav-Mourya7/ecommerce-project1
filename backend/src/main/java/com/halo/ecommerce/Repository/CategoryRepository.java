package com.halo.ecommerce.Repository;

import com.halo.ecommerce.Entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface CategoryRepository extends JpaRepository<Category,Long> {

    Category findByCategoryId(String categoryId);
    // Find all level 3 categories (slugs) for a given level 1 category slug (categoryId)
    @Query("SELECT c FROM Category c WHERE c.level = 3 AND c.parentCategory.parentCategory.categoryId = :level1CategoryId")
    List<Category> findLevel3ByLevel1CategoryId(@Param("level1CategoryId") String level1CategoryId);
}
