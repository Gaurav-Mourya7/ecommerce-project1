package com.halo.ecommerce.Entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
public class Address {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    private String name;

    private String localCity;

    private String address;

    private String city;

    private String state;

    private String pinCode;

    private String mobile;

    @ManyToOne
    @JsonIgnore
    private User user;
}
