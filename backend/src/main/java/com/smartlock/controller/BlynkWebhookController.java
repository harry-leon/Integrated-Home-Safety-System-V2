package com.smartlock.controller;

import com.smartlock.model.Device;
import com.smartlock.model.enums.AccessAction;
import com.smartlock.model.enums.AccessMethod;
import com.smartlock.repository.DeviceRepository;
import com.smartlock.service.AuditLogService;
import com.smartlock.service.CommandService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

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
}
