package com.smartlock.dto;

import lombok.Builder;
import lombok.Data;
import java.util.Map;

@Data
@Builder
public class WeeklySnapshotDTO {
    private long totalAccessThisWeek;
    private long failedAttemptsThisWeek;
    private long alertsThisWeek;
    private long criticalAlertsThisWeek;
    
    // Comparison with last week (percentage change)
    private double accessChangeRate;
    private double alertChangeRate;
    
    private Map<String, Long> dailyAccessTrend;
    private Map<String, Long> dailyAlertTrend;
    
    private String progressSummary; // Real-time generated summary
}
