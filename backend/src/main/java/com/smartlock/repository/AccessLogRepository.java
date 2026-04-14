package com.smartlock.repository;

import com.smartlock.model.AccessLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.EntityGraph;

@Repository
public interface AccessLogRepository extends JpaRepository<AccessLog, UUID>, JpaSpecificationExecutor<AccessLog> {
    
    @EntityGraph(attributePaths = {"device", "user", "fingerprint"})
    List<AccessLog> findByDeviceIdOrderByCreatedAtDesc(UUID deviceId);
    
    @EntityGraph(attributePaths = {"device", "user", "fingerprint"})
    List<AccessLog> findByCreatedAtBetweenOrderByCreatedAtDesc(LocalDateTime start, LocalDateTime end);
    
    @EntityGraph(attributePaths = {"device", "user", "fingerprint"})
    List<AccessLog> findAllByOrderByCreatedAtDesc();
}
