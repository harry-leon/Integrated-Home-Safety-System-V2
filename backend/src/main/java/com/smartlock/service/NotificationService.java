package com.smartlock.service;

import com.smartlock.model.Alert;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class NotificationService {

    /**
     * Sends a notification for a high-severity alert.
     * In a production environment, this would integrate with Email, SMS, or Push Notification providers.
     */
    public void sendAlertNotification(Alert alert) {
        if ("CRITICAL".equalsIgnoreCase(alert.getSeverity()) || "HIGH".equalsIgnoreCase(alert.getSeverity())) {
            log.warn("!!!! CRITICAL ALERT NOTIFICATION !!!!");
            log.warn("Device: {} ({})", alert.getDevice().getDeviceName(), alert.getDevice().getDeviceCode());
            log.warn("Type: {}", alert.getAlertType());
            log.warn("Message: {}", alert.getMessage());
            log.warn("Action Required: Check device status immediately.");
            
            // Mocking SMS/Email sending
            sendMockSms(alert);
            sendMockEmail(alert);
        } else {
            log.info("Alert recorded: {} - {}", alert.getAlertType(), alert.getSeverity());
        }
    }

    private void sendMockSms(Alert alert) {
        log.info("[SMS SIMULATION] To: +123456789 - Alert: {} detected on {}", alert.getAlertType(), alert.getDevice().getDeviceName());
    }

    private void sendMockEmail(Alert alert) {
        log.info("[EMAIL SIMULATION] To: user@smartlock.com - Subject: CRITICAL SECURITY ALERT - Body: {}", alert.getMessage());
    }
}
