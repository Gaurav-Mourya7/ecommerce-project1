package com.halo.ecommerce.Repository;

import com.halo.ecommerce.Entity.Address;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;

public interface AddressReepository extends JpaRepository<Address,Long> {
    List<Address> findByUserId(Long userId);
    Optional<Address> findByIdAndUserId(Long id, Long userId);

    @Transactional
    @Modifying
    long deleteByIdAndUserId(Long id, Long userId);

    Optional<Address> findFirstByUserIdAndAddressAndCityAndStateAndPinCodeAndMobileAndName(
            Long userId,
            String address,
            String city,
            String state,
            String pinCode,
            String mobile,
            String name);
}
