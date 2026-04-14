package com.smartlock.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/alerts")
@RequiredArgsConstructor
public class AlertController {

    private final com.smartlock.service.ReportService reportService;

    @GetMapping("/report")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> triggerManualReport() {
        return ResponseEntity.ok(reportService.getManualReport());
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MEMBER', 'VIEWER')")
    public ResponseEntity<Void> getAlerts(@RequestParam(required = false) UUID deviceId) {
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/resolve")
    @PreAuthorize("hasAnyRole('ADMIN', 'MEMBER')")
    public ResponseEntity<Void> resolveAlert(@PathVariable UUID id) {
        return ResponseEntity.ok().build();
    }
}
