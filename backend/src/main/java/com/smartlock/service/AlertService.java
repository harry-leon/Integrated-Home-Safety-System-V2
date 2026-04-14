package com.smartlock.service;

import com.smartlock.model.Alert;
import com.smartlock.model.Device;
import com.smartlock.model.enums.AlertType;
import com.smartlock.repository.AlertRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AlertService {

    private final AlertRepository alertRepository;
    private final NotificationService notificationService;

    @Transactional
    public Alert createAlert(Device device, AlertType type, String severity, String message, Integer value) {
        Alert alert = Alert.builder()
                .device(device)
                .alertType(type)
                .severity(severity)
                .message(message)
                .sensorValue(value)
                .isResolved(false)
                .build();

        Alert savedAlert = alertRepository.save(alert);
        log.info("Alert created: {} for device {}", type, device.getDeviceCode());
        
        // Trigger notification for serious alerts
        notificationService.sendAlertNotification(savedAlert);
        
        return savedAlert;
    }
}
