package com.smartlock.service;

import com.smartlock.dto.AlertResponseDTO;
import com.smartlock.model.Alert;
import com.smartlock.model.Device;
import com.smartlock.model.DeviceSettings;
import com.smartlock.model.User;
import com.smartlock.model.enums.AlertType;
import com.smartlock.repository.AlertRepository;
import com.smartlock.repository.DeviceSettingsRepository;
import com.smartlock.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.core.Authentication;
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

    private static final int DEFAULT_GAS_THRESHOLD = 1400;

    private final AlertRepository alertRepository;
    private final DeviceSettingsRepository deviceSettingsRepository;
    private final UserRepository userRepository;
    private final DeviceAccessService deviceAccessService;

    public Page<AlertResponseDTO> getAlerts(
            UUID deviceId,
            List<UUID> accessibleDeviceIds,
            boolean admin,
            AlertType type,
            String severity,
            Boolean isResolved,
            LocalDateTime start,
            LocalDateTime end,
            Pageable pageable
    ) {
        Specification<Alert> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            
            if (deviceId != null) {
                predicates.add(cb.equal(root.get("device").get("id"), deviceId));
            } else if (!admin) {
                if (accessibleDeviceIds.isEmpty()) {
                    predicates.add(cb.disjunction());
                } else {
                    predicates.add(root.get("device").get("id").in(accessibleDeviceIds));
                }
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

    public void resolveAlert(UUID alertId, String username, Authentication authentication) {
        Alert alert = alertRepository.findById(alertId)
                .orElseThrow(() -> new RuntimeException("Alert not found"));
        deviceAccessService.requireControl(alert.getDevice().getId(), authentication);
        User user = userRepository.findByEmail(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!alert.isResolved()) {
            alert.setResolved(true);
            alert.setResolvedAt(LocalDateTime.now());
            alert.setResolvedBy(user);
            alertRepository.save(alert);
        }
    }

    public void processTelemetryAlerts(Device device, Integer gasValue, boolean pirTriggered) {
        DeviceSettings settings = deviceSettingsRepository.findByDeviceId(device.getId()).orElse(null);

        int gasThreshold = settings != null && settings.getGasThreshold() != null
                ? settings.getGasThreshold()
                : DEFAULT_GAS_THRESHOLD;
        boolean gasAlertEnabled = settings == null || settings.isGasAlertEnabled();
        boolean gasTriggered = gasAlertEnabled && gasValue != null && gasValue > gasThreshold;

        if (gasTriggered) {
            createAlertIfAbsent(
                    device,
                    AlertType.GAS_LEAK,
                    "CRITICAL",
                    "Abnormal gas levels detected! Value: " + gasValue,
                    gasValue
            );
        } else {
            resolveOpenAlert(device, AlertType.GAS_LEAK);
        }

        // Raw PIR telemetry alone does not necessarily mean an intruder alert.
        // We resolve any previously open PIR alert here and leave future alert
        // creation to a dedicated explicit signal when the firmware provides one.
        resolveOpenAlert(device, AlertType.INTRUDER_ALERT);
    }

    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public String exportAlertsToCSV(UUID deviceId, List<UUID> accessibleDeviceIds, boolean admin, LocalDateTime start, LocalDateTime end) {
        try {
            List<Alert> alerts;
            if (deviceId != null && start != null && end != null) {
                alerts = alertRepository.findByDeviceIdAndCreatedAtBetween(deviceId, start, end);
            } else {
                alerts = alertRepository.findAllWithDevice();
            }
            if (!admin) {
                alerts = alerts.stream()
                        .filter(alert -> accessibleDeviceIds.contains(alert.getDevice().getId()))
                        .collect(Collectors.toList());
            }

            StringBuilder csvBuilder = new StringBuilder();
            csvBuilder.append("ID,DeviceID,AlertType,Severity,Message,IsResolved,CreatedAt,ResolvedAt\n");

            for (Alert a : alerts) {
                try {
                    csvBuilder.append(a.getId() != null ? a.getId().toString() : "").append(",");
                    
                    // Thêm kiểm tra kỹ hơn cho device để tránh LazyInitializationException hoặc NullPointer
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

    private void createAlertIfAbsent(Device device, AlertType alertType, String severity, String message, Integer sensorValue) {
        boolean hasOpenAlert = alertRepository
                .findTopByDeviceIdAndAlertTypeAndIsResolvedFalseOrderByCreatedAtDesc(device.getId(), alertType)
                .isPresent();

        if (hasOpenAlert) {
            return;
        }

        alertRepository.save(Alert.builder()
                .device(device)
                .alertType(alertType)
                .severity(severity)
                .message(message)
                .sensorValue(sensorValue)
                .isResolved(false)
                .build());
    }

    private void resolveOpenAlert(Device device, AlertType alertType) {
        alertRepository.findTopByDeviceIdAndAlertTypeAndIsResolvedFalseOrderByCreatedAtDesc(device.getId(), alertType)
                .ifPresent(alert -> {
                    alert.setResolved(true);
                    alert.setResolvedAt(LocalDateTime.now());
                    alertRepository.save(alert);
                });
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
