package com.smartlock.service;

import com.smartlock.model.Device;
import com.smartlock.model.DeviceCommand;
import com.smartlock.model.enums.CommandStatus;
import com.smartlock.repository.DeviceCommandRepository;
import com.smartlock.repository.DeviceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class CommandService {

    private final DeviceCommandRepository commandRepository;
    private final DeviceRepository deviceRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final BlynkService blynkService;

    private static final int MAX_RETRIES = 3;
    private static final int TIMEOUT_SECONDS = 15;

    /**
     * Step 1: User sends command from Web UI.
     */
    @Transactional
    public UUID sendCommand(UUID deviceId, String commandType, String payloadJson) {
        Device device = deviceRepository.findById(deviceId)
                .orElseThrow(() -> new RuntimeException("Device not found"));

        DeviceCommand command = DeviceCommand.builder()
                .device(device)
                .commandType(commandType)
                .payloadJson(payloadJson)
                .status(device.isOnline() ? CommandStatus.QUEUED : CommandStatus.PENDING_OFFLINE)
                .retryCount(0)
                .build();

        DeviceCommand savedCommand = commandRepository.save(command);
        
        if (device.isOnline()) {
            executeCommand(savedCommand);
        } else {
            log.info("Device {} is offline. Command {} queued for later.", device.getDeviceCode(), savedCommand.getId());
        }

        notifyStatusUpdate(savedCommand);
        return savedCommand.getId();
    }

    /**
     * Physical execution of the command via Blynk.
     */
    public void executeCommand(DeviceCommand command) {
        try {
            // Mapping: Gửi CommandID và Payload tới Pin V10 (hoặc pin tùy chỉnh)
            // Ví dụ: "commandId:LOCK_TOGGLE"
            String blynkPayload = command.getId().toString() + ":" + command.getCommandType();
            blynkService.updateVirtualPin(10, blynkPayload); 

            command.setStatus(CommandStatus.SENT);
            commandRepository.save(command);
            notifyStatusUpdate(command);
            log.info("Command {} sent to Blynk for device {}", command.getId(), command.getDevice().getDeviceCode());
        } catch (Exception e) {
            log.error("Failed to send command {} to Blynk: {}", command.getId(), e.getMessage());
        }
    }

    /**
     * HÀNG ĐỢI OFFLINE: Khi thiết bị Online trở lại, gửi ngay các lệnh đang chờ.
     */
    @Transactional
    public void processOfflineCommands(Device device) {
        commandRepository.findAllByDeviceAndStatus(device, CommandStatus.PENDING_OFFLINE)
            .forEach(command -> {
                log.info("Processing offline command {} for now-online device {}", command.getId(), device.getDeviceCode());
                command.setStatus(CommandStatus.QUEUED);
                executeCommand(command);
            });
    }

    /**
     * Step 2: ESP32 acknowledges receiving/executing the command.
     */
    @Transactional
    public void acknowledgeCommand(UUID commandId, boolean isSuccess, String failureReason) {
        commandRepository.findById(commandId).ifPresent(command -> {
            command.setAcknowledgedAt(LocalDateTime.now());
            command.setCompletedAt(LocalDateTime.now());
            command.setStatus(isSuccess ? CommandStatus.SUCCESS : CommandStatus.FAILURE);
            command.setFailureReason(failureReason);

            commandRepository.save(command);
            notifyStatusUpdate(command);
            log.info("Command {} updated to status: {}", commandId, command.getStatus());
        });
    }

    /**
     * RETRY & TIMEOUT HANDLING: 
     * Tự động quét và thử lại nếu chưa nhận được phản hồi.
     */
    @Scheduled(fixedRate = 10000)
    @Transactional
    public void handleCommandTimeouts() {
        LocalDateTime timeoutThreshold = LocalDateTime.now().minusSeconds(TIMEOUT_SECONDS);
        
        commandRepository.findAll().stream()
                .filter(c -> (c.getStatus() == CommandStatus.SENT || c.getStatus() == CommandStatus.RETRYING))
                .filter(c -> c.getRequestedAt().isBefore(timeoutThreshold))
                .forEach(command -> {
                    if (command.getRetryCount() < MAX_RETRIES) {
                        log.info("Retrying command {} (Attempt {})", command.getId(), command.getRetryCount() + 1);
                        command.setRetryCount(command.getRetryCount() + 1);
                        command.setStatus(CommandStatus.RETRYING);
                        executeCommand(command);
                    } else {
                        command.setStatus(CommandStatus.TIMEOUT);
                        command.setFailureReason("Max retries reached. No response from device.");
                        commandRepository.save(command);
                        notifyStatusUpdate(command);
                        log.warn("Command {} timed out after {} retries", command.getId(), MAX_RETRIES);
                    }
                });
    }

    private void notifyStatusUpdate(DeviceCommand command) {
        String destination = "/topic/devices/" + command.getDevice().getDeviceCode() + "/commands";
        java.util.Map<String, Object> payload = new java.util.HashMap<>();
        payload.put("commandId", command.getId());
        payload.put("type", command.getCommandType());
        payload.put("status", command.getStatus());
        payload.put("retryCount", command.getRetryCount());
        messagingTemplate.convertAndSend(destination, payload);
    }
}

