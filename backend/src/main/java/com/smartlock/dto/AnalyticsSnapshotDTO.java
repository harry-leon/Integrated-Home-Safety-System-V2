package com.smartlock.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AnalyticsSnapshotDTO {
    private long totalDevices;
    private long onlineDevices;
    private long totalAlertsToday;
    private long criticalAlertsToday;
    private long accessLogsToday;
    private double deviceHealthScore; // Example metric
}
