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
public class DeviceSettingsDTO {
    private UUID id;
    private UUID deviceId;
    private Integer gasThreshold;
    private Integer ldrThreshold;
    private Integer autoLockDelay;
    private boolean autoLockEnabled;
    private boolean gasAlertEnabled;
    private boolean pirAlertEnabled;
    private Integer maxPassFail;
    private Integer keypadLockDuration;
    private Integer lightDuration;
    private LocalDateTime updatedAt;
}
