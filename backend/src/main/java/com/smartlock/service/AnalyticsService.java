package com.smartlock.service;

import com.smartlock.dto.AnalyticsSnapshotDTO;
import com.smartlock.dto.WeeklyReportResponseDTO;
import com.smartlock.model.WeeklyReport;
import com.smartlock.repository.AccessLogRepository;
import com.smartlock.repository.AlertRepository;
import com.smartlock.repository.DeviceRepository;
import com.smartlock.repository.WeeklyReportRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final WeeklyReportRepository weeklyReportRepository;
    private final DeviceRepository deviceRepository;
    private final AlertRepository alertRepository;
    private final AccessLogRepository accessLogRepository;

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
        
        // Count for snapshot
        long alertsToday = alertRepository.count(); // Placeholder for efficiency if filtered count not in repo
        long accessToday = accessLogRepository.count();

        return AnalyticsSnapshotDTO.builder()
                .totalDevices(totalDevices)
                .onlineDevices(onlineDevices)
                .totalAlertsToday(alertsToday)
                .criticalAlertsToday(0) // Default for now
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
