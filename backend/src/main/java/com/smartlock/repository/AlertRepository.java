package com.smartlock.repository;

import com.smartlock.model.Alert;
import com.smartlock.model.enums.AlertType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AlertRepository extends JpaRepository<Alert, UUID>, JpaSpecificationExecutor<Alert> {
    Page<Alert> findByDeviceId(UUID deviceId, Pageable pageable);

    @org.springframework.data.jpa.repository.Query("SELECT a FROM Alert a LEFT JOIN FETCH a.device")
    List<Alert> findAllWithDevice();

    List<Alert> findByDeviceIdAndCreatedAtBetween(UUID deviceId, LocalDateTime start, LocalDateTime end);
    Optional<Alert> findTopByDeviceIdAndAlertTypeOrderByCreatedAtDesc(UUID deviceId, AlertType alertType);
    Optional<Alert> findTopByDeviceIdAndAlertTypeAndIsResolvedFalseOrderByCreatedAtDesc(UUID deviceId, AlertType alertType);

    long countByDeviceIdAndCreatedAtBetween(UUID deviceId, LocalDateTime start, LocalDateTime end);
    long countByCreatedAtBetween(LocalDateTime start, LocalDateTime end);
    long countByCreatedAtBetweenAndSeverity(LocalDateTime start, LocalDateTime end, String severity);
}
