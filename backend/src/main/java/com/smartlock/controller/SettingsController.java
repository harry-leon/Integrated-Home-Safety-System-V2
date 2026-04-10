package com.smartlock.controller;

import com.smartlock.model.DeviceSettings;
import com.smartlock.model.NotificationSettings;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/settings")
public class SettingsController {

    @GetMapping("/device/{deviceId}")
    public ResponseEntity<DeviceSettings> getDeviceSettings(@PathVariable UUID deviceId) {
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/device/{deviceId}")
    public ResponseEntity<Void> updateDeviceSettings(@PathVariable UUID deviceId, @RequestBody DeviceSettings settings) {
        return ResponseEntity.ok().build();
    }

    @GetMapping("/notifications")
    public ResponseEntity<NotificationSettings> getNotificationSettings() {
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/notifications")
    public ResponseEntity<Void> updateNotificationSettings(@RequestBody NotificationSettings settings) {
        return ResponseEntity.ok().build();
    }
}
