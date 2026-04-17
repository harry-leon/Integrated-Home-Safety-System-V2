package com.smartlock.controller;

import com.smartlock.dto.AnalyticsSnapshotDTO;
import com.smartlock.dto.WeeklyReportResponseDTO;
import com.smartlock.dto.WeeklySnapshotDTO;
import com.smartlock.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/snapshot/weekly")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<WeeklySnapshotDTO> getWeeklySnapshot(Authentication authentication) {
        return ResponseEntity.ok(analyticsService.getWeeklySnapshot(authentication));
    }

    @GetMapping("/reports/weekly")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<WeeklyReportResponseDTO>> getWeeklyReports(@RequestParam UUID deviceId, Authentication authentication) {
        return ResponseEntity.ok(analyticsService.getWeeklyReports(deviceId, authentication));
    }

    @GetMapping("/snapshot")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<AnalyticsSnapshotDTO> getSnapshot(Authentication authentication) {
        return ResponseEntity.ok(analyticsService.getProjectSnapshot(authentication));
    }
}
