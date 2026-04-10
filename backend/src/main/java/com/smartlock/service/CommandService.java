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

    /**
     * Step 1: User sends command from Web UI.
     */
    @Transactional
    public UUID sendCommand(UUID deviceId, String commandType, String payloadJson) {
        Device device = deviceRepository.findById(deviceId)
                .orElseThrow(() -> new RuntimeException("Device not found"));

        // OFFLINE HANDLING: Kiểm tra trạng thái thiết bị trước khi gửi
        if (!device.isOnline()) {
            log.warn("Device {} is offline. Command rejected.", device.getDeviceCode());
            throw new RuntimeException("Device is currently offline. Cannot send command.");
        }

        DeviceCommand command = DeviceCommand.builder()
                .device(device)
                .commandType(commandType)
                .payloadJson(payloadJson)
                .status(CommandStatus.QUEUED)
                .build();

        DeviceCommand savedCommand = commandRepository.save(command);
        
        // Thông báo cho UI là lệnh đã được đưa vào hàng đợi
        notifyStatusUpdate(savedCommand);
        
        log.info("Command {} queued for device {}", savedCommand.getId(), device.getDeviceCode());
        return savedCommand.getId();
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
     * TIMEOUT HANDLING: Tự động quét và đánh dấu quá hạn cho các lệnh RECENT mà không có phản hồi.
     * Chạy mỗi 10 giây.
     */
    @Scheduled(fixedRate = 10000)
    @Transactional
    public void handleCommandTimeouts() {
        LocalDateTime timeoutThreshold = LocalDateTime.now().minusSeconds(15);
        
        // Tìm các lệnh ở trạng thái QUEUED hoặc SENT quá 15 giây
        // (Lưu ý: Bạn có thể viết thêm query trong Repository để tìm chính xác hơn)
        commandRepository.findAll().stream()
                .filter(c -> (c.getStatus() == CommandStatus.QUEUED || c.getStatus() == CommandStatus.SENT))
                .filter(c -> c.getRequestedAt().isBefore(timeoutThreshold))
                .forEach(command -> {
                    command.setStatus(CommandStatus.TIMEOUT);
                    command.setFailureReason("No response from device (Timeout)");
                    commandRepository.save(command);
                    notifyStatusUpdate(command);
                    log.warn("Command {} timed out for device {}", command.getId(), command.getDevice().getDeviceCode());
                });
    }

    private void notifyStatusUpdate(DeviceCommand command) {
        String destination = "/topic/devices/" + command.getDevice().getDeviceCode() + "/commands";
        messagingTemplate.convertAndSend(destination, command);
    }
}
