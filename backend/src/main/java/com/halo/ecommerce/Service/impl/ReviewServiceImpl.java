package com.halo.ecommerce.Service.impl;

import com.halo.ecommerce.Entity.Product;
import com.halo.ecommerce.Entity.Review;
import com.halo.ecommerce.Entity.User;
import com.halo.ecommerce.Repository.ReviewRepository;
import com.halo.ecommerce.Request.CreateReviewRequest;
import com.halo.ecommerce.Service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepository;

    @Override
    public Review createReview(CreateReviewRequest createReviewRequest, User user, Product product) {
        Review review = new Review();

        review.setUser(user);
        review.setProduct(product);
        review.setReviewText(createReviewRequest.getReviewText());
        review.setRating(createReviewRequest.getReviewRating());
        review.setProductImages(createReviewRequest.getProductImages());

        product.getReviews().add(review); // Linking review to product (bidirectional relation)

        return reviewRepository.save(review); // Saving review in DB

    }

    @Override
    public List<Review> getReviewByProductId(Long productId) {
        return reviewRepository.findByProductId(productId);
    }

    @Override
    public Review updateReview(Long reviewId, String reviewText, double reviewRating, Long userId) throws Exception {

        Review review = getReviewById(reviewId);

        if (review.getUser().getId().equals(userId)){
            review.setReviewText(reviewText);
            review.setRating(reviewRating);
            return reviewRepository.save(review);
        }
        throw new Exception("you cannot update this review");
    }

    @Override
    public void deleteReview(Long reviewId, Long userId) throws Exception {

        Review review = getReviewById(reviewId);

        if (review.getUser().getId().equals(userId)){
            throw new Exception("you cannot delete this review");
        }
        reviewRepository.delete(review);
    }

    @Override
    public Review getReviewById(Long reviewId) throws Exception {
        return reviewRepository.findById(reviewId).orElseThrow(()->
                new Exception("review not found"));
    }
}
