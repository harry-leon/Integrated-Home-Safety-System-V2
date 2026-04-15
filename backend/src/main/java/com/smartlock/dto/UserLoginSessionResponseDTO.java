package com.smartlock.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class UserLoginSessionResponseDTO {
    private UUID id;
    private boolean current;
    private String ipAddress;
    private String userAgent;
    private String deviceName;
    private String location;
    private LocalDateTime createdAt;
    private LocalDateTime lastActiveAt;
    private LocalDateTime loggedOutAt;
}
