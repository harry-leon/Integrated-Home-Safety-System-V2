package com.smartlock.service;

import com.smartlock.dto.UserLoginSessionResponseDTO;
import com.smartlock.model.User;
import com.smartlock.model.UserLoginSession;
import com.smartlock.repository.UserLoginSessionRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.util.HexFormat;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UserLoginSessionService {

    private final UserLoginSessionRepository sessionRepository;

    public void recordLogin(User user, String rawToken, HttpServletRequest request) {
        String tokenHash = hashToken(rawToken);
        UserLoginSession session = sessionRepository.findBySessionTokenHash(tokenHash)
                .orElseGet(() -> UserLoginSession.builder()
                        .user(user)
                        .sessionTokenHash(tokenHash)
                        .build());

        session.setIpAddress(resolveIp(request));
        session.setUserAgent(truncate(request.getHeader("User-Agent"), 1024));
        session.setDeviceName(resolveDeviceName(request.getHeader("User-Agent")));
        session.setLocation(null);
        session.setLastActiveAt(LocalDateTime.now());
        session.setLoggedOutAt(null);
        sessionRepository.save(session);
    }

    public void touchSession(User user, String rawToken, HttpServletRequest request) {
        if (rawToken == null || rawToken.isBlank()) {
            return;
        }

        String tokenHash = hashToken(rawToken);
        UserLoginSession session = sessionRepository.findBySessionTokenHash(tokenHash)
                .orElseGet(() -> UserLoginSession.builder()
                        .user(user)
                        .sessionTokenHash(tokenHash)
                        .ipAddress(resolveIp(request))
                        .userAgent(truncate(request.getHeader("User-Agent"), 1024))
                        .deviceName(resolveDeviceName(request.getHeader("User-Agent")))
                        .location(null)
                        .build());

        session.setLastActiveAt(LocalDateTime.now());
        sessionRepository.save(session);
    }

    public void logout(User user, String rawToken) {
        if (rawToken == null || rawToken.isBlank()) {
            return;
        }

        sessionRepository.findBySessionTokenHash(hashToken(rawToken))
                .filter(session -> session.getUser().getId().equals(user.getId()))
                .ifPresent(session -> {
                    session.setLoggedOutAt(LocalDateTime.now());
                    session.setLastActiveAt(LocalDateTime.now());
                    sessionRepository.save(session);
                });
    }

    public List<UserLoginSessionResponseDTO> getRecentSessions(User user, String currentToken) {
        String currentTokenHash = currentToken == null || currentToken.isBlank() ? null : hashToken(currentToken);
        return sessionRepository.findTop10ByUserIdOrderByLastActiveAtDesc(user.getId())
                .stream()
                .map(session -> UserLoginSessionResponseDTO.builder()
                        .id(session.getId())
                        .current(currentTokenHash != null && currentTokenHash.equals(session.getSessionTokenHash()))
                        .ipAddress(session.getIpAddress())
                        .userAgent(session.getUserAgent())
                        .deviceName(session.getDeviceName())
                        .location(session.getLocation())
                        .createdAt(session.getCreatedAt())
                        .lastActiveAt(session.getLastActiveAt())
                        .loggedOutAt(session.getLoggedOutAt())
                        .build())
                .toList();
    }

    private String resolveIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return truncate(forwarded.split(",")[0].trim(), 120);
        }
        return truncate(request.getRemoteAddr(), 120);
    }

    private String resolveDeviceName(String userAgent) {
        if (userAgent == null || userAgent.isBlank()) {
            return "Unknown device";
        }

        String browser = "Browser";
        String os = "Unknown OS";
        String ua = userAgent.toLowerCase();

        if (ua.contains("edg")) browser = "Edge";
        else if (ua.contains("chrome")) browser = "Chrome";
        else if (ua.contains("firefox")) browser = "Firefox";
        else if (ua.contains("safari") && !ua.contains("chrome")) browser = "Safari";

        if (ua.contains("windows")) os = "Windows";
        else if (ua.contains("android")) os = "Android";
        else if (ua.contains("iphone") || ua.contains("ipad") || ua.contains("ios")) os = "iOS";
        else if (ua.contains("mac os")) os = "macOS";
        else if (ua.contains("linux")) os = "Linux";

        return browser + " on " + os;
    }

    private String hashToken(String rawToken) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            return HexFormat.of().formatHex(digest.digest(rawToken.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("Unable to hash session token", e);
        }
    }

    private String truncate(String value, int maxLength) {
        if (value == null) return null;
        return value.length() <= maxLength ? value : value.substring(0, maxLength);
    }
}
