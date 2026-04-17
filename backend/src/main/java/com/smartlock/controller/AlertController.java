package com.smartlock.controller;

import com.smartlock.common.security.VerificationService;
import com.smartlock.dto.AlertResponseDTO;
import com.smartlock.model.enums.AlertType;
import com.smartlock.service.AlertService;
import com.smartlock.service.DeviceAccessService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.UUID;

@RestController
@RequestMapping("/api/alerts")
@RequiredArgsConstructor
public class AlertController {

    private final AlertService alertService;
    private final DeviceAccessService deviceAccessService;
    private final VerificationService verificationService;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Page<AlertResponseDTO>> getAlerts(
            @RequestParam(required = false) UUID deviceId,
            @RequestParam(required = false) AlertType type,
            @RequestParam(required = false) String severity,
            @RequestParam(required = false) Boolean isResolved,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end,
            Authentication authentication,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        if (deviceId != null) {
            deviceAccessService.requireView(deviceId, authentication);
        }

        Page<AlertResponseDTO> alerts = alertService.getAlerts(
                deviceId,
                deviceAccessService.getAccessibleDeviceIds(authentication),
                deviceAccessService.isAdmin(authentication),
                type,
                severity,
                isResolved,
                start,
                end,
                pageable
        );
        return ResponseEntity.ok(alerts);
    }

    @PostMapping("/{id}/resolve")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> resolveAlert(
            @PathVariable UUID id,
            @RequestHeader(value = "X-Verification-Token", required = false) String verificationToken,
            Authentication authentication
    ) {
        if (!verificationService.isVerified(verificationToken)) {
            return ResponseEntity.status(403).body("Step-up verification required for this action");
        }
        alertService.resolveAlert(id, authentication.getName(), authentication);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/export")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<byte[]> exportAlerts(
            @RequestParam(required = false) UUID deviceId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end,
            @RequestHeader(value = "X-Verification-Token", required = false) String verificationToken,
            Authentication authentication) {
        if (deviceId != null) {
            deviceAccessService.requireView(deviceId, authentication);
        }
        if (!verificationService.isVerified(verificationToken)) {
            return ResponseEntity.status(403).body(new byte[0]);
        }

        String csvData = alertService.exportAlertsToCSV(
                deviceId,
                deviceAccessService.getAccessibleDeviceIds(authentication),
                deviceAccessService.isAdmin(authentication),
                start,
                end
        );
        byte[] output = csvData.getBytes();

        HttpHeaders headers = new HttpHeaders();
        headers.set(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=alerts_export.csv");
        headers.setContentType(MediaType.parseMediaType("text/csv"));

        return ResponseEntity.ok()
                .headers(headers)
                .body(output);
    }
}
