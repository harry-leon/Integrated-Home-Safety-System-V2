package com.smartlock.controller;

import com.smartlock.common.security.VerificationService;
import com.smartlock.model.DeviceSettings;
import com.smartlock.model.NotificationSettings;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/settings")
@RequiredArgsConstructor
public class SettingsController {

    private final VerificationService verificationService;

    @GetMapping("/device/{deviceId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MEMBER', 'VIEWER')")
    public ResponseEntity<DeviceSettings> getDeviceSettings(@PathVariable UUID deviceId) {
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/device/{deviceId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MEMBER')")
    public ResponseEntity<?> updateDeviceSettings(
            @PathVariable UUID deviceId,
            @RequestBody DeviceSettings settings,
            @RequestHeader(value = "X-Verification-Token", required = false) String verificationToken
    ) {
        if (!verificationService.isVerified(verificationToken)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Step-up verification required for this action");
        }
        return ResponseEntity.ok().build();
    }

    @GetMapping("/notifications")
    @PreAuthorize("hasAnyRole('ADMIN', 'MEMBER', 'VIEWER')")
    public ResponseEntity<NotificationSettings> getNotificationSettings() {
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/notifications")
    @PreAuthorize("hasAnyRole('ADMIN', 'MEMBER')")
    public ResponseEntity<?> updateNotificationSettings(
            @RequestBody NotificationSettings settings,
            @RequestHeader(value = "X-Verification-Token", required = false) String verificationToken
    ) {
        if (!verificationService.isVerified(verificationToken)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Step-up verification required for this action");
        }
        return ResponseEntity.ok().build();
    }
}
