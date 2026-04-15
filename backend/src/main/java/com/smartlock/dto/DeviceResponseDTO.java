package com.smartlock.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class DeviceResponseDTO {
    private UUID id;
    private String deviceName;
    private String deviceCode;
    private String location;
    private boolean isOnline;
    private String providerType;
    private LocalDateTime lastSeen;
    private Integer gasValue;
    private Integer ldrValue;
    private boolean pirTriggered;
    private Double temperature;
    private String weatherDesc;
    private LocalDateTime lastSensorAt;
    private String lastCommandStatus;
    private LocalDateTime lastCommandAt;
}
