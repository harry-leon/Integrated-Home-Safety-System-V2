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
    
    @org.springframework.data.jpa.repository.Query("SELECT a FROM AccessLog a " +
            "LEFT JOIN FETCH a.device " +
            "LEFT JOIN FETCH a.user " +
            "LEFT JOIN FETCH a.fingerprint " +
            "WHERE (:deviceId IS NULL OR a.device.id = :deviceId) " +
            "AND (:start IS NULL OR a.createdAt >= :start) " +
            "AND (:end IS NULL OR a.createdAt <= :end) " +
            "ORDER BY a.createdAt DESC")
    List<AccessLog> findLogsOptimized(
            @org.springframework.data.repository.query.Param("deviceId") java.util.UUID deviceId,
            @org.springframework.data.repository.query.Param("start") java.time.LocalDateTime start,
            @org.springframework.data.repository.query.Param("end") java.time.LocalDateTime end);

    @org.springframework.data.jpa.repository.Query("SELECT a FROM AccessLog a " +
            "LEFT JOIN FETCH a.device " +
            "LEFT JOIN FETCH a.user " +
            "LEFT JOIN FETCH a.fingerprint " +
            "ORDER BY a.createdAt DESC")
    List<AccessLog> findAllOptimized();
}
