package com.smartlock.controller;

import com.smartlock.common.security.VerificationService;
import com.smartlock.model.FaceRecognition;
import com.smartlock.repository.FaceRecognitionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/faces")
@RequiredArgsConstructor
public class FaceRecognitionController {

    private final FaceRecognitionRepository faceRepository;
    private final VerificationService verificationService;

    @GetMapping("/device/{deviceId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MEMBER')")
    public ResponseEntity<List<FaceRecognition>> getFacesByDevice(@PathVariable UUID deviceId) {
        return ResponseEntity.ok(faceRepository.findByDeviceId(deviceId));
    }

    @PostMapping("/enroll")
    @PreAuthorize("hasAnyRole('ADMIN', 'MEMBER')")
    public ResponseEntity<?> enrollFace(
            @RequestParam UUID deviceId,
            @RequestParam String personName,
            @RequestHeader(value = "X-Verification-Token", required = false) String verificationToken
    ) {
        if (!verificationService.isVerified(verificationToken)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Step-up verification required for this action");
        }
        // Simulation: In a real IoT scenario, we would send a command to the device to start scanning.
        return ResponseEntity.accepted().body("Face enrollment initiated for " + personName);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MEMBER')")
    public ResponseEntity<?> deleteFace(
            @PathVariable UUID id,
            @RequestHeader(value = "X-Verification-Token", required = false) String verificationToken
    ) {
        if (!verificationService.isVerified(verificationToken)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Step-up verification required for this action");
        }
        faceRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
