package com.smartlock.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationSettingsDTO {
    private UUID id;
    private UUID userId;
    private boolean webPushEnabled;
    private boolean emailEnabled;
    private boolean gasAlertEnabled;
    private boolean intruderAlertEnabled;
    private boolean wrongPassAlertEnabled;
    private boolean fingerprintAlertEnabled;
    private LocalDateTime updatedAt;
}
