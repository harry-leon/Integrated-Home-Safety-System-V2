package com.smartlock.repository;

import com.smartlock.model.UserDetail;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface UserDetailRepository extends JpaRepository<UserDetail, UUID> {
    Optional<UserDetail> findByUserId(UUID userId);
}
