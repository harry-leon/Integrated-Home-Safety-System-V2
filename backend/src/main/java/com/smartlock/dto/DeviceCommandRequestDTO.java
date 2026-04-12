package com.smartlock.dto;

import lombok.Data;

@Data
public class DeviceCommandRequestDTO {
    private String command; 
    private String parameters; 
}
