package com.smartlock.controller;

import com.smartlock.dto.AccessLogResponseDTO;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/access-logs")
public class AccessLogController {

    private final com.smartlock.repository.AccessLogRepository accessLogRepository;

    public AccessLogController(com.smartlock.repository.AccessLogRepository accessLogRepository) {
        this.accessLogRepository = accessLogRepository;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MEMBER', 'VIEWER')")
    public ResponseEntity<List<AccessLogResponseDTO>> getAccessLogs(
            @RequestParam(required = false) UUID deviceId,
            @RequestParam(required = false) String date) {
        
        List<com.smartlock.model.AccessLog> logs;
        if (date != null && !date.isEmpty()) {
            java.time.LocalDate targetDate = java.time.LocalDate.parse(date);
            java.time.LocalDateTime start = targetDate.atStartOfDay();
            java.time.LocalDateTime end = targetDate.atTime(23, 59, 59, 999999999);
            logs = accessLogRepository.findByCreatedAtBetweenOrderByCreatedAtDesc(start, end);
            // If deviceId is also provided, filter manually
            if (deviceId != null) {
                logs = logs.stream().filter(l -> l.getDevice() != null && l.getDevice().getId().equals(deviceId)).toList();
            }
        } else if (deviceId != null) {
            logs = accessLogRepository.findByDeviceIdOrderByCreatedAtDesc(deviceId);
        } else {
            logs = accessLogRepository.findAllByOrderByCreatedAtDesc();
        }

        List<AccessLogResponseDTO> response = logs.stream().map(log -> {
            AccessLogResponseDTO dto = new AccessLogResponseDTO();
            dto.setId(log.getId());
            if (log.getDevice() != null) {
                dto.setDeviceId(log.getDevice().getId());
                dto.setDeviceName(log.getDevice().getDeviceName());
            }
            if (log.getUser() != null) {
                dto.setUserName(log.getUser().getFullName());
            }
            if (log.getFingerprint() != null) {
                dto.setPersonName(log.getFingerprint().getPersonName());
            }
            dto.setMethod(log.getMethod());
            dto.setAction(log.getAction());
            dto.setDetail(log.getDetail());
            dto.setCreatedAt(log.getCreatedAt());
            return dto;
        }).toList();

        return ResponseEntity.ok(response);
    }

    private String escapeCsv(String value) {
        if (value == null) return "";
        return "\"" + value.replace("\"", "\"\"") + "\"";
    }

    @GetMapping("/export")
    @PreAuthorize("hasAnyRole('ADMIN', 'MEMBER')")
    public ResponseEntity<byte[]> exportToCsv() {
        List<com.smartlock.model.AccessLog> logs = accessLogRepository.findAllByOrderByCreatedAtDesc();
        StringBuilder csv = new StringBuilder("ID,Device,User,Person,Method,Action,Detail,Time\n");
        for (com.smartlock.model.AccessLog log : logs) {
            csv.append(escapeCsv(log.getId().toString())).append(",");
            csv.append(escapeCsv(log.getDevice() != null ? log.getDevice().getDeviceName() : "")).append(",");
            csv.append(escapeCsv(log.getUser() != null ? log.getUser().getFullName() : "")).append(",");
            csv.append(escapeCsv(log.getFingerprint() != null ? log.getFingerprint().getPersonName() : "")).append(",");
            csv.append(escapeCsv(log.getMethod() != null ? log.getMethod().name() : "")).append(",");
            csv.append(escapeCsv(log.getAction() != null ? log.getAction().name() : "")).append(",");
            csv.append(escapeCsv(log.getDetail())).append(",");
            csv.append(escapeCsv(log.getCreatedAt() != null ? log.getCreatedAt().toString() : "")).append("\n");
        }
        
        return org.springframework.http.ResponseEntity.ok()
                .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"access_logs.csv\"")
                .body(csv.toString().getBytes());
    }
}
