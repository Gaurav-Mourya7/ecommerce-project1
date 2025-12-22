package com.halo.ecommerce.Service.impl;

import com.halo.ecommerce.Entity.Cart;
import com.halo.ecommerce.Entity.Coupon;
import com.halo.ecommerce.Entity.User;
import com.halo.ecommerce.Repository.CartRepository;
import com.halo.ecommerce.Repository.CouponRepository;
import com.halo.ecommerce.Repository.UserRepository;
import com.halo.ecommerce.Service.CouponService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CouponServiceImpl implements CouponService {

    private final CartRepository cartRepository;
    private final CouponRepository couponRepository;
    private final UserRepository userRepository;

    @Override
    public Cart applyCoupon(String code, double orderValue, User user) throws Exception {

        Coupon coupon = couponRepository.findByCode(code);
        Cart cart = cartRepository.findByUserId(user.getId());

        if (coupon == null) {
            throw new Exception("Coupon not valid");
        }

        if (user.getUsedCoupons().contains(coupon)) {
            throw new Exception("Coupon already used");
        }

        if (orderValue < coupon.getMinimumOrderValue()) {
            throw new Exception("Valid only for minimum order value");
        }
        if (coupon.isActive() && LocalDate.now().isAfter(coupon.getValidateStartDate()) && LocalDate.now().isBefore(coupon.getValidateEndDate())) {

            // Mark coupon as used
            user.getUsedCoupons().add(coupon);
            userRepository.save(user);

            // Calculate discounted price
            double discountedPrice = cart.getTotalSellingPrice() * coupon.getDiscountPercentage() / 100;

            // Apply discount and set coupon
            cart.setTotalSellingPrice(cart.getTotalSellingPrice() - discountedPrice);
            cart.setCouponCode(code);
            cartRepository.save(cart);
            return cart;
        }
// If coupon is inactive or expired
        throw new Exception("Coupon not valid");
    }

    @Override
    public Cart removeCoupon(String code, User user) throws Exception {

        Coupon coupon = couponRepository.findByCode(code);
        Cart cart = cartRepository.findByUserId(user.getId());

        if (coupon == null) {
            throw new Exception("Coupon not found");
        }

        double discountedPrice = cart.getTotalSellingPrice() * coupon.getDiscountPercentage() / 100;

        cart.setTotalSellingPrice(cart.getTotalSellingPrice() + discountedPrice);
        cart.setCouponCode(null);
        cartRepository.save(cart);
        return cart;
    }

    @Override
    public Coupon findCouponById(Long id) throws Exception {
        return couponRepository.findById(id).orElseThrow(()->
                new Exception("coupon not found"));
    }

    @Override
    @PreAuthorize("hasRole('ADMIN')")
    public Coupon createCoupon(Coupon coupon) {
        return couponRepository.save(coupon);
    }

    @Override
    public List<Coupon> findAllCoupons() {
        return couponRepository.findAll();
    }

    @Override
    @PreAuthorize("hasRole('ADMIN')")
    public void deleteCoupon(Long id) throws Exception {
        findCouponById(id);
        couponRepository.deleteById(id);
    }
}
