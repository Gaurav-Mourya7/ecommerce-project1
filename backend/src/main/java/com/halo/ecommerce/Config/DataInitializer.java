package com.halo.ecommerce.Config;

import com.halo.ecommerce.Entity.Category;
import com.halo.ecommerce.Repository.CategoryRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DataInitializer {

    @Bean
    public CommandLineRunner initCategories(CategoryRepository categoryRepository) {
        return args -> {
            // Only run if no categories exist
            if (categoryRepository.count() == 0) {
                // Level 1: Main Categories
                Category men = saveCategory(categoryRepository, "Men", "men", null, 1);
                Category women = saveCategory(categoryRepository, "Women", "women", null, 1);
                Category kids = saveCategory(categoryRepository, "Kids", "kids", null, 1);

                // Level 2: Subcategories
                Category menClothing = saveCategory(categoryRepository, "Men's Clothing", "men_clothing", men, 2);
                Category womenClothing = saveCategory(categoryRepository, "Women's Clothing", "women_clothing", women, 2);
                Category kidsClothing = saveCategory(categoryRepository, "Kids' Clothing", "kids_clothing", kids, 2);

                // Level 3: Product Types
                saveCategory(categoryRepository, "Men's T-Shirt", "men_tshirt", menClothing, 3);
                saveCategory(categoryRepository, "Men's Shirt", "men_shirt", menClothing, 3);
                saveCategory(categoryRepository, "Women's Saree", "women_saree", womenClothing, 3);
                saveCategory(categoryRepository, "Women's Dress", "women_dress", womenClothing, 3);
                saveCategory(categoryRepository, "Kids' Hoodie", "kids_hoodie", kidsClothing, 3);
                saveCategory(categoryRepository, "Kids' T-Shirt", "kids_tshirt", kidsClothing, 3);
            }
        };
    }

    private Category saveCategory(CategoryRepository repo, String name, String categoryId, Category parent, int level) {
        Category category = new Category();
        category.setName(name);
        category.setCategoryId(categoryId);
        category.setParentCategory(parent);
        category.setLevel(level);
        return repo.save(category);
    }
}