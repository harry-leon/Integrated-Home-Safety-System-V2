package com.smartlock.dto;

import com.smartlock.model.enums.AlertType;
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
public class AlertResponseDTO {
    private UUID id;
    private UUID deviceId;
    private AlertType alertType;
    private String severity;
    private String message;
    private Integer sensorValue;
    private boolean isResolved;
    private UUID resolvedBy;
    private LocalDateTime createdAt;
    private LocalDateTime resolvedAt;
}
