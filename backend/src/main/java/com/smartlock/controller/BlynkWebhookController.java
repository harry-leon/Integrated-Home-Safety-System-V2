package com.smartlock.controller;

import com.smartlock.dto.DeviceReportDTO;
import com.smartlock.model.Device;
import com.smartlock.model.enums.AccessAction;
import com.smartlock.model.enums.AccessMethod;
import com.smartlock.repository.DeviceRepository;
import com.smartlock.service.AuditLogService;
import com.smartlock.service.BlynkService;
import com.smartlock.service.CommandService;
import com.smartlock.service.DeviceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/integration/blynk")
@RequiredArgsConstructor
@Slf4j
public class BlynkWebhookController {

    private final SimpMessagingTemplate messagingTemplate;
    private final AuditLogService auditLogService;
    private final DeviceRepository deviceRepository;
    private final CommandService commandService;
    private final DeviceService deviceService;

    @Value("${blynk.auth-token:}")
    private String globalWebhookToken;

    @GetMapping("/webhook")
    public ResponseEntity<Void> handleBlynkWebhook(
            @RequestParam String deviceCode,
            @RequestParam String pin,
            @RequestParam String value,
            @RequestParam(required = false) String token) {

        log.info("Received Blynk Webhook: Device={}, Pin={}, Value={}", deviceCode, pin, value);

        Optional<Device> deviceOpt = deviceRepository.findByDeviceCode(deviceCode);
        if (deviceOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Device device = deviceOpt.get();
        boolean matchesGlobalToken = token != null && token.equals(globalWebhookToken);
        boolean matchesDeviceToken = token != null
                && device.getProviderToken() != null
                && token.equals(device.getProviderToken());
        if (!matchesGlobalToken && !matchesDeviceToken) {
            log.warn("Unauthorized webhook attempt for device {}", deviceCode);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        boolean wasOffline = !device.isOnline();
        device.setOnline(true);
        device.setLastSeen(LocalDateTime.now());
        deviceRepository.save(device);

        if (wasOffline) {
            commandService.processOfflineCommands(device);
        }

        messagingTemplate.convertAndSend(
                "/topic/devices/" + deviceCode + "/updates",
                "Pin " + pin + " changed to " + value
        );

        handleTelemetryPin(deviceCode, pin, value);

        if ("V10".equals(pin)) {
            try {
                String[] parts = value.split(":");
                if (parts.length >= 2) {
                    UUID commandId = UUID.fromString(parts[0]);
                    boolean isSuccess = "SUCCESS".equalsIgnoreCase(parts[1]);
                    String reason = parts.length > 2 ? parts[2] : "";
                    commandService.acknowledgeCommand(commandId, isSuccess, reason);
                }
            } catch (Exception e) {
                log.error("Failed to parse command acknowledgement: {}", value);
            }
        }

        if ("V11".equals(pin)) {
            try {
                String[] parts = value.split(":");
                if (parts.length >= 3) {
                    AccessAction action = AccessAction.valueOf(parts[0].toUpperCase());
                    AccessMethod method = AccessMethod.valueOf(parts[1].toUpperCase());
                    String detail = parts[2];
                    auditLogService.logAction(device, action, method, detail);
                }
            } catch (Exception e) {
                log.error("Failed to parse physical action: {}", value);
            }
        }

        return ResponseEntity.ok().build();
    }

    private void handleTelemetryPin(String deviceCode, String pin, String value) {
        try {
            DeviceReportDTO report = new DeviceReportDTO();
            report.setDeviceCode(deviceCode);
            Boolean pirTriggered = null;

            String normalizedPin = pin.toUpperCase();
            if (normalizedPin.equals("V" + BlynkService.PIN_GAS_VALUE)) {
                report.setGasValue(parseInteger(value));
            } else if (normalizedPin.equals("V" + BlynkService.PIN_TEMPERATURE)) {
                report.setTemperature(parseDouble(value));
            } else if (normalizedPin.equals("V" + BlynkService.PIN_WEATHER_CONDITION)) {
                report.setWeatherDesc(value);
            } else if (normalizedPin.equals("V" + BlynkService.PIN_PIR_VALUE)) {
                pirTriggered = parseBooleanSensor(value);
                report.setPirTriggered(pirTriggered);
            } else if (normalizedPin.equals("V" + BlynkService.PIN_LDR_VALUE)) {
                report.setLdrValue(parseInteger(value));
            } else {
                return;
            }

            var sensorData = deviceService.recordPartialSensorData(report, pirTriggered);
            HashMap<String, Object> payload = new HashMap<>();
            payload.put("deviceCode", deviceCode);
            payload.put("gasValue", sensorData.getGasValue());
            payload.put("ldrValue", sensorData.getLdrValue());
            payload.put("pirTriggered", sensorData.isPirTriggered());
            payload.put("temperature", sensorData.getTemperature());
            payload.put("weatherDesc", sensorData.getWeatherDesc());
            payload.put("recordedAt", sensorData.getRecordedAt());
            messagingTemplate.convertAndSend("/topic/devices/" + deviceCode + "/telemetry", payload);
        } catch (Exception e) {
            log.warn("Ignored telemetry pin {}={} for device {}: {}", pin, value, deviceCode, e.getMessage());
        }
    }

    private Integer parseInteger(String value) {
        return (int) Math.round(Double.parseDouble(value.trim()));
    }

    private Double parseDouble(String value) {
        return Double.parseDouble(value.trim());
    }

    private Boolean parseBooleanSensor(String value) {
        String normalized = value == null ? "" : value.trim().toLowerCase();
        return "1".equals(normalized)
                || "true".equals(normalized)
                || "high".equals(normalized)
                || "on".equals(normalized)
                || "motion".equals(normalized);
    }
}
