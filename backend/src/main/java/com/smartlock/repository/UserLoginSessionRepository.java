package com.smartlock.repository;

import com.smartlock.model.UserLoginSession;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UserLoginSessionRepository extends JpaRepository<UserLoginSession, UUID> {
    Optional<UserLoginSession> findBySessionTokenHash(String sessionTokenHash);
    List<UserLoginSession> findTop10ByUserIdOrderByLastActiveAtDesc(UUID userId);
}
