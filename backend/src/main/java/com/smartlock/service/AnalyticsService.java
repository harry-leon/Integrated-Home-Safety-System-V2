package com.smartlock.service;

import com.smartlock.dto.AnalyticsSnapshotDTO;
import com.smartlock.dto.WeeklyReportResponseDTO;
import com.smartlock.dto.WeeklySnapshotDTO;
import com.smartlock.model.WeeklyReport;
import com.smartlock.repository.AccessLogRepository;
import com.smartlock.repository.AlertRepository;
import com.smartlock.repository.DeviceRepository;
import com.smartlock.repository.WeeklyReportRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final WeeklyReportRepository weeklyReportRepository;
    private final DeviceRepository deviceRepository;
    private final AlertRepository alertRepository;
    private final AccessLogRepository accessLogRepository;

    public WeeklySnapshotDTO getWeeklySnapshot() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime sevenDaysAgo = now.minusDays(7);
        LocalDateTime fourteenDaysAgo = now.minusDays(14);

        // This week metrics
        long accessThisWeek = accessLogRepository.countByCreatedAtBetween(sevenDaysAgo, now);
        long failedThisWeek = accessLogRepository.countFailedAttemptsBetween(sevenDaysAgo, now);
        long alertsThisWeek = alertRepository.countByCreatedAtBetween(sevenDaysAgo, now);
        long criticalAlerts = alertRepository.countByCreatedAtBetweenAndSeverity(sevenDaysAgo, now, "CRITICAL");

        // Last week metrics for comparison
        long accessLastWeek = accessLogRepository.countByCreatedAtBetween(fourteenDaysAgo, sevenDaysAgo);
        long alertsLastWeek = alertRepository.countByCreatedAtBetween(fourteenDaysAgo, sevenDaysAgo);

        // Calculate rates
        double accessRate = accessLastWeek > 0 ? (double) (accessThisWeek - accessLastWeek) / accessLastWeek * 100 : 0;
        double alertRate = alertsLastWeek > 0 ? (double) (alertsThisWeek - alertsLastWeek) / alertsLastWeek * 100 : 0;

        // Daily trends
        Map<String, Long> accessTrend = new LinkedHashMap<>();
        Map<String, Long> alertTrend = new LinkedHashMap<>();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("EEE");

        for (int i = 6; i >= 0; i--) {
            LocalDateTime dayStart = now.minusDays(i).withHour(0).withMinute(0).withSecond(0).withNano(0);
            LocalDateTime dayEnd = dayStart.plusDays(1).minusNanos(1);
            String label = dayStart.format(formatter);
            
            accessTrend.put(label, accessLogRepository.countByCreatedAtBetween(dayStart, dayEnd));
            alertTrend.put(label, alertRepository.countByCreatedAtBetween(dayStart, dayEnd));
        }

        String summary = String.format("Trong 7 ngày qua, hệ thống ghi nhận %d lượt truy cập (%s%.1f%% so với tuần trước) và %d cảnh báo mới.",
                accessThisWeek, accessRate >= 0 ? "+" : "", accessRate, alertsThisWeek);

        return WeeklySnapshotDTO.builder()
                .totalAccessThisWeek(accessThisWeek)
                .failedAttemptsThisWeek(failedThisWeek)
                .alertsThisWeek(alertsThisWeek)
                .criticalAlertsThisWeek(criticalAlerts)
                .accessChangeRate(accessRate)
                .alertChangeRate(alertRate)
                .dailyAccessTrend(accessTrend)
                .dailyAlertTrend(alertTrend)
                .progressSummary(summary)
                .build();
    }

    public List<WeeklyReportResponseDTO> getWeeklyReports(UUID deviceId) {
        return weeklyReportRepository.findByDeviceIdOrderByWeekStartDesc(deviceId)
                .stream()
                .map(this::mapToWeeklyDTO)
                .collect(Collectors.toList());
    }

    public AnalyticsSnapshotDTO getProjectSnapshot() {
        LocalDateTime startOfToday = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0).withNano(0);
        
        long totalDevices = deviceRepository.count();
        long onlineDevices = deviceRepository.findAll().stream().filter(d -> d.isOnline()).count();
        
        long alertsToday = alertRepository.countByCreatedAtBetween(startOfToday, LocalDateTime.now());
        long accessToday = accessLogRepository.countByCreatedAtBetween(startOfToday, LocalDateTime.now());

        return AnalyticsSnapshotDTO.builder()
                .totalDevices(totalDevices)
                .onlineDevices(onlineDevices)
                .totalAlertsToday(alertsToday)
                .criticalAlertsToday(alertRepository.countByCreatedAtBetweenAndSeverity(startOfToday, LocalDateTime.now(), "CRITICAL"))
                .accessLogsToday(accessToday)
                .deviceHealthScore(totalDevices > 0 ? (double) onlineDevices / totalDevices * 100 : 0)
                .build();
    }

    private WeeklyReportResponseDTO mapToWeeklyDTO(WeeklyReport report) {
        WeeklyReportResponseDTO dto = new WeeklyReportResponseDTO();
        dto.setId(report.getId());
        dto.setDeviceId(report.getDevice().getId());
        dto.setDeviceName(report.getDevice().getDeviceName());
        dto.setWeekStart(report.getWeekStart());
        dto.setWeekEnd(report.getWeekEnd());
        dto.setTotalAccessCount(report.getTotalAccessCount());
        dto.setTotalAlertCount(report.getTotalAlertCount());
        dto.setTotalFailedAttemptCount(report.getTotalFailedAttemptCount());
        dto.setSummaryJson(report.getSummaryJson());
        return dto;
    }
}
