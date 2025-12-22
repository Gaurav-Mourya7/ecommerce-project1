package com.halo.ecommerce.Controller;

import com.halo.ecommerce.Domain.AccountStatus;
import com.halo.ecommerce.Entity.Seller;
import com.halo.ecommerce.Exceptions.SellerException;
import com.halo.ecommerce.Service.SellerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin")
public class AdminController {

    private final SellerService sellerService;

    @PatchMapping("/seller/{id}/status/{status}")
    public ResponseEntity<Seller> updateSellerStatus(@PathVariable Long id,@PathVariable AccountStatus status) throws Exception {

        Seller updatedSeller = sellerService.updateSellerAccountStatus(id, status);
        return ResponseEntity.ok(updatedSeller);

    }

    @GetMapping("/sellers")
    public ResponseEntity<java.util.List<Seller>> listSellers(@org.springframework.web.bind.annotation.RequestParam(required = false) AccountStatus status) {
        java.util.List<Seller> sellers = sellerService.getAllSellers(status);
        return ResponseEntity.ok(sellers);
    }

}
