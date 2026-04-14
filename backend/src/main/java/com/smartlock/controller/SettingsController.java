package com.smartlock.controller;

import com.smartlock.common.security.VerificationService;
import com.smartlock.dto.DeviceSettingsDTO;
import com.smartlock.dto.NotificationSettingsDTO;
import com.smartlock.service.SettingsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/settings")
@RequiredArgsConstructor
public class SettingsController {

    private final VerificationService verificationService;
    private final SettingsService settingsService;

    @GetMapping("/device/{deviceId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MEMBER', 'VIEWER')")
    public ResponseEntity<DeviceSettingsDTO> getDeviceSettings(@PathVariable UUID deviceId) {
        return ResponseEntity.ok(settingsService.getDeviceSettings(deviceId));
    }

    @PatchMapping("/device/{deviceId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MEMBER')")
    public ResponseEntity<?> updateDeviceSettings(
            @PathVariable UUID deviceId,
            @RequestBody DeviceSettingsDTO settings,
            @RequestHeader(value = "X-Verification-Token", required = false) String verificationToken
    ) {
        if (!verificationService.isVerified(verificationToken)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Step-up verification required for this action");
        }
        return ResponseEntity.ok(settingsService.updateDeviceSettings(deviceId, settings));
    }

    @GetMapping("/notifications")
    @PreAuthorize("hasAnyRole('ADMIN', 'MEMBER', 'VIEWER')")
    public ResponseEntity<NotificationSettingsDTO> getNotificationSettings(Authentication authentication) {
        return ResponseEntity.ok(settingsService.getNotificationSettings(authentication.getName()));
    }

    @PatchMapping("/notifications")
    @PreAuthorize("hasAnyRole('ADMIN', 'MEMBER')")
    public ResponseEntity<?> updateNotificationSettings(
            @RequestBody NotificationSettingsDTO settings,
            @RequestHeader(value = "X-Verification-Token", required = false) String verificationToken,
            Authentication authentication
    ) {
        if (!verificationService.isVerified(verificationToken)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Step-up verification required for this action");
        }
        return ResponseEntity.ok(settingsService.updateNotificationSettings(authentication.getName(), settings));
    }
}
