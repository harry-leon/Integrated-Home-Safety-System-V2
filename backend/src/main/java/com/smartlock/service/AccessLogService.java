package com.smartlock.service;

import com.smartlock.dto.AccessLogResponseDTO;
import com.smartlock.model.AccessLog;
import com.smartlock.repository.AccessLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AccessLogService {

    private final AccessLogRepository accessLogRepository;

    public Page<AccessLogResponseDTO> getAccessLogs(UUID deviceId, List<UUID> accessibleDeviceIds, boolean admin, LocalDateTime start, LocalDateTime end, Pageable pageable) {
        if (!admin && (accessibleDeviceIds == null || accessibleDeviceIds.isEmpty())) {
            return Page.empty(pageable);
        }

        List<UUID> deviceIds = admin ? List.of(new UUID(0L, 0L)) : accessibleDeviceIds;
        return accessLogRepository
                .findLogsPage(deviceId, deviceIds, admin, start, end, pageable)
                .map(this::mapToDTO);
    }

    public String exportLogsToCSV(UUID deviceId, List<UUID> accessibleDeviceIds, boolean admin, LocalDateTime start, LocalDateTime end) {
        if (!admin && (accessibleDeviceIds == null || accessibleDeviceIds.isEmpty())) {
            return "ID,Device,User,Person,Method,Action,Detail,Time\n";
        }

        List<AccessLog> logs = accessLogRepository.findLogsOptimized(deviceId, start, end).stream()
                .filter(log -> admin || accessibleDeviceIds.contains(log.getDevice().getId()))
                .collect(Collectors.toList());

        StringBuilder csv = new StringBuilder("ID,Device,User,Person,Method,Action,Detail,Time\n");
        for (AccessLog log : logs) {
            csv.append(log.getId() != null ? log.getId() : "").append(",");
            
            String deviceName = "";
            try { if (log.getDevice() != null) deviceName = log.getDevice().getDeviceName(); } catch (Exception e) {}
            csv.append(deviceName != null ? deviceName : "").append(",");
            
            String userName = "";
            try { if (log.getUser() != null) userName = log.getUser().getFullName(); } catch (Exception e) {}
            csv.append(userName != null ? userName : "").append(",");
            
            String personName = "";
            try { if (log.getFingerprint() != null) personName = log.getFingerprint().getPersonName(); } catch (Exception e) {}
            csv.append(personName != null ? personName : "").append(",");
            
            csv.append(log.getMethod() != null ? log.getMethod() : "").append(",");
            csv.append(log.getAction() != null ? log.getAction() : "").append(",");
            csv.append(escapeCsv(log.getDetail())).append(",");
            csv.append(log.getCreatedAt() != null ? log.getCreatedAt() : "").append("\n");
        }
        return csv.toString();
    }

    private String escapeCsv(String value) {
        if (value == null) return "";
        return "\"" + value.replace("\"", "\"\"") + "\"";
    }

    private AccessLogResponseDTO mapToDTO(AccessLog log) {
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
    }
}
