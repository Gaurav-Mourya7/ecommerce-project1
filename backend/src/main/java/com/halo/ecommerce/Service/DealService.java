package com.halo.ecommerce.Service;

import com.halo.ecommerce.Entity.Deal;

import java.util.List;

public interface DealService{

    List<Deal> getDeals();
    Deal createDeal(Deal deal);
    Deal updateDeal(Deal deal,Long id) throws Exception;
    Deal deleteDeal(Long id) throws Exception;
}
