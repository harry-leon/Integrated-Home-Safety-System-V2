package com.smartlock.service;

import com.smartlock.dto.DeviceReportDTO;
import com.smartlock.dto.DeviceResponseDTO;
import com.smartlock.model.Device;
import com.smartlock.model.DeviceCommand;
import com.smartlock.model.SensorData;
import com.smartlock.model.User;
import com.smartlock.model.UserDevice;
import com.smartlock.model.enums.UserDevicePermission;
import com.smartlock.model.enums.UserRole;
import com.smartlock.repository.DeviceCommandRepository;
import com.smartlock.repository.DeviceRepository;
import com.smartlock.repository.SensorDataRepository;
import com.smartlock.repository.UserDeviceRepository;
import com.smartlock.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DeviceService {

    private static final String DEMO_DEVICE_CODE = "ESP32-DEMO";

    private final DeviceRepository deviceRepository;
    private final SensorDataRepository sensorDataRepository;
    private final DeviceCommandRepository deviceCommandRepository;
    private final AlertService alertService;
    private final DeviceAccessService deviceAccessService;
    private final UserRepository userRepository;
    private final UserDeviceRepository userDeviceRepository;

    @Transactional
    public List<DeviceResponseDTO> getAllDevices(Authentication authentication) {
        ensureDemoDeviceExists();
        List<Device> devices;
        if (deviceAccessService.canViewAllDevices(authentication)) {
            devices = deviceRepository.findAll();
        } else {
            List<UUID> accessibleDeviceIds = deviceAccessService.getAccessibleDeviceIds(authentication);
            if (accessibleDeviceIds.isEmpty()) {
                return List.of();
            }
            devices = deviceRepository.findAllById(accessibleDeviceIds);
        }

        return devices.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public DeviceResponseDTO getDeviceById(UUID id, Authentication authentication) {
        deviceAccessService.requireView(id, authentication);
        Device device = deviceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Device not found"));
        return convertToDTO(device);
    }

    @Transactional
    public Device touchDeviceHeartbeat(String deviceCode) {
        Device device = getOrCreateDeviceByCode(deviceCode);
        device.setOnline(true);
        device.setLastSeen(LocalDateTime.now());
        return deviceRepository.save(device);
    }

    @Transactional
    public SensorData recordSensorData(DeviceReportDTO report) {
        Device device = touchDeviceHeartbeat(report.getDeviceCode());
        SensorData sensorData = saveSensorSnapshot(device, report);
        alertService.processTelemetryAlerts(device, report.getGasValue(), report.isPirTriggered());
        return sensorData;
    }

    @Transactional
    public SensorData recordPartialSensorData(DeviceReportDTO report) {
        return recordPartialSensorData(report, null);
    }

    @Transactional
    public SensorData recordPartialSensorData(DeviceReportDTO report, Boolean pirTriggered) {
        Device device = touchDeviceHeartbeat(report.getDeviceCode());
        SensorData latest = sensorDataRepository.findFirstByDeviceIdOrderByRecordedAtDesc(device.getId()).orElse(null);

        DeviceReportDTO merged = new DeviceReportDTO();
        merged.setDeviceCode(report.getDeviceCode());
        merged.setGasValue(report.getGasValue() != null ? report.getGasValue() : latest == null ? null : latest.getGasValue());
        merged.setLdrValue(report.getLdrValue() != null ? report.getLdrValue() : latest == null ? null : latest.getLdrValue());
        merged.setPirTriggered(pirTriggered != null ? pirTriggered : latest != null && latest.isPirTriggered());
        merged.setTemperature(report.getTemperature() != null ? report.getTemperature() : latest == null ? null : latest.getTemperature());
        merged.setWeatherDesc(report.getWeatherDesc() != null ? report.getWeatherDesc() : latest == null ? null : latest.getWeatherDesc());

        SensorData sensorData = saveSensorSnapshot(device, merged);
        alertService.processTelemetryAlerts(device, merged.getGasValue(), merged.isPirTriggered());
        return sensorData;
    }

    private SensorData saveSensorSnapshot(Device device, DeviceReportDTO report) {
        return sensorDataRepository.save(SensorData.builder()
                .device(device)
                .gasValue(report.getGasValue())
                .ldrValue(report.getLdrValue())
                .pirTriggered(report.isPirTriggered())
                .temperature(report.getTemperature())
                .weatherDesc(report.getWeatherDesc())
                .build());
    }

    private void ensureDemoDeviceExists() {
        if (deviceRepository.count() > 0) {
            return;
        }

        User adminUser = userRepository.findAll().stream()
                .filter(user -> user.getRole() == UserRole.ADMIN)
                .findFirst()
                .orElse(null);

        Device device = deviceRepository.save(Device.builder()
                .deviceName("Smart Lock Demo")
                .deviceCode(DEMO_DEVICE_CODE)
                .providerType("BLYNK")
                .location("Front Door")
                .isOnline(false)
                .owner(adminUser)
                .build());

        if (adminUser != null) {
            userDeviceRepository.save(UserDevice.builder()
                    .user(adminUser)
                    .device(device)
                    .permission(UserDevicePermission.OWNER)
                    .build());
        }
    }

    private Device getOrCreateDeviceByCode(String deviceCode) {
        if (deviceCode == null || deviceCode.isBlank()) {
            throw new IllegalArgumentException("deviceCode is required");
        }

        return deviceRepository.findByDeviceCode(deviceCode)
                .orElseGet(() -> deviceRepository.save(Device.builder()
                        .deviceName("ESP32 " + deviceCode)
                        .deviceCode(deviceCode)
                        .providerType("BLYNK")
                        .location("Auto-registered device")
                        .isOnline(false)
                        .build()));
    }

    private DeviceResponseDTO convertToDTO(Device device) {
        DeviceResponseDTO dto = new DeviceResponseDTO();
        dto.setId(device.getId());
        dto.setDeviceName(device.getDeviceName());
        dto.setDeviceCode(device.getDeviceCode());
        dto.setLocation(device.getLocation());
        dto.setOnline(device.isOnline());
        dto.setProviderType(device.getProviderType());
        dto.setLastSeen(device.getLastSeen());

        sensorDataRepository.findFirstByDeviceIdOrderByRecordedAtDesc(device.getId())
                .ifPresent(sensorData -> {
                    dto.setGasValue(sensorData.getGasValue());
                    dto.setLdrValue(sensorData.getLdrValue());
                    dto.setPirTriggered(sensorData.isPirTriggered());
                    dto.setTemperature(sensorData.getTemperature());
                    dto.setWeatherDesc(sensorData.getWeatherDesc());
                    dto.setLastSensorAt(sensorData.getRecordedAt());
                });

        deviceCommandRepository.findTopByDeviceIdOrderByRequestedAtDesc(device.getId())
                .ifPresent(command -> {
                    dto.setLastCommandStatus(command.getStatus() == null ? null : command.getStatus().name());
                    dto.setLastCommandAt(resolveCommandTime(command));
                });

        return dto;
    }

    private LocalDateTime resolveCommandTime(DeviceCommand command) {
        if (command.getCompletedAt() != null) {
            return command.getCompletedAt();
        }
        if (command.getAcknowledgedAt() != null) {
            return command.getAcknowledgedAt();
        }
        return command.getRequestedAt();
    }
}
