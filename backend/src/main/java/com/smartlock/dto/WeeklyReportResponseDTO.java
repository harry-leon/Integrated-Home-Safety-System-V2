package com.smartlock.dto;

import lombok.Data;
import java.time.LocalDate;
import java.util.UUID;

/**
 * Response body for a weekly analytics report.
 */
@Data
public class WeeklyReportResponseDTO {
    private UUID id;
    private UUID deviceId;
    private String deviceName;
    private LocalDate weekStart;
    private LocalDate weekEnd;
    private Integer totalAccessCount;
    private Integer totalAlertCount;
    private Integer totalFailedAttemptCount;
    private String summaryJson;
}
