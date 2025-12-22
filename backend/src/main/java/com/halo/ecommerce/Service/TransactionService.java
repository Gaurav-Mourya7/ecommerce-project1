package com.halo.ecommerce.Service;

import com.halo.ecommerce.Entity.Order;
import com.halo.ecommerce.Entity.Seller;
import com.halo.ecommerce.Entity.Transaction;

import java.util.List;

public interface TransactionService {

    Transaction createTransaction(Order order);
    List<Transaction> getAllTransactionBySellerId(Seller seller);
    List<Transaction> getAllTransactions();


}
