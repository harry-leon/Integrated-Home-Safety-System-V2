package com.smartlock.controller;

import com.smartlock.common.security.VerificationService;
import com.smartlock.model.enums.AccessAction;
import com.smartlock.model.enums.AccessMethod;
import com.smartlock.service.DeviceAccessService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/fingerprints")
@RequiredArgsConstructor
public class FingerprintController {

    private final VerificationService verificationService;
    private final DeviceAccessService deviceAccessService;
    private final com.smartlock.repository.FingerprintRepository fingerprintRepository;
    private final com.smartlock.repository.DeviceRepository deviceRepository;
    private final com.smartlock.repository.UserRepository userRepository;
    private final com.smartlock.service.AuditLogService auditLogService;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<Map<String, Object>>> getFingerprints(
            @RequestParam(required = false) UUID deviceId,
            Authentication authentication
    ) {
        if (deviceId != null) {
            deviceAccessService.requireView(deviceId, authentication);
        }

        List<UUID> accessibleDeviceIds = deviceAccessService.getAccessibleDeviceIds(authentication);
        boolean admin = deviceAccessService.isAdmin(authentication);

        return ResponseEntity.ok(
                fingerprintRepository.findAll().stream()
                        .filter(fp -> deviceId == null || (fp.getDevice() != null && deviceId.equals(fp.getDevice().getId())))
                        .filter(fp -> admin || (fp.getDevice() != null && accessibleDeviceIds.contains(fp.getDevice().getId())))
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
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> enrollFingerprint(
            @RequestParam UUID deviceId,
            @RequestParam String personName,
            @RequestHeader(value = "X-Verification-Token", required = false) String verificationToken,
            Authentication authentication
    ) {
        deviceAccessService.requireControl(deviceId, authentication);
        if (!verificationService.isVerified(verificationToken)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Step-up verification required for this action");
        }

        var device = deviceRepository.findById(deviceId).orElse(null);
        if (device == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Device not found");
        }

        var user = userRepository.findByEmail(authentication.getName()).orElse(null);

        com.smartlock.model.Fingerprint fingerprint = com.smartlock.model.Fingerprint.builder()
                .device(device)
                .personName(personName)
                .registeredBy(user)
                .accessLevel("STANDARD")
                .isActive(true)
                .fingerSlotId((int) (fingerprintRepository.count() + 1))
                .build();

        fingerprintRepository.save(fingerprint);

        auditLogService.logAction(device, AccessAction.ENROLLED, AccessMethod.FINGERPRINT, "Da dang ky van tay moi cho: " + personName);

        return ResponseEntity.status(HttpStatus.CREATED).body(java.util.Map.of("id", fingerprint.getId()));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> deleteFingerprint(
            @PathVariable UUID id,
            @RequestHeader(value = "X-Verification-Token", required = false) String verificationToken,
            Authentication authentication
    ) {
        if (!verificationService.isVerified(verificationToken)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Step-up verification required for this action");
        }

        fingerprintRepository.findById(id).ifPresent(fp -> {
            deviceAccessService.requireControl(fp.getDevice().getId(), authentication);
            auditLogService.logAction(fp.getDevice(), AccessAction.DELETED, AccessMethod.FINGERPRINT, "Da xoa van tay cua: " + fp.getPersonName());
            fingerprintRepository.deleteById(id);
        });

        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> renameFingerprint(
            @PathVariable UUID id,
            @RequestParam String newName,
            Authentication authentication
    ) {
        var fingerprint = fingerprintRepository.findById(id).orElse(null);
        if (fingerprint == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Fingerprint not found");
        }

        deviceAccessService.requireControl(fingerprint.getDevice().getId(), authentication);
        fingerprint.setPersonName(newName);
        fingerprintRepository.save(fingerprint);

        return ResponseEntity.ok(fingerprint);
    }
}
