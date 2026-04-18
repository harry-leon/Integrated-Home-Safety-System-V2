package com.smartlock.controller;

import com.smartlock.common.security.VerificationService;
import com.smartlock.dto.FingerprintEnrollRequestDTO;
import com.smartlock.dto.FingerprintRenameRequestDTO;
import com.smartlock.model.Fingerprint;
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
import java.util.ArrayList;
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
                        .sorted(Comparator
                                .comparing((Fingerprint fp) -> fp.getDevice() != null ? fp.getDevice().getDeviceName() : "", Comparator.nullsLast(String::compareTo))
                                .thenComparing(Fingerprint::getFingerSlotId, Comparator.nullsLast(Integer::compareTo)))
                        .map(fp -> Map.<String, Object>ofEntries(
                                Map.entry("id", fp.getId()),
                                Map.entry("fingerSlotId", fp.getFingerSlotId()),
                                Map.entry("deviceId", fp.getDevice() != null ? fp.getDevice().getId() : null),
                                Map.entry("deviceName", fp.getDevice() != null ? fp.getDevice().getDeviceName() : ""),
                                Map.entry("personName", fp.getPersonName() != null ? fp.getPersonName() : ""),
                                Map.entry("accessLevel", normalizeAccessLevel(fp.getAccessLevel())),
                                Map.entry("isActive", fp.isActive()),
                                Map.entry("registeredAt", fp.getRegisteredAt() != null ? fp.getRegisteredAt() : LocalDateTime.now()),
                                Map.entry("lastAccess", fp.getLastAccess() != null ? fp.getLastAccess() : fp.getRegisteredAt() != null ? fp.getRegisteredAt() : LocalDateTime.now()),
                                Map.entry("totalAccessCount", fp.getTotalAccessCount() != null ? fp.getTotalAccessCount() : 0)
                        ))
                        .toList()
        );
    }

    @PostMapping("/enroll")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> enrollFingerprint(
            @RequestBody FingerprintEnrollRequestDTO request,
            @RequestHeader(value = "X-Verification-Token", required = false) String verificationToken,
            Authentication authentication
    ) {
        if (!verificationService.isVerified(verificationToken)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Step-up verification required for this action");
        }
        if (request.getDeviceId() == null) {
            return ResponseEntity.badRequest().body("Device is required");
        }
        if (request.getPersonName() == null || request.getPersonName().isBlank()) {
            return ResponseEntity.badRequest().body("Person name is required");
        }

        var device = deviceRepository.findById(request.getDeviceId()).orElse(null);
        if (device == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Device not found");
        }
        deviceAccessService.requireView(device.getId(), authentication);

        var user = userRepository.findByEmail(authentication.getName()).orElse(null);
        Integer fingerSlotId = request.getFingerSlotId() != null ? request.getFingerSlotId() : nextAvailableSlot(device.getId());
        if (fingerSlotId <= 0) {
            return ResponseEntity.badRequest().body("Finger slot must be greater than 0");
        }
        if (fingerprintRepository.existsByDeviceIdAndFingerSlotId(device.getId(), fingerSlotId)) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Finger slot is already in use for this device");
        }
        String accessLevel = normalizeIncomingAccessLevel(request.getAccessLevel());

        Fingerprint fingerprint = Fingerprint.builder()
                .device(device)
                .personName(request.getPersonName().trim())
                .registeredBy(user)
                .accessLevel(accessLevel)
                .isActive(true)
                .fingerSlotId(fingerSlotId)
                .build();

        fingerprintRepository.save(fingerprint);

        String noteSuffix = request.getNote() != null && !request.getNote().isBlank()
                ? " | Ghi chu: " + request.getNote().trim()
                : "";
        auditLogService.logAction(device, AccessAction.ENROLLED, AccessMethod.FINGERPRINT,
                "Da dang ky van tay moi cho: " + request.getPersonName().trim()
                        + " | Slot: " + fingerSlotId
                        + " | Quyen: " + accessLevel
                        + noteSuffix);

        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "id", fingerprint.getId(),
                "fingerSlotId", fingerprint.getFingerSlotId(),
                "deviceId", device.getId(),
                "deviceName", device.getDeviceName(),
                "personName", fingerprint.getPersonName(),
                "accessLevel", fingerprint.getAccessLevel()
        ));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteFingerprint(
            @PathVariable UUID id,
            @RequestHeader(value = "X-Verification-Token", required = false) String verificationToken,
            Authentication authentication
    ) {
        if (!verificationService.isVerified(verificationToken)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Step-up verification required for this action");
        }

        var fingerprint = fingerprintRepository.findById(id).orElse(null);
        if (fingerprint == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Fingerprint not found");
        }

        deviceAccessService.requireView(fingerprint.getDevice().getId(), authentication);
        auditLogService.logAction(fingerprint.getDevice(), AccessAction.DELETED, AccessMethod.FINGERPRINT,
                "Da xoa van tay cua: " + fingerprint.getPersonName() + " | Slot: " + fingerprint.getFingerSlotId());
        fingerprintRepository.deleteById(id);

        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> renameFingerprint(
            @PathVariable UUID id,
            @RequestBody FingerprintRenameRequestDTO request,
            Authentication authentication
    ) {
        var fingerprint = fingerprintRepository.findById(id).orElse(null);
        if (fingerprint == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Fingerprint not found");
        }
        if (request.getNewName() == null || request.getNewName().isBlank()) {
            return ResponseEntity.badRequest().body("New name is required");
        }

        deviceAccessService.requireView(fingerprint.getDevice().getId(), authentication);
        fingerprint.setPersonName(request.getNewName().trim());
        fingerprintRepository.save(fingerprint);

        return ResponseEntity.ok(fingerprint);
    }

    private Integer nextAvailableSlot(UUID deviceId) {
        List<Integer> slots = new ArrayList<>(fingerprintRepository.findByDeviceIdOrderByFingerSlotIdAsc(deviceId).stream()
                .map(Fingerprint::getFingerSlotId)
                .filter(slot -> slot != null && slot > 0)
                .toList());

        int next = 1;
        for (Integer slot : slots) {
            if (slot == next) {
                next++;
            } else if (slot > next) {
                break;
            }
        }
        return next;
    }

    private String normalizeAccessLevel(String accessLevel) {
        if (accessLevel == null || accessLevel.isBlank()) {
            return "STANDARD";
        }
        return switch (accessLevel.trim().toUpperCase()) {
            case "FULL", "ADMIN" -> "ADMIN";
            case "RESTRICTED", "GUEST" -> "GUEST";
            default -> "STANDARD";
        };
    }

    private String normalizeIncomingAccessLevel(String accessLevel) {
        return normalizeAccessLevel(accessLevel);
    }
}
