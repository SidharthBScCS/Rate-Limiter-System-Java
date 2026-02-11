package com.netflixclone.netflix_clone_backend.repository;

import com.netflixclone.netflix_clone_backend.entity.NetflixUser;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NetflixUserRepository extends JpaRepository<NetflixUser, Long> {
    Optional<NetflixUser> findByEmail(String email);

    boolean existsByEmail(String email);
}
