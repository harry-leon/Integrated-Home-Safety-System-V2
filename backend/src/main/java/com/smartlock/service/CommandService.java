package com.smartlock.service;

import com.smartlock.model.Device;
import com.smartlock.model.DeviceCommand;
import com.smartlock.model.enums.AccessAction;
import com.smartlock.model.enums.AccessMethod;
import com.smartlock.model.enums.CommandStatus;
import com.smartlock.repository.AccessLogRepository;
import com.smartlock.repository.DeviceCommandRepository;
import com.smartlock.repository.DeviceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class CommandService {

    private final DeviceCommandRepository commandRepository;
    private final DeviceRepository deviceRepository;
    private final AccessLogRepository accessLogRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final BlynkService blynkService;
    private final DirectEsp32CommandService directEsp32CommandService;
    private final AuditLogService auditLogService;

    private static final int MAX_RETRIES = 3;
    private static final int TIMEOUT_SECONDS = 15;

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
            notifyStatusUpdate(savedCommand);
        }

        return savedCommand.getId();
    }

    @Transactional
    public void executeCommand(DeviceCommand command) {
        boolean openDoor = resolveTargetDoorState(command);
        boolean dispatched = directEsp32CommandService.sendDoorCommand(command.getDevice(), openDoor);
        String channel = "ESP32_DIRECT";
        if (!dispatched) {
            dispatched = blynkService.sendDoorCommand(command.getDevice(), openDoor);
            channel = "BLYNK";
        }

        command.setSentAt(LocalDateTime.now());
        if (dispatched) {
            command.setAcknowledgedAt(LocalDateTime.now());
            command.setCompletedAt(LocalDateTime.now());
            command.setStatus(CommandStatus.SUCCESS);
            command.setFailureReason(null);
            log.info(
                    "Command {} sent via {} with value {} for device {}",
                    command.getId(),
                    channel,
                    openDoor ? 1 : 0,
                    command.getDevice().getDeviceCode()
            );
            if ("LOCK_TOGGLE".equals(command.getCommandType())) {
                auditLogService.logAction(
                        command.getDevice(),
                        openDoor ? AccessAction.UNLOCKED : AccessAction.LOCKED,
                        AccessMethod.REMOTE,
                        "Dieu khien tu xa thanh cong qua " + channel
                );
            }
        } else {
            command.setStatus(CommandStatus.RETRYING);
            command.setFailureReason("Failed to send command via ESP32 direct and Blynk");
            log.warn("Failed to send command {} via ESP32 direct and Blynk. Marked for retry.", command.getId());
        }

        commandRepository.save(command);
        notifyStatusUpdate(command);
    }

    @Transactional
    public void processOfflineCommands(Device device) {
        commandRepository.findAllByDeviceAndStatus(device, CommandStatus.PENDING_OFFLINE)
                .forEach(command -> {
                    log.info("Processing offline command {} for now-online device {}", command.getId(), device.getDeviceCode());
                    command.setStatus(CommandStatus.QUEUED);
                    commandRepository.save(command);
                    executeCommand(command);
                });
    }

    @Transactional
    public void acknowledgeCommand(UUID commandId, boolean isSuccess, String failureReason) {
        commandRepository.findById(commandId).ifPresent(command -> {
            command.setAcknowledgedAt(LocalDateTime.now());
            command.setCompletedAt(LocalDateTime.now());
            command.setStatus(isSuccess ? CommandStatus.SUCCESS : CommandStatus.FAILURE);
            command.setFailureReason(failureReason);

            commandRepository.save(command);

            if (isSuccess && "LOCK_TOGGLE".equals(command.getCommandType())) {
                auditLogService.logAction(
                        command.getDevice(),
                        AccessAction.UNLOCKED,
                        AccessMethod.REMOTE,
                        "Dieu khien tu xa thanh cong"
                );
            }

            notifyStatusUpdate(command);
            log.info("Command {} updated to status: {}", commandId, command.getStatus());
        });
    }

    @Scheduled(fixedRate = 10000)
    @Transactional
    public void handleCommandTimeouts() {
        LocalDateTime timeoutThreshold = LocalDateTime.now().minusSeconds(TIMEOUT_SECONDS);

        commandRepository.findByStatusIn(List.of(CommandStatus.SENT, CommandStatus.RETRYING)).stream()
                .filter(command -> command.getSentAt() != null && command.getSentAt().isBefore(timeoutThreshold))
                .forEach(command -> {
                    if (command.getRetryCount() < MAX_RETRIES) {
                        log.info("Retrying command {} (Attempt {})", command.getId(), command.getRetryCount() + 1);
                        command.setRetryCount(command.getRetryCount() + 1);
                        command.setStatus(CommandStatus.RETRYING);
                        commandRepository.save(command);
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

    private boolean resolveTargetDoorState(DeviceCommand command) {
        if (!"LOCK_TOGGLE".equals(command.getCommandType())) {
            return false;
        }

        boolean isDoorCurrentlyOpen = accessLogRepository
                .findTopByDeviceIdOrderByCreatedAtDesc(command.getDevice().getId())
                .map(accessLog -> accessLog.getAction() == AccessAction.UNLOCKED)
                .orElse(false);

        return !isDoorCurrentlyOpen;
    }

    private void notifyStatusUpdate(DeviceCommand command) {
        String destination = "/topic/devices/" + command.getDevice().getDeviceCode() + "/commands";
        Map<String, Object> payload = new HashMap<>();
        payload.put("commandId", command.getId());
        payload.put("deviceCode", command.getDevice().getDeviceCode());
        payload.put("commandType", command.getCommandType());
        payload.put("status", command.getStatus() == null ? "UNKNOWN" : command.getStatus().name());
        payload.put("retryCount", command.getRetryCount());
        payload.put("failureReason", command.getFailureReason() == null ? "" : command.getFailureReason());
        payload.put("requestedAt", command.getRequestedAt());
        payload.put("sentAt", command.getSentAt());
        payload.put("acknowledgedAt", command.getAcknowledgedAt());
        payload.put("completedAt", command.getCompletedAt());
        messagingTemplate.convertAndSend(destination, payload);
    }
}
