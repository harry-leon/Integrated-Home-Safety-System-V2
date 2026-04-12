package com.smartlock.controller;

import com.smartlock.dto.WeeklyReportResponseDTO;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/analytics")
@PreAuthorize("hasAnyRole('ADMIN', 'MEMBER', 'VIEWER')")
public class AnalyticsController {

    @GetMapping("/reports/weekly")
    public ResponseEntity<List<WeeklyReportResponseDTO>> getWeeklyReports(@RequestParam UUID deviceId) {
        return ResponseEntity.ok().build();
    }
}
