package com.halo.ecommerce.Controller;

import com.halo.ecommerce.Domain.AccountStatus;
import com.halo.ecommerce.Entity.Seller;
import com.halo.ecommerce.Entity.SellerReport;
import com.halo.ecommerce.Entity.VerificationCode;
import com.halo.ecommerce.Exceptions.SellerException;
import com.halo.ecommerce.Repository.VerificationCodeRepository;
import com.halo.ecommerce.Response.AuthResponse;
import com.halo.ecommerce.Service.AuthService;
import com.halo.ecommerce.Service.EmailService;
import com.halo.ecommerce.Service.SellerReportService;
import com.halo.ecommerce.Service.SellerService;

import com.halo.ecommerce.Utils.OtpUtil;
import jakarta.mail.MessagingException;
import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/sellers")
@RequiredArgsConstructor
public class SellerController {


    private final SellerService sellerService;
    private final VerificationCodeRepository verificationCodeRepository;
    private final AuthService authService;
    private final EmailService emailService;
    private final SellerReportService sellerReportService;

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> loginSeller(@RequestBody VerificationCode req) throws Exception {

        String otp = req.getOtp();
        String email = req.getEmail();
        req.setEmail("seller_"+email);
        AuthResponse authResponse = authService.signing(req);
        return ResponseEntity.ok(authResponse);
    }

    @PatchMapping("verify/otp/{otp}")
    public ResponseEntity<Seller> verifySellerEmail(@PathVariable String otp) throws Exception {

        VerificationCode verificationCode = verificationCodeRepository.findByOtp(otp);

        if (verificationCode==null || !verificationCode.getOtp().equals(otp)){
            throw new Exception("wrong otp...");
        }
        Seller seller = sellerService.verifyEmail(verificationCode.getEmail(),otp);
        return new ResponseEntity<>(seller, HttpStatus.OK);
    }

    @PostMapping
    public ResponseEntity<Seller> createSeller(@RequestBody Seller seller) throws Exception,MessagingException {

        System.out.println(">>> Incoming seller mobile: " + seller.getMobile()); // TEST

        String otp = OtpUtil.generateOtp();
        Seller savedSeller = sellerService.createSeller(seller);
        VerificationCode verificationCode = new VerificationCode();
        verificationCode.setOtp(otp);
        verificationCode.setEmail(seller.getEmail());
        verificationCodeRepository.save(verificationCode);

        String subject = "Gaurav Market Email Verification Code";
        String text = "Welcome to Gaurav Market, verify your account using this link";
        String frontend_url = "http://localhost:8080/verify/";
        emailService.sendVerificationOtpEmail(seller.getEmail(),verificationCode.getOtp(),subject,text + frontend_url);
        return new ResponseEntity<>(savedSeller,HttpStatus.CREATED);
    }

    @GetMapping("/id/{id}")
    public ResponseEntity<Seller> getSellerById(@PathVariable Long id) throws SellerException {

        Seller seller = sellerService.getSellerById(id);
        return new ResponseEntity<>(seller,HttpStatus.OK);
    }

    @GetMapping("/profile")
    public ResponseEntity<Seller> getSellerByJwt(@RequestHeader("Authorization") String jwt) throws Exception {

       Seller seller = sellerService.getSellerProfile(jwt);
       return new ResponseEntity<>(seller,HttpStatus.OK);
    }

    @GetMapping("/report")
    public ResponseEntity<SellerReport> getSellerByReport(@RequestHeader("Authorization") String jwt)throws Exception {

       Seller seller = sellerService.getSellerProfile(jwt);
        SellerReport sellerReport = sellerReportService.getSellerReport(seller);
       return new ResponseEntity<>(sellerReport,HttpStatus.OK);
    }

    @GetMapping
    public ResponseEntity<List<Seller>> getAllSellers(@RequestParam(required = false) AccountStatus status){
        List<Seller> sellers = sellerService.getAllSellers(status);
        return ResponseEntity.ok(sellers);
    }

    @PatchMapping
    public ResponseEntity<Seller> updateSellers(@RequestHeader("Authorization") String jwt, @RequestBody Seller seller) throws Exception {

        Seller profile = sellerService.getSellerProfile(jwt);
        Seller updateSeller = sellerService.updateSeller(profile.getId(),seller);
        return ResponseEntity.ok(updateSeller);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSeller(@PathVariable Long id) throws Exception {

        sellerService.deleteSeller(id);
        return ResponseEntity.noContent().build();
    }

}
