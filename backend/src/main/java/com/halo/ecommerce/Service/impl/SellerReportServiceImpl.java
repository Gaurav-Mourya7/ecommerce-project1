package com.halo.ecommerce.Service.impl;

import com.halo.ecommerce.Entity.Seller;
import com.halo.ecommerce.Entity.SellerReport;
import com.halo.ecommerce.Repository.SellerReportRepository;
import com.halo.ecommerce.Service.SellerReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class SellerReportServiceImpl implements SellerReportService {

    private final SellerReportRepository sellerReportRepository;

    @Override
    public SellerReport getSellerReport(Seller seller) {

        SellerReport sellerReport = sellerReportRepository.findBySellerId(seller.getId());

        if (sellerReport==null){
            SellerReport newReport = new SellerReport();
            newReport.setSeller(seller);
            return sellerReportRepository.save(newReport);
        }
        return sellerReport;
    }

    @Override
    public SellerReport updateSellerReport(SellerReport sellerReport) {
        return sellerReportRepository.save(sellerReport);
    }
}
