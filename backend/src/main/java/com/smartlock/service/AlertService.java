package com.smartlock.service;

import com.smartlock.dto.AlertResponseDTO;
import com.smartlock.model.Alert;
import com.smartlock.model.Device;
import com.smartlock.model.User;
import com.smartlock.model.enums.AlertType;
import com.smartlock.repository.AlertRepository;
import com.smartlock.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.criteria.Predicate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AlertService {

    private final AlertRepository alertRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    @Transactional
    public Alert createAlert(Device device, AlertType type, String severity, String message, Integer value) {
        Alert alert = Alert.builder()
                .device(device)
                .alertType(type)
                .severity(severity)
                .message(message)
                .sensorValue(value)
                .isResolved(false)
                .build();

        Alert savedAlert = alertRepository.save(alert);
        log.info("Alert created: {} for device {}", type, device.getDeviceCode());
        
        // Trigger notification for serious alerts
        notificationService.sendAlertNotification(savedAlert);
        
        return savedAlert;
    }

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

    @Transactional(readOnly = true)
    public String exportAlertsToCSV(UUID deviceId, LocalDateTime start, LocalDateTime end) {
        try {
            List<Alert> alerts;
            if (deviceId != null && start != null && end != null) {
                alerts = alertRepository.findByDeviceIdAndCreatedAtBetween(deviceId, start, end);
            } else {
                alerts = alertRepository.findAllWithDevice();
            }

            StringBuilder csvBuilder = new StringBuilder();
            csvBuilder.append("ID,DeviceID,AlertType,Severity,Message,IsResolved,CreatedAt,ResolvedAt\n");

            for (Alert a : alerts) {
                try {
                    csvBuilder.append(a.getId() != null ? a.getId().toString() : "").append(",");
                    
                    String devId = "";
                    try {
                        if (a.getDevice() != null) {
                            devId = a.getDevice().getId().toString();
                        }
                    } catch (Exception e) {
                        devId = "ERROR_LOADING_DEVICE";
                    }
                    csvBuilder.append(devId).append(",");
                    
                    csvBuilder.append(a.getAlertType() != null ? a.getAlertType().name() : "").append(",");
                    csvBuilder.append(escapeSpecialCharacters(a.getSeverity())).append(",");
                    csvBuilder.append(escapeSpecialCharacters(a.getMessage())).append(",");
                    csvBuilder.append(a.isResolved()).append(",");
                    csvBuilder.append(a.getCreatedAt() != null ? a.getCreatedAt().toString() : "").append(",");
                    csvBuilder.append(a.getResolvedAt() != null ? a.getResolvedAt().toString() : "").append("\n");
                } catch (Exception e) {
                    csvBuilder.append("ERROR_PROCESSING_ROW\n");
                }
            }
            return csvBuilder.toString();
        } catch (Exception e) {
            return "ERROR_GENERATING_EXPORT: " + e.getMessage();
        }
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
