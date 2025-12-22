package com.halo.ecommerce.Entity;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
public class SellerReport {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @OneToOne
    private Seller seller;

    private  Long totalEarnings = 0L;

    private  Long totalSales = 0L;

    private  Long totalRefunds = 0L;

    private  Long totalTax = 0L;

    private  Long netEarnings = 0L;

    private Integer totalOrders = 0;

    private  Integer canceledOrders = 0;

    private  Integer totalTransactions = 0;

    public void setCanceledOrders(int i) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'setCanceledOrders'");
    }

    public void setTotalRefunds(long l) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'setTotalRefunds'");
    }

}
