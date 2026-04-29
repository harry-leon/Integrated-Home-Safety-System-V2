package com.smartlock.repository;

import com.smartlock.model.AccessLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

@Repository
public interface AccessLogRepository extends JpaRepository<AccessLog, UUID>, JpaSpecificationExecutor<AccessLog> {
    
    @org.springframework.data.jpa.repository.Query("SELECT a FROM AccessLog a " +
            "LEFT JOIN FETCH a.device " +
            "LEFT JOIN FETCH a.user " +
            "LEFT JOIN FETCH a.fingerprint " +
            "WHERE a.device.id = COALESCE(:deviceId, a.device.id) " +
            "AND a.createdAt >= COALESCE(:start, a.createdAt) " +
            "AND a.createdAt <= COALESCE(:end, a.createdAt) " +
            "ORDER BY a.createdAt DESC")
    List<AccessLog> findLogsOptimized(
            @org.springframework.data.repository.query.Param("deviceId") java.util.UUID deviceId,
            @org.springframework.data.repository.query.Param("start") java.time.LocalDateTime start,
            @org.springframework.data.repository.query.Param("end") java.time.LocalDateTime end);

    @org.springframework.data.jpa.repository.Query(
            value = "SELECT a FROM AccessLog a " +
                    "LEFT JOIN FETCH a.device " +
                    "LEFT JOIN FETCH a.user " +
                    "LEFT JOIN FETCH a.fingerprint " +
                    "WHERE a.device.id = COALESCE(:deviceId, a.device.id) " +
                    "AND (:admin = true OR a.device.id IN :accessibleDeviceIds) " +
                    "AND a.createdAt >= COALESCE(:start, a.createdAt) " +
                    "AND a.createdAt <= COALESCE(:end, a.createdAt) " +
                    "ORDER BY a.createdAt DESC",
            countQuery = "SELECT COUNT(a) FROM AccessLog a " +
                    "WHERE a.device.id = COALESCE(:deviceId, a.device.id) " +
                    "AND (:admin = true OR a.device.id IN :accessibleDeviceIds) " +
                    "AND a.createdAt >= COALESCE(:start, a.createdAt) " +
                    "AND a.createdAt <= COALESCE(:end, a.createdAt)"
    )
    Page<AccessLog> findLogsPage(
            @org.springframework.data.repository.query.Param("deviceId") UUID deviceId,
            @org.springframework.data.repository.query.Param("accessibleDeviceIds") List<UUID> accessibleDeviceIds,
            @org.springframework.data.repository.query.Param("admin") boolean admin,
            @org.springframework.data.repository.query.Param("start") LocalDateTime start,
            @org.springframework.data.repository.query.Param("end") LocalDateTime end,
            Pageable pageable);

    @org.springframework.data.jpa.repository.Query("SELECT a FROM AccessLog a " +
            "LEFT JOIN FETCH a.device " +
            "LEFT JOIN FETCH a.user " +
            "LEFT JOIN FETCH a.fingerprint " +
            "ORDER BY a.createdAt DESC")
    List<AccessLog> findAllOptimized();

    long countByCreatedAtBetween(LocalDateTime start, LocalDateTime end);
    long countByDeviceIdAndCreatedAtBetween(UUID deviceId, LocalDateTime start, LocalDateTime end);
    
    @org.springframework.data.jpa.repository.Query("SELECT COUNT(a) FROM AccessLog a WHERE a.action = 'DENIED' AND a.createdAt BETWEEN :start AND :end")
    long countFailedAttemptsBetween(LocalDateTime start, LocalDateTime end);

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(a) FROM AccessLog a WHERE a.device.id = :deviceId AND a.action = 'DENIED' AND a.createdAt BETWEEN :start AND :end")
    long countFailedAttemptsByDeviceBetween(UUID deviceId, LocalDateTime start, LocalDateTime end);

    @EntityGraph(attributePaths = {"device", "user", "fingerprint"})
    java.util.Optional<AccessLog> findTopByDeviceIdOrderByCreatedAtDesc(UUID deviceId);

    @Modifying
    @Query("UPDATE AccessLog a SET a.fingerprint = null WHERE a.fingerprint.id = :fingerprintId")
    int clearFingerprintReference(@Param("fingerprintId") UUID fingerprintId);
}
