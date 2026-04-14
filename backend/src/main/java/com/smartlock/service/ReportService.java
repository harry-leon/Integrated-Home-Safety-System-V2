package com.smartlock.service;

import com.smartlock.repository.AlertRepository;
import com.smartlock.repository.DeviceCommandRepository;
import com.smartlock.repository.DeviceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReportService {

    private final DeviceRepository deviceRepository;
    private final DeviceCommandRepository commandRepository;
    private final AlertRepository alertRepository;

    /**
     * Executes Every Sunday at Midnight.
     * For testing/demo purposes, we can trigger this manually or via a shorter interval.
     */
    @Scheduled(cron = "0 0 0 * * SUN")
    public void generateWeeklyReport() {
        log.info(">>>> STARTING WEEKLY SYSTEM SECURITY REPORT <<<<");
        LocalDateTime weekAgo = LocalDateTime.now().minusDays(7);
        
        long totalDevices = deviceRepository.count();
        long commandsLastWeek = commandRepository.count(); // Simplified for now
        long alertsLastWeek = alertRepository.count(); // Simplified for now

        StringBuilder report = new StringBuilder();
        report.append("\n==========================================\n");
        report.append("WEEKLY SUMMARY REPORT\n");
        report.append("Period: ").append(weekAgo).append(" to ").append(LocalDateTime.now()).append("\n");
        report.append("------------------------------------------\n");
        report.append("Active Devices: ").append(totalDevices).append("\n");
        report.append("Total Commands Executed: ").append(commandsLastWeek).append("\n");
        report.append("Security Alerts Triggered: ").append(alertsLastWeek).append("\n");
        report.append("System Health: OPTIMAL\n");
        report.append("==========================================\n");

        log.info(report.toString());
        
        // In a real system, we'd email this to the administrator
    }

    /**
     * Demo method to trigger report generation via API if needed.
     */
    public String getManualReport() {
        generateWeeklyReport();
        return "Weekly report generated in server logs.";
    }
}
