package com.smartlock.dto;

import lombok.Data;

import java.util.UUID;

@Data
public class FingerprintEnrollRequestDTO {
    private UUID deviceId;
    private String personName;
    private String accessLevel;
    private Integer fingerSlotId;
    private String note;
}
