package com.smartlock.controller;

import com.smartlock.model.Device;
import com.smartlock.repository.DeviceRepository;
import com.smartlock.service.CommandService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.UUID;

@RestController
@RequestMapping("/api/integration/blynk")
@RequiredArgsConstructor
@Slf4j
public class BlynkWebhookController {

    private final SimpMessagingTemplate messagingTemplate;
    private final CommandService commandService;
    private final DeviceRepository deviceRepository;

    @org.springframework.beans.factory.annotation.Value("${blynk.webhook.secret}")
    private String webhookSecret;

    @PostMapping("/webhook")
    public ResponseEntity<Void> handleBlynkWebhook(
            @RequestHeader(value = "X-Verification-Token", required = false) String token,
            @RequestBody java.util.Map<String, String> payload) {
        
        if (token == null || !token.equals(webhookSecret)) {
            log.warn("Unauthorized Blynk webhook attempt. Invalid or missing token.");
            return ResponseEntity.status(org.springframework.http.HttpStatus.FORBIDDEN).build();
        }

        String deviceCode = payload.get("deviceCode");
        String pin = payload.get("pin");
        String value = payload.get("value");

        if (deviceCode == null || pin == null || value == null) {
            return ResponseEntity.badRequest().build();
        }
        
        log.info("Received Secure Blynk Webhook: Device={}, Pin={}, Value={}", deviceCode, pin, value);

        // 1. Cập nhật trạng thái Device là ONLINE
        deviceRepository.findByDeviceCode(deviceCode).ifPresent(device -> {
            device.setOnline(true);
            device.setLastSeen(LocalDateTime.now());
            deviceRepository.save(device);
        });

        // 2. Gửi dữ liệu real-time qua WebSocket
        messagingTemplate.convertAndSend("/topic/devices/" + deviceCode + "/updates", 
                "Pin " + pin + " changed to " + value);

        // 3. Xử lý xác nhận lệnh (Acknowledgement)
        if (pin.equals("V10")) {
            try {
                String[] parts = value.split(":");
                UUID commandId = UUID.fromString(parts[0]);
                boolean isSuccess = "SUCCESS".equalsIgnoreCase(parts[1]);
                String reason = parts.length > 2 ? parts[2] : "";

                commandService.acknowledgeCommand(commandId, isSuccess, reason);
            } catch (Exception e) {
                log.error("Failed to parse command acknowledgement from Blynk: {}", value);
            }
        }

        return ResponseEntity.ok().build();
    }
}
