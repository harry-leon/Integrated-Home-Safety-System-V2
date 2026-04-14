package com.smartlock.service;

import com.smartlock.dto.AlertResponseDTO;
import com.smartlock.model.Alert;
import com.smartlock.model.User;
import com.smartlock.model.enums.AlertType;
import com.smartlock.repository.AlertRepository;
import com.smartlock.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import jakarta.persistence.criteria.Predicate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AlertService {

    private final AlertRepository alertRepository;
    private final UserRepository userRepository;

    public Page<AlertResponseDTO> getAlerts(UUID deviceId, AlertType type, String severity, Boolean isResolved, LocalDateTime start, LocalDateTime end, Pageable pageable) {
        Specification<Alert> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            
            if (deviceId != null) {
                predicates.add(cb.equal(root.get("device").get("id"), deviceId));
            }
            if (type != null) {
                predicates.add(cb.equal(root.get("alertType"), type));
            }
            if (severity != null) {
                predicates.add(cb.equal(root.get("severity"), severity));
            }
            if (isResolved != null) {
                predicates.add(cb.equal(root.get("isResolved"), isResolved));
            }
            if (start != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("createdAt"), start));
            }
            if (end != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("createdAt"), end));
            }
            
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return alertRepository.findAll(spec, pageable).map(this::mapToDTO);
    }

    public void resolveAlert(UUID alertId, String username) {
        Alert alert = alertRepository.findById(alertId)
                .orElseThrow(() -> new RuntimeException("Alert not found"));
        User user = userRepository.findByEmail(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!alert.isResolved()) {
            alert.setResolved(true);
            alert.setResolvedAt(LocalDateTime.now());
            alert.setResolvedBy(user);
            alertRepository.save(alert);
        }
    }

    public String exportAlertsToCSV(UUID deviceId, LocalDateTime start, LocalDateTime end) {
        List<Alert> alerts;
        if (deviceId != null && start != null && end != null) {
            alerts = alertRepository.findByDeviceIdAndCreatedAtBetween(deviceId, start, end);
        } else {
            alerts = alertRepository.findAll();
        }

        StringBuilder csvBuilder = new StringBuilder();
        csvBuilder.append("ID,DeviceID,AlertType,Severity,Message,IsResolved,CreatedAt,ResolvedAt\n");

        for (Alert a : alerts) {
            csvBuilder.append(a.getId() != null ? a.getId().toString() : "").append(",");
            csvBuilder.append(a.getDevice() != null ? a.getDevice().getId().toString() : "").append(",");
            csvBuilder.append(a.getAlertType() != null ? a.getAlertType().name() : "").append(",");
            csvBuilder.append(escapeSpecialCharacters(a.getSeverity())).append(",");
            csvBuilder.append(escapeSpecialCharacters(a.getMessage())).append(",");
            csvBuilder.append(a.isResolved()).append(",");
            csvBuilder.append(a.getCreatedAt() != null ? a.getCreatedAt().toString() : "").append(",");
            csvBuilder.append(a.getResolvedAt() != null ? a.getResolvedAt().toString() : "").append("\n");
        }
        return csvBuilder.toString();
    }

    private String escapeSpecialCharacters(String data) {
        if (data == null) return "";
        String escapedData = data.replaceAll("\\R", " ");
        if (data.contains(",") || data.contains("\"") || data.contains("'")) {
            data = data.replace("\"", "\"\"");
            escapedData = "\"" + data + "\"";
        }
        return escapedData;
    }

    private AlertResponseDTO mapToDTO(Alert alert) {
        return AlertResponseDTO.builder()
                .id(alert.getId())
                .deviceId(alert.getDevice() != null ? alert.getDevice().getId() : null)
                .alertType(alert.getAlertType())
                .severity(alert.getSeverity())
                .message(alert.getMessage())
                .sensorValue(alert.getSensorValue())
                .isResolved(alert.isResolved())
                .resolvedBy(alert.getResolvedBy() != null ? alert.getResolvedBy().getId() : null)
                .createdAt(alert.getCreatedAt())
                .resolvedAt(alert.getResolvedAt())
                .build();
    }
}
