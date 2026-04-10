package com.smartlock.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/fingerprints")
public class FingerprintController {

    @PostMapping("/enroll")
    public ResponseEntity<Void> enrollFingerprint(@RequestParam UUID deviceId, @RequestParam String personName) {
        return ResponseEntity.accepted().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFingerprint(@PathVariable UUID id) {
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}")
    public ResponseEntity<Void> renameFingerprint(@PathVariable UUID id, @RequestParam String newName) {
        return ResponseEntity.ok().build();
    }
}
