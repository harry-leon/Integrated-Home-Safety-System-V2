package com.smartlock.controller;

import com.smartlock.dto.AlertResponseDTO;
import com.smartlock.service.BlynkLiveAlertService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/alerts/live")
@RequiredArgsConstructor
public class LiveAlertController {

    private final BlynkLiveAlertService blynkLiveAlertService;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<AlertResponseDTO>> getLiveAlerts(
            @RequestParam(required = false) UUID deviceId,
            Authentication authentication
    ) {
        return ResponseEntity.ok(blynkLiveAlertService.getLiveAlerts(deviceId, authentication));
    }
}

