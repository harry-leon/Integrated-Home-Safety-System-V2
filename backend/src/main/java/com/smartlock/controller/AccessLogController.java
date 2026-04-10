package com.smartlock.controller;

import com.smartlock.dto.AccessLogResponseDTO;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/access-logs")
public class AccessLogController {

    @GetMapping
    public ResponseEntity<List<AccessLogResponseDTO>> getAccessLogs(
            @RequestParam(required = false) UUID deviceId,
            @RequestParam(required = false) String date) {
        return ResponseEntity.ok().build();
    }

    @GetMapping("/export")
    public ResponseEntity<byte[]> exportToCsv() {
        return ResponseEntity.ok().build();
    }
}
