package com.smartlock.service;

import com.smartlock.model.AccessLog;
import com.smartlock.model.Device;
import com.smartlock.model.User;
import com.smartlock.model.enums.AccessAction;
import com.smartlock.model.enums.AccessMethod;
import com.smartlock.repository.AccessLogRepository;
import com.smartlock.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuditLogService {

    private final AccessLogRepository accessLogRepository;
    private final UserRepository userRepository;

    @Transactional
    public void logAction(Device device, AccessAction action, AccessMethod method, String detail) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email).orElse(null);

        AccessLog log = AccessLog.builder()
                .device(device)
                .user(user)
                .action(action)
                .method(method)
                .detail(detail)
                .createdAt(LocalDateTime.now())
                .build();

        accessLogRepository.save(log);
    }
}
