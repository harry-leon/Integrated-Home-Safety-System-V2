package com.smartlock.service;

import com.smartlock.model.Device;
import com.smartlock.model.DeviceCommand;
import com.smartlock.model.enums.CommandStatus;
import com.smartlock.repository.DeviceCommandRepository;
import com.smartlock.repository.DeviceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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

    /**
     * Step 1: User sends command from Web UI.
     * Creates a command record and prepares it for sending to ESP32.
     */
    @Transactional
    public UUID sendCommand(UUID deviceId, String commandType, String payloadJson) {
        Device device = deviceRepository.findById(deviceId)
                .orElseThrow(() -> new RuntimeException("Device not found"));

        DeviceCommand command = DeviceCommand.builder()
                .device(device)
                .commandType(commandType)
                .payloadJson(payloadJson)
                .status(CommandStatus.QUEUED)
                .build();

        DeviceCommand savedCommand = commandRepository.save(command);
        
        // TODO: In the next task, implement MQTT/Blynk integration here
        log.info("Command {} queued for device {}", savedCommand.getId(), device.getDeviceCode());
        
        return savedCommand.getId();
    }

    /**
     * Step 2: ESP32 acknowledges receiving/executing the command.
     * Updates the status from QUEUED to SUCCESS or FAILURE.
     */
    @Transactional
    public void acknowledgeCommand(UUID commandId, boolean isSuccess, String failureReason) {
        DeviceCommand command = commandRepository.findById(commandId)
                .orElseThrow(() -> new RuntimeException("Command not found"));

        command.setAcknowledgedAt(LocalDateTime.now());
        command.setCompletedAt(LocalDateTime.now());
        command.setStatus(isSuccess ? CommandStatus.SUCCESS : CommandStatus.FAILURE);
        command.setFailureReason(failureReason);

        commandRepository.save(command);
        log.info("Command {} updated to status: {}", commandId, command.getStatus());
    }
}
