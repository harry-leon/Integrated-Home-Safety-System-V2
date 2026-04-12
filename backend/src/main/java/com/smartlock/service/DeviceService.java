package com.smartlock.service;

import com.smartlock.dto.DeviceResponseDTO;
import com.smartlock.model.Device;
import com.smartlock.repository.DeviceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DeviceService {

    private final DeviceRepository deviceRepository;

    public List<DeviceResponseDTO> getAllDevices() {
        return deviceRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public DeviceResponseDTO getDeviceById(UUID id) {
        Device device = deviceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Device not found"));
        return convertToDTO(device);
    }

    private DeviceResponseDTO convertToDTO(Device device) {
        DeviceResponseDTO dto = new DeviceResponseDTO();
        dto.setId(device.getId());
        dto.setDeviceName(device.getDeviceName());
        dto.setDeviceCode(device.getDeviceCode());
        dto.setLocation(device.getLocation());
        dto.setOnline(device.isOnline());
        dto.setProviderType(device.getProviderType());
        return dto;
    }
}
