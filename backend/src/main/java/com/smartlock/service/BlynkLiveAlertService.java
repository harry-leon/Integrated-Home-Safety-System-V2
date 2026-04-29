package com.smartlock.service;

import com.smartlock.dto.AlertResponseDTO;
import com.smartlock.model.Device;
import com.smartlock.model.DeviceSettings;
import com.smartlock.model.enums.AlertType;
import com.smartlock.repository.DeviceRepository;
import com.smartlock.repository.DeviceSettingsRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class BlynkLiveAlertService {

    private static final int DEFAULT_GAS_THRESHOLD = 300;

    private final BlynkService blynkService;
    private final DeviceRepository deviceRepository;
    private final DeviceSettingsRepository deviceSettingsRepository;
    private final DeviceAccessService deviceAccessService;

    @Value("${blynk.auth-token:}")
    private String globalAuthToken;

    public List<AlertResponseDTO> getLiveAlerts(UUID deviceId, Authentication authentication) {
        if (deviceId != null) {
            deviceAccessService.requireView(deviceId, authentication);
        }

        boolean admin = deviceAccessService.isAdmin(authentication);
        List<UUID> accessibleIds = deviceAccessService.getAccessibleDeviceIds(authentication);

        List<Device> devices;
        if (deviceId != null) {
            devices = deviceRepository.findById(deviceId).map(List::of).orElseGet(List::of);
        } else if (admin) {
            devices = deviceRepository.findAll();
        } else {
            devices = accessibleIds.isEmpty() ? List.of() : deviceRepository.findAllById(accessibleIds);
        }

        LocalDateTime now = LocalDateTime.now();
        List<AlertResponseDTO> result = new ArrayList<>();

        for (Device device : devices) {
            if (device == null || device.getId() == null) {
                continue;
            }
            if (device.getProviderType() == null || !"BLYNK".equalsIgnoreCase(device.getProviderType())) {
                continue;
            }

            String token = resolveToken(device);
            if (token == null || token.isBlank() || "YOUR_AUTH_TOKEN".equals(token)) {
                continue;
            }

            try {
                Integer gasValue = parseInteger(normalizeBlynkValue(blynkService.getVirtualPin(BlynkService.PIN_GAS_VALUE, token)));
                Boolean pirTriggered = parseBoolean(normalizeBlynkValue(blynkService.getVirtualPin(BlynkService.PIN_PIR_VALUE, token)));

                DeviceSettings settings = deviceSettingsRepository.findByDeviceId(device.getId()).orElse(null);

                int gasThreshold = settings != null && settings.getGasThreshold() != null
                        ? settings.getGasThreshold()
                        : DEFAULT_GAS_THRESHOLD;
                boolean gasAlertEnabled = settings == null || settings.isGasAlertEnabled();
                boolean pirAlertEnabled = settings == null || settings.isPirAlertEnabled();

                boolean gasTriggered = gasAlertEnabled && gasValue != null && gasValue > gasThreshold;
                boolean intruderTriggered = pirAlertEnabled && Boolean.TRUE.equals(pirTriggered);

                if (gasTriggered) {
                    result.add(alertPayload(
                            device.getId(),
                            AlertType.GAS_LEAK,
                            "CRITICAL",
                            "Abnormal gas levels detected! Value: " + gasValue,
                            gasValue,
                            now
                    ));
                }

                if (intruderTriggered) {
                    result.add(alertPayload(
                            device.getId(),
                            AlertType.INTRUDER_ALERT,
                            "WARNING",
                            "Motion detected by PIR sensor.",
                            null,
                            now
                    ));
                }
            } catch (Exception e) {
                log.warn("Unable to fetch live alerts from Blynk for device {}: {}", device.getDeviceCode(), e.getMessage());
            }
        }

        result.sort(Comparator.comparing(AlertResponseDTO::getCreatedAt, Comparator.nullsLast(Comparator.naturalOrder())).reversed());
        return result;
    }

    private AlertResponseDTO alertPayload(
            UUID deviceId,
            AlertType type,
            String severity,
            String message,
            Integer sensorValue,
            LocalDateTime createdAt
    ) {
        UUID id = UUID.nameUUIDFromBytes((deviceId + ":" + type.name()).getBytes(StandardCharsets.UTF_8));
        return AlertResponseDTO.builder()
                .id(id)
                .deviceId(deviceId)
                .alertType(type)
                .severity(severity)
                .message(message)
                .sensorValue(sensorValue)
                .isResolved(false)
                .createdAt(createdAt)
                .resolvedAt(null)
                .resolvedBy(null)
                .build();
    }

    private String resolveToken(Device device) {
        if (device.getProviderToken() != null && !device.getProviderToken().isBlank()) {
            return device.getProviderToken();
        }
        return globalAuthToken;
    }

    private Integer parseInteger(String value) {
        Double parsed = parseDouble(value);
        return parsed == null ? null : (int) Math.round(parsed);
    }

    private Double parseDouble(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        try {
            return Double.parseDouble(value);
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private Boolean parseBoolean(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        String normalized = value.trim().toLowerCase();
        return "1".equals(normalized)
                || "true".equals(normalized)
                || "high".equals(normalized)
                || "on".equals(normalized)
                || "motion".equals(normalized);
    }

    private String normalizeBlynkValue(String value) {
        if (value == null) {
            return null;
        }
        String normalized = value.trim();
        if (normalized.startsWith("[") && normalized.endsWith("]")) {
            normalized = normalized.substring(1, normalized.length() - 1).trim();
        }
        if (normalized.length() >= 2 && normalized.startsWith("\"") && normalized.endsWith("\"")) {
            normalized = normalized.substring(1, normalized.length() - 1);
        }
        return normalized.isBlank() ? null : normalized;
    }
}

