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
import java.util.UUID;

@Repository
public interface AlertRepository extends JpaRepository<Alert, UUID>, JpaSpecificationExecutor<Alert> {
    Page<Alert> findByDeviceId(UUID deviceId, Pageable pageable);
    List<Alert> findByDeviceIdAndCreatedAtBetween(UUID deviceId, LocalDateTime start, LocalDateTime end);
}
