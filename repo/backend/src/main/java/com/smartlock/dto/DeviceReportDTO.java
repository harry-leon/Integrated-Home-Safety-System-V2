package com.smartlock.dto;

import lombok.Data;
import java.util.UUID;

@Data
public class DeviceReportDTO {
    private String deviceCode;
    private Integer gasValue;
    private Integer ldrValue;
    private boolean pirTriggered;
    private Double temperature;
    private String weatherDesc;
}
