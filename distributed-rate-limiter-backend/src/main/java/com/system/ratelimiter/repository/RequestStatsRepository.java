package com.system.ratelimiter.repository;

import com.system.ratelimiter.entity.RequestStats;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RequestStatsRepository extends JpaRepository<RequestStats, Long> {
    Optional<RequestStats> findTopByOrderByIdAsc();

    @Query("""
            select
                coalesce(sum(rs.totalRequests), 0),
                coalesce(sum(rs.allowedRequests), 0),
                coalesce(sum(rs.blockedRequests), 0)
            from RequestStats rs
            """)
    Object[] sumTotals();
}
