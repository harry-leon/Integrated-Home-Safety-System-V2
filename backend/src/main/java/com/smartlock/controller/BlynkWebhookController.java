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

    @org.springframework.beans.factory.annotation.Value("${blynk.auth-token:}")
    private String globalWebhookToken;

    @GetMapping("/webhook")
    public ResponseEntity<Void> handleBlynkWebhook(
            @RequestParam String deviceCode,
            @RequestParam String pin,
            @RequestParam String value,
            @RequestParam(required = false) String token) {
        
        log.info("Received Blynk Webhook: Device={}, Pin={}, Value={}", deviceCode, pin, value);

        java.util.Optional<Device> deviceOpt = deviceRepository.findByDeviceCode(deviceCode);
        if (deviceOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Device device = deviceOpt.get();

        boolean isValidToken = (token != null) && (token.equals(globalWebhookToken) || token.equals(device.getProviderToken()));
        if (!isValidToken) {
            log.warn("Unauthorized webhook attempt for device {}", deviceCode);
            return ResponseEntity.status(org.springframework.http.HttpStatus.UNAUTHORIZED).build();
        }

        // 1. Cập nhật trạng thái Device là ONLINE khi có bất kỳ dữ liệu nào gửi về
        boolean wasOffline = !device.isOnline();
        device.setOnline(true);
        device.setLastSeen(LocalDateTime.now());
        deviceRepository.save(device);

        // Nếu thiết bị vừa Online trở lại, xử lý các lệnh đang chờ
        if (wasOffline) {
            commandService.processOfflineCommands(device);
        }


        // 2. Gửi dữ liệu real-time lên Web Dashboard qua WebSocket
        messagingTemplate.convertAndSend("/topic/devices/" + deviceCode + "/updates", 
                "Pin " + pin + " changed to " + value);

        // 3. Xử lý xác nhận lệnh (Acknowledgement)
        // Ví dụ: ESP32 gửi về V10 giá trị "commandId:SUCCESS" hoặc "commandId:FAILURE"
        if (pin.equals("V10")) {
            try {
                String[] parts = value.split(":");
                if (parts.length < 2) {
                    log.warn("Invalid command acknowledgement format: {}", value);
                    return ResponseEntity.badRequest().build();
                }
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
