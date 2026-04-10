package com.smartlock.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/alerts")
public class AlertController {

    @GetMapping
    public ResponseEntity<Void> getAlerts(@RequestParam(required = false) UUID deviceId) {
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/resolve")
    public ResponseEntity<Void> resolveAlert(@PathVariable UUID id) {
        return ResponseEntity.ok().build();
    }
}
