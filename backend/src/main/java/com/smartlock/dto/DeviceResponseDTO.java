package com.smartlock.dto;

import lombok.Data;
import java.util.UUID;

@Data
public class DeviceResponseDTO {
    private UUID id;
    private String deviceName;
    private String deviceCode;
    private String location;
    private boolean isOnline;
    private String providerType;
}
