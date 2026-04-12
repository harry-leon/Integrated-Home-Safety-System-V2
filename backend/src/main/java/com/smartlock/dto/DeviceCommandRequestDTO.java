package com.smartlock.dto;

import lombok.Data;
import java.util.UUID;

@Data
public class DeviceCommandRequestDTO {
    private String command; 
    private String parameters; 
}
