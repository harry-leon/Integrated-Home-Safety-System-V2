package com.smartlock.dto;

import com.smartlock.model.enums.AccessAction;
import com.smartlock.model.enums.AccessMethod;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Response body for a single access log entry.
 */
@Data
public class AccessLogResponseDTO {
    private UUID id;
    private UUID deviceId;
    private String deviceName;
    private String userName;
    private String personName; // fingerprint person name, if applicable
    private AccessMethod method;
    private AccessAction action;
    private String detail;
    private LocalDateTime createdAt;
}
