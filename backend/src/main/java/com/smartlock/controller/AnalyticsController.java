package com.smartlock.controller;

import com.smartlock.dto.AnalyticsSnapshotDTO;
import com.smartlock.dto.WeeklyReportResponseDTO;
import com.smartlock.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

import com.smartlock.dto.WeeklySnapshotDTO;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/snapshot/weekly")
    public ResponseEntity<WeeklySnapshotDTO> getWeeklySnapshot() {
        return ResponseEntity.ok(analyticsService.getWeeklySnapshot());
    }

    @GetMapping("/reports/weekly")
    public ResponseEntity<List<WeeklyReportResponseDTO>> getWeeklyReports(@RequestParam UUID deviceId) {
        return ResponseEntity.ok(analyticsService.getWeeklyReports(deviceId));
    }

    @GetMapping("/snapshot")
    public ResponseEntity<AnalyticsSnapshotDTO> getSnapshot() {
        return ResponseEntity.ok(analyticsService.getProjectSnapshot());
    }
}
