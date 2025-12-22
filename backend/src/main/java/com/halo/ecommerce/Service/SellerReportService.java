package com.halo.ecommerce.Service;

import com.halo.ecommerce.Entity.Seller;
import com.halo.ecommerce.Entity.SellerReport;

public interface SellerReportService {

    SellerReport getSellerReport(Seller seller);

    SellerReport updateSellerReport(SellerReport sellerReport);
}
