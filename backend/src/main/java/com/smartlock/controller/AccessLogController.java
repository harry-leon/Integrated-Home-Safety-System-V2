package com.smartlock.controller;

import com.smartlock.dto.AccessLogResponseDTO;
import com.smartlock.service.AccessLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.UUID;

@RestController
@RequestMapping("/api/access-logs")
@RequiredArgsConstructor
public class AccessLogController {

    private final AccessLogService accessLogService;

    @GetMapping
    // @PreAuthorize("hasAnyRole('ADMIN', 'MEMBER', 'VIEWER')")
    public ResponseEntity<Page<AccessLogResponseDTO>> getAccessLogs(
            @RequestParam(required = false) UUID deviceId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end,
            @PageableDefault(size = 20) Pageable pageable
    ) {
        try {
            return ResponseEntity.ok(accessLogService.getAccessLogs(deviceId, start, end, pageable));
        } catch (Exception e) {
            e.printStackTrace();
            throw e;
        }
    }

    @GetMapping("/export")
    // @PreAuthorize("hasAnyRole('ADMIN', 'MEMBER')")
    public ResponseEntity<Resource> exportLogs(
            @RequestParam(required = false) UUID deviceId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end
    ) {
        try {
            String csv = accessLogService.exportLogsToCSV(deviceId, start, end);
            byte[] data = csv.getBytes(StandardCharsets.UTF_8);
            ByteArrayResource resource = new ByteArrayResource(data);

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=access_logs.csv")
                    .contentType(MediaType.parseMediaType("text/csv"))
                    .contentLength(data.length)
                    .body(resource);
        } catch (Exception e) {
            e.printStackTrace();
            throw e;
        }
    }
}
