    package com.halo.ecommerce.Entity;

    import jakarta.persistence.*;
    import lombok.AllArgsConstructor;
    import lombok.Data;

    @Data
    @AllArgsConstructor
    @Entity
    public class Deal {

        @Id
        @GeneratedValue(strategy = GenerationType.AUTO)
        private Long id;

        private Integer discount;

        @OneToOne
        private HomeCategory category;
    }
