package com.halo.ecommerce.Controller;

import com.halo.ecommerce.Entity.Address;
import com.halo.ecommerce.Entity.User;
import com.halo.ecommerce.Repository.AddressReepository;
import com.halo.ecommerce.Service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final AddressReepository addressRepository;

    @GetMapping("/profile")
    public ResponseEntity<User> createUserHandler(@RequestHeader("Authorization") String jwt) throws Exception {

        User user = userService.findUserByJwtToken(jwt);

        return ResponseEntity.ok(user);
    }


    @GetMapping("/addresses")
    public ResponseEntity<List<Address>> listAddresses(@RequestHeader("Authorization") String jwt) throws Exception {
        User user = userService.findUserByJwtToken(jwt);
        List<Address> list = addressRepository.findByUserId(user.getId());
        return ResponseEntity.ok(list);
    }

    @PostMapping("/addresses")
    public ResponseEntity<Address> addAddress(@RequestHeader("Authorization") String jwt,
                                              @RequestBody Address address) throws Exception {
        User user = userService.findUserByJwtToken(jwt);
        address.setUser(user);
        // Server-side idempotency: if identical address exists for this user, return existing
        Address existing = addressRepository
                .findFirstByUserIdAndAddressAndCityAndStateAndPinCodeAndMobileAndName(
                        user.getId(),
                        address.getAddress(),
                        address.getCity(),
                        address.getState(),
                        address.getPinCode(),
                        address.getMobile(),
                        address.getName())
                .orElse(null);
        if (existing != null) {
            return ResponseEntity.ok(existing);
        }
        Address saved = addressRepository.save(address);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/addresses/{id}")
    public ResponseEntity<Address> updateAddress(@RequestHeader("Authorization") String jwt,
                                                 @PathVariable Long id,
                                                 @RequestBody Address data) throws Exception {
        User user = userService.findUserByJwtToken(jwt);
        Address existing = addressRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new Exception("address not found"));
        if (data.getName() != null) existing.setName(data.getName());
        if (data.getLocalCity() != null) existing.setLocalCity(data.getLocalCity());
        if (data.getAddress() != null) existing.setAddress(data.getAddress());
        if (data.getCity() != null) existing.setCity(data.getCity());
        if (data.getState() != null) existing.setState(data.getState());
        if (data.getPinCode() != null) existing.setPinCode(data.getPinCode());
        if (data.getMobile() != null) existing.setMobile(data.getMobile());
        Address saved = addressRepository.save(existing);
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/addresses/{id}")
    public ResponseEntity<Void> deleteAddress(@RequestHeader("Authorization") String jwt,
                                              @PathVariable Long id) throws Exception {
        User user = userService.findUserByJwtToken(jwt);
        // Idempotent delete: do not error if already deleted or unauthorized
        addressRepository.deleteByIdAndUserId(id, user.getId());
        return ResponseEntity.noContent().build();
    }
}
