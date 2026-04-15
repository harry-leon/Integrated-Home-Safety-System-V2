package com.smartlock.controller;

import com.smartlock.common.security.VerificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import com.smartlock.model.enums.AccessAction;
import com.smartlock.model.enums.AccessMethod;

@RestController
@RequestMapping("/api/fingerprints")
@RequiredArgsConstructor
public class FingerprintController {

    private final VerificationService verificationService;
    private final com.smartlock.repository.FingerprintRepository fingerprintRepository;
    private final com.smartlock.repository.DeviceRepository deviceRepository;
    private final com.smartlock.repository.UserRepository userRepository;
    private final com.smartlock.service.AuditLogService auditLogService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MEMBER', 'VIEWER')")
    public ResponseEntity<List<Map<String, Object>>> getFingerprints(
            @RequestParam(required = false) UUID deviceId
    ) {
        return ResponseEntity.ok(
                fingerprintRepository.findAll().stream()
                        .filter(fp -> deviceId == null || (fp.getDevice() != null && deviceId.equals(fp.getDevice().getId())))
                        .sorted(Comparator.comparing(com.smartlock.model.Fingerprint::getFingerSlotId, Comparator.nullsLast(Integer::compareTo)))
                        .map(fp -> Map.<String, Object>ofEntries(
                                Map.entry("id", fp.getId()),
                                Map.entry("fingerSlotId", fp.getFingerSlotId()),
                                Map.entry("deviceId", fp.getDevice() != null ? fp.getDevice().getId() : null),
                                Map.entry("personName", fp.getPersonName() != null ? fp.getPersonName() : ""),
                                Map.entry("accessLevel", fp.getAccessLevel() != null ? fp.getAccessLevel() : "STANDARD"),
                                Map.entry("isActive", fp.isActive()),
                                Map.entry("registeredAt", fp.getRegisteredAt() != null ? fp.getRegisteredAt() : LocalDateTime.now()),
                                Map.entry("lastAccess", fp.getLastAccess() != null ? fp.getLastAccess() : fp.getRegisteredAt() != null ? fp.getRegisteredAt() : LocalDateTime.now()),
                                Map.entry("totalAccessCount", fp.getTotalAccessCount() != null ? fp.getTotalAccessCount() : 0)
                        ))
                        .toList()
        );
    }

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
        
        auditLogService.logAction(device, AccessAction.ENROLLED, AccessMethod.FINGERPRINT, "Đã đăng ký vân tay mới cho: " + personName);

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
        
        fingerprintRepository.findById(id).ifPresent(fp -> {
            auditLogService.logAction(fp.getDevice(), AccessAction.DELETED, AccessMethod.FINGERPRINT, "Đã xóa vân tay của: " + fp.getPersonName());
            fingerprintRepository.deleteById(id);
        });
        
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
