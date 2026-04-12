package com.smartlock.repository;

import com.smartlock.model.AccessLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface AccessLogRepository extends JpaRepository<AccessLog, UUID> {
    List<AccessLog> findByDeviceIdOrderByCreatedAtDesc(UUID deviceId);
    List<AccessLog> findByCreatedAtBetweenOrderByCreatedAtDesc(LocalDateTime start, LocalDateTime end);
    List<AccessLog> findAllByOrderByCreatedAtDesc();
}
