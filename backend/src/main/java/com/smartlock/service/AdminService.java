package com.smartlock.service;

import com.smartlock.dto.UserAdminResponseDTO;
import com.smartlock.dto.UserLoginSessionResponseDTO;
import com.smartlock.model.User;
import com.smartlock.repository.UserLoginSessionRepository;
import com.smartlock.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final UserLoginSessionRepository sessionRepository;

    public List<UserAdminResponseDTO> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::mapToAdminDto)
                .collect(Collectors.toList());
    }

    public List<UserLoginSessionResponseDTO> getAllSessions() {
        return sessionRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(session -> UserLoginSessionResponseDTO.builder()
                        .id(session.getId())
                        .deviceName(session.getDeviceName())
                        .ipAddress(session.getIpAddress())
                        .userAgent(session.getUserAgent())
                        .createdAt(session.getCreatedAt())
                        .lastActiveAt(session.getLastActiveAt())
                        .loggedOutAt(session.getLoggedOutAt())
                        .current(false) // Not relevant for global view
                        .build())
                .collect(Collectors.toList());
    }

    @Transactional
    public void toggleUserActive(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        user.setActive(!user.isActive());
        userRepository.save(user);
    }

    @Transactional
    public void updateUserRole(UUID userId, com.smartlock.model.enums.UserRole newRole) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        user.setRole(newRole);
        userRepository.save(user);
    }

    private UserAdminResponseDTO mapToAdminDto(User user) {
        return UserAdminResponseDTO.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole())
                .active(user.isActive())
                .createdAt(user.getCreatedAt())
                .lastLogin(user.getLastLogin())
                .build();
    }
}
