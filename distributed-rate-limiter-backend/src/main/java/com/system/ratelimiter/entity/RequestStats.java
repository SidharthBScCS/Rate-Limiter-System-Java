package com.system.ratelimiter.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "request_stats")
public class RequestStats {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long totalRequests;

    @Column(nullable = false)
    private Long allowedRequests;

    @Column(nullable = false)
    private Long blockedRequests;

    public Long getId() {
        return id;
    }

    public Long getTotalRequests() {
        return totalRequests;
    }

    public void setTotalRequests(Long totalRequests) {
        this.totalRequests = totalRequests;
    }

    public Long getAllowedRequests() {
        return allowedRequests;
    }

    public void setAllowedRequests(Long allowedRequests) {
        this.allowedRequests = allowedRequests;
    }

    public Long getBlockedRequests() {
        return blockedRequests;
    }

    public void setBlockedRequests(Long blockedRequests) {
        this.blockedRequests = blockedRequests;
    }
}
