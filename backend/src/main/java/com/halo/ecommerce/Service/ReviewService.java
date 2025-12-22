package com.halo.ecommerce.Service;

import com.halo.ecommerce.Entity.Product;
import com.halo.ecommerce.Entity.Review;
import com.halo.ecommerce.Entity.User;
import com.halo.ecommerce.Request.CreateReviewRequest;

import java.util.List;

public interface ReviewService {

    Review createReview(CreateReviewRequest createReviewRequest, User user, Product product);

    List<Review> getReviewByProductId(Long productId);

    Review updateReview(Long reviewId,String reviewText,double reviewRating,Long userId) throws Exception;

    void deleteReview(Long reviewId,Long userId) throws Exception;

    Review getReviewById(Long reviewId) throws Exception;
}
