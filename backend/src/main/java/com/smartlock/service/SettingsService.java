package com.smartlock.service;

import com.smartlock.dto.DeviceSettingsDTO;
import com.smartlock.dto.NotificationSettingsDTO;
import com.smartlock.model.DeviceSettings;
import com.smartlock.model.NotificationSettings;
import com.smartlock.model.User;
import com.smartlock.repository.DeviceSettingsRepository;
import com.smartlock.repository.NotificationSettingsRepository;
import com.smartlock.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SettingsService {

    private final DeviceSettingsRepository deviceSettingsRepository;
    private final NotificationSettingsRepository notificationSettingsRepository;
    private final UserRepository userRepository;

    public DeviceSettingsDTO getDeviceSettings(UUID deviceId) {
        DeviceSettings settings = deviceSettingsRepository.findByDeviceId(deviceId)
                .orElseThrow(() -> new RuntimeException("Device settings not found for device: " + deviceId));
        return mapToDeviceDTO(settings);
    }

    public DeviceSettingsDTO updateDeviceSettings(UUID deviceId, DeviceSettingsDTO dto) {
        DeviceSettings settings = deviceSettingsRepository.findByDeviceId(deviceId)
                .orElseThrow(() -> new RuntimeException("Device settings not found for device: " + deviceId));
        
        if (dto.getGasThreshold() != null) settings.setGasThreshold(dto.getGasThreshold());
        if (dto.getLdrThreshold() != null) settings.setLdrThreshold(dto.getLdrThreshold());
        if (dto.getAutoLockDelay() != null) settings.setAutoLockDelay(dto.getAutoLockDelay());
        settings.setAutoLockEnabled(dto.isAutoLockEnabled());
        settings.setGasAlertEnabled(dto.isGasAlertEnabled());
        settings.setPirAlertEnabled(dto.isPirAlertEnabled());
        if (dto.getMaxPassFail() != null) settings.setMaxPassFail(dto.getMaxPassFail());
        if (dto.getKeypadLockDuration() != null) settings.setKeypadLockDuration(dto.getKeypadLockDuration());
        if (dto.getLightDuration() != null) settings.setLightDuration(dto.getLightDuration());
        
        return mapToDeviceDTO(deviceSettingsRepository.save(settings));
    }

    public NotificationSettingsDTO getNotificationSettings(String username) {
        User user = userRepository.findByEmail(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        NotificationSettings ns = notificationSettingsRepository.findByUserId(user.getId())
                .orElseGet(() -> {
                    NotificationSettings newNs = NotificationSettings.builder()
                            .user(user)
                            .webPushEnabled(true)
                            .emailEnabled(true)
                            .gasAlertEnabled(true)
                            .intruderAlertEnabled(true)
                            .wrongPassAlertEnabled(true)
                            .fingerprintAlertEnabled(true)
                            .build();
                    return notificationSettingsRepository.save(newNs);
                });
        return mapToNotificationDTO(ns);
    }

    public NotificationSettingsDTO updateNotificationSettings(String username, NotificationSettingsDTO dto) {
        User user = userRepository.findByEmail(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        NotificationSettings settings = notificationSettingsRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Notification settings not found"));
        
        settings.setWebPushEnabled(dto.isWebPushEnabled());
        settings.setEmailEnabled(dto.isEmailEnabled());
        settings.setGasAlertEnabled(dto.isGasAlertEnabled());
        settings.setIntruderAlertEnabled(dto.isIntruderAlertEnabled());
        settings.setWrongPassAlertEnabled(dto.isWrongPassAlertEnabled());
        settings.setFingerprintAlertEnabled(dto.isFingerprintAlertEnabled());
        
        return mapToNotificationDTO(notificationSettingsRepository.save(settings));
    }

    private DeviceSettingsDTO mapToDeviceDTO(DeviceSettings s) {
        return DeviceSettingsDTO.builder()
                .id(s.getId())
                .deviceId(s.getDevice() != null ? s.getDevice().getId() : null)
                .gasThreshold(s.getGasThreshold())
                .ldrThreshold(s.getLdrThreshold())
                .autoLockDelay(s.getAutoLockDelay())
                .autoLockEnabled(s.isAutoLockEnabled())
                .gasAlertEnabled(s.isGasAlertEnabled())
                .pirAlertEnabled(s.isPirAlertEnabled())
                .maxPassFail(s.getMaxPassFail())
                .keypadLockDuration(s.getKeypadLockDuration())
                .lightDuration(s.getLightDuration())
                .updatedAt(s.getUpdatedAt())
                .build();
    }

    private NotificationSettingsDTO mapToNotificationDTO(NotificationSettings s) {
        return NotificationSettingsDTO.builder()
                .id(s.getId())
                .userId(s.getUser() != null ? s.getUser().getId() : null)
                .webPushEnabled(s.isWebPushEnabled())
                .emailEnabled(s.isEmailEnabled())
                .gasAlertEnabled(s.isGasAlertEnabled())
                .intruderAlertEnabled(s.isIntruderAlertEnabled())
                .wrongPassAlertEnabled(s.isWrongPassAlertEnabled())
                .fingerprintAlertEnabled(s.isFingerprintAlertEnabled())
                .updatedAt(s.getUpdatedAt())
                .build();
    }
}
