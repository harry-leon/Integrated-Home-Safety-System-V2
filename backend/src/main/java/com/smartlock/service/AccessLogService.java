package com.smartlock.service;

import com.smartlock.dto.AccessLogResponseDTO;
import com.smartlock.model.AccessLog;
import com.smartlock.repository.AccessLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import jakarta.persistence.criteria.Predicate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AccessLogService {

    private final AccessLogRepository accessLogRepository;

    public Page<AccessLogResponseDTO> getAccessLogs(UUID deviceId, LocalDateTime start, LocalDateTime end, Pageable pageable) {
        Specification<AccessLog> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (deviceId != null) {
                predicates.add(cb.equal(root.get("device").get("id"), deviceId));
            }
            if (start != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("createdAt"), start));
            }
            if (end != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("createdAt"), end));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return accessLogRepository.findAll(spec, pageable).map(this::mapToDTO);
    }

    public String exportLogsToCSV(UUID deviceId, LocalDateTime start, LocalDateTime end) {
        // Implementation similar to AlertService
        List<AccessLog> logs = accessLogRepository.findAllByOrderByCreatedAtDesc(); // Simplification for now
        StringBuilder csv = new StringBuilder("ID,Device,User,Person,Method,Action,Detail,Time\n");
        for (AccessLog log : logs) {
            csv.append(log.getId()).append(",");
            csv.append(log.getDevice() != null ? log.getDevice().getDeviceName() : "").append(",");
            csv.append(log.getUser() != null ? log.getUser().getFullName() : "").append(",");
            csv.append(log.getFingerprint() != null ? log.getFingerprint().getPersonName() : "").append(",");
            csv.append(log.getMethod()).append(",");
            csv.append(log.getAction()).append(",");
            csv.append(escapeCsv(log.getDetail())).append(",");
            csv.append(log.getCreatedAt()).append("\n");
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
