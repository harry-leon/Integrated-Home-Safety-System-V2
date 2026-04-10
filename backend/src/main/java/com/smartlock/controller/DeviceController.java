package com.smartlock.controller;

import com.smartlock.dto.DeviceResponseDTO;
import com.smartlock.service.CommandService;
import com.smartlock.service.DeviceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/devices")
@RequiredArgsConstructor
public class DeviceController {

    private final DeviceService deviceService;
    private final CommandService commandService;

    @GetMapping
    public ResponseEntity<List<DeviceResponseDTO>> getAllDevices() {
        return ResponseEntity.ok(deviceService.getAllDevices());
    }

    @GetMapping("/{id}")
    public ResponseEntity<DeviceResponseDTO> getDeviceById(@PathVariable UUID id) {
        return ResponseEntity.ok(deviceService.getDeviceById(id));
    }

    @PostMapping("/{id}/lock/toggle")
    public ResponseEntity<UUID> toggleLock(@PathVariable UUID id) {
        // Create a toggle command
        UUID commandId = commandService.sendCommand(id, "LOCK_TOGGLE", "{}");
        return ResponseEntity.accepted().body(commandId);
    }
}
