package com.halo.ecommerce.Service.impl;

import com.halo.ecommerce.Domain.OrderStatus;
import com.halo.ecommerce.Domain.PaymentStatus;
import com.halo.ecommerce.Entity.*;
import com.halo.ecommerce.Repository.AddressReepository;
import com.halo.ecommerce.Repository.OrderItemRepository;
import com.halo.ecommerce.Repository.OrderRepository;
import com.halo.ecommerce.Service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final AddressReepository addressRepository;
    private final OrderItemRepository orderItemRepository;

    @Override
    public Set<Order> createOrder(User user, Address shippingAddress, Cart cart) {

        if (!user.getAddresses().contains(shippingAddress)){
            user.getAddresses().add(shippingAddress);
        }
        Address address = addressRepository.save(shippingAddress);

//        brand 1=> 4 shirts
//        brand 2=> 3 jeans
//        brand 3=> 1 watch

        Map<Long,List<CartItem>> itemBySeller = cart.getCartItems().stream()
                .collect(Collectors.groupingBy(cartItem -> cartItem.getProduct()
                        .getSeller().getId()));

        Set<Order> orders = new HashSet<>();

        for (Map.Entry<Long,List<CartItem>> entry:itemBySeller.entrySet()){
            Long sellerId = entry.getKey();
            List<CartItem> items = entry.getValue();

            int totalOrderPrice = items.stream().mapToInt(CartItem::getSellingPrice).sum();
            int totalItem = items.stream().mapToInt(CartItem::getQuantity).sum();

            Order createdOrder = new Order();
            createdOrder.setUser(user);
            createdOrder.setSellerId(sellerId);
            createdOrder.setTotalMrpPrice(totalOrderPrice);
            createdOrder.setTotalSellingPrice(totalOrderPrice);
            createdOrder.setTotalItem(totalItem);
            createdOrder.setShippingAddress(address);
            createdOrder.setOrderStatus(OrderStatus.PENDING);
            createdOrder.getPaymentDetails().setStatus(PaymentStatus.PENDING);

            Order savedOrder = orderRepository.save(createdOrder);
            orders.add(savedOrder);

            List<OrderItem> orderItems = new ArrayList<>();

            for (CartItem item:items) {
                OrderItem orderItem = new OrderItem();
                orderItem.setOrder(savedOrder);
                orderItem.setMrpPrice(item.getMrpPrice());
                orderItem.setQuantity(item.getQuantity());
                orderItem.setProduct(item.getProduct());
                orderItem.setSize(item.getSize());
                orderItem.setSellingPrice(item.getSellingPrice());
                orderItem.setUserId(item.getUserId());

                savedOrder.getOrderItems().add(orderItem);

                OrderItem savedOrderItem = orderItemRepository.save(orderItem);
                orderItems.add(savedOrderItem);
            }
        }
        return orders;
    }

    @Override
    public Order findOrderById(Long id) throws Exception {
        return orderRepository.findById(id).orElseThrow(()->
                new Exception("order not found"));
    }

    @Override
    public List<Order> usersOrderHistory(Long userId) {
        return orderRepository.findByUserId(userId);
    }

    @Override
    public List<Order> sellerOrder(Long sellerId) {
        return orderRepository.findBySellerId(sellerId);
    }

    @Override
    public Order updateOrderStatus(Long orderId, OrderStatus orderStatus) throws Exception {

        Order order = findOrderById(orderId);
        order.setOrderStatus(orderStatus);
        return orderRepository.save(order);
    }

    @Override
    public Order cancelOrder(Long orderId, User user) throws Exception {

        Order order = findOrderById(orderId);
        // Only the same user who created the order can cancel it
        if (!user.getId().equals(order.getUser().getId())){
            throw new Exception("You do not have access to this order");
        }
        // Prevent cancellation after shipping/delivery or if already cancelled
        OrderStatus status = order.getOrderStatus();
        if (status == OrderStatus.SHIPPED || status == OrderStatus.DELIVERED || status == OrderStatus.CANCELLED) {
            throw new Exception("Order cannot be cancelled at this stage");
        }
        order.setOrderStatus(OrderStatus.CANCELLED);
        return orderRepository.save(order);

    }

    @Override
    public OrderItem getOrderItemsById(Long id) throws Exception {
        return orderItemRepository.findById(id).orElseThrow(()->
                 new Exception("order item not exist..."));
    }
}
