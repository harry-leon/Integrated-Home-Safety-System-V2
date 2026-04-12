package com.smartlock.controller;

import com.smartlock.common.security.VerificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/fingerprints")
@RequiredArgsConstructor
public class FingerprintController {

    private final VerificationService verificationService;
    private final com.smartlock.repository.FingerprintRepository fingerprintRepository;
    private final com.smartlock.repository.DeviceRepository deviceRepository;
    private final com.smartlock.repository.UserRepository userRepository;

    @PostMapping("/enroll")
    @PreAuthorize("hasAnyRole('ADMIN', 'MEMBER')")
    public ResponseEntity<?> enrollFingerprint(
            @RequestParam UUID deviceId,
            @RequestParam String personName,
            @RequestHeader(value = "X-Verification-Token", required = false) String verificationToken
    ) {
        if (!verificationService.isVerified(verificationToken)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Step-up verification required for this action");
        }
        
        var device = deviceRepository.findById(deviceId).orElse(null);
        if (device == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Device not found");
        }
        
        String email = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getName();
        var user = userRepository.findByEmail(email).orElse(null);

        com.smartlock.model.Fingerprint fingerprint = com.smartlock.model.Fingerprint.builder()
                .device(device)
                .personName(personName)
                .registeredBy(user)
                .accessLevel("STANDARD")
                .isActive(true)
                .fingerSlotId((int) (fingerprintRepository.count() + 1)) // temporary auto-increment slot
                .build();
                
        fingerprintRepository.save(fingerprint);

        return ResponseEntity.status(HttpStatus.CREATED).body(java.util.Map.of("id", fingerprint.getId()));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MEMBER')")
    public ResponseEntity<?> deleteFingerprint(
            @PathVariable UUID id,
            @RequestHeader(value = "X-Verification-Token", required = false) String verificationToken
    ) {
        if (!verificationService.isVerified(verificationToken)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Step-up verification required for this action");
        }
        
        if (fingerprintRepository.existsById(id)) {
            fingerprintRepository.deleteById(id);
        }
        
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MEMBER')")
    public ResponseEntity<?> renameFingerprint(@PathVariable UUID id, @RequestParam String newName) {
        var fingerprint = fingerprintRepository.findById(id).orElse(null);
        if (fingerprint == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Fingerprint not found");
        }
        
        fingerprint.setPersonName(newName);
        fingerprintRepository.save(fingerprint);
        
        return ResponseEntity.ok(fingerprint);
    }
}
