package com.smartlock.controller;

import com.smartlock.dto.DeviceResponseDTO;
import com.smartlock.service.CommandService;
import com.smartlock.service.DeviceAccessService;
import com.smartlock.service.DeviceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/devices")
@RequiredArgsConstructor
public class DeviceController {

    private final DeviceService deviceService;
    private final CommandService commandService;
    private final DeviceAccessService deviceAccessService;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<DeviceResponseDTO>> getAllDevices(Authentication authentication) {
        return ResponseEntity.ok(deviceService.getAllDevices(authentication));
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<DeviceResponseDTO> getDeviceById(@PathVariable UUID id, Authentication authentication) {
        return ResponseEntity.ok(deviceService.getDeviceById(id, authentication));
    }

    @PostMapping("/{id}/lock/toggle")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> toggleLock(
            @PathVariable UUID id,
            Authentication authentication
    ) {
        deviceAccessService.requireControl(id, authentication);
        UUID commandId = commandService.sendCommand(id, "LOCK_TOGGLE", "{}");
        return ResponseEntity.accepted().body(commandId);
    }
}
