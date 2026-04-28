package com.smartlock.service;

import com.smartlock.dto.UserLoginSessionResponseDTO;
import com.smartlock.model.User;
import com.smartlock.model.UserLoginSession;
import com.smartlock.repository.UserLoginSessionRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.HexFormat;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UserLoginSessionService {

    private static final long TOUCH_THROTTLE_MILLIS = 60_000;

    private final UserLoginSessionRepository sessionRepository;
    private final Map<String, Long> recentSessionTouches = new ConcurrentHashMap<>();

    public void recordLogin(User user, String rawToken, HttpServletRequest request) {
        String tokenHash = hashToken(rawToken);
        long now = System.currentTimeMillis();

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
        saveSession(session, tokenHash);
        recentSessionTouches.put(tokenHash, now);
    }

    public void touchSession(User user, String rawToken, HttpServletRequest request) {
        if (rawToken == null || rawToken.isBlank()) {
            return;
        }

        String tokenHash = hashToken(rawToken);
        long now = System.currentTimeMillis();
        Long lastTouch = recentSessionTouches.get(tokenHash);
        if (lastTouch != null && now - lastTouch < TOUCH_THROTTLE_MILLIS) {
            return;
        }

        UserLoginSession session = sessionRepository.findBySessionTokenHash(tokenHash).orElse(null);
        if (session == null) {
            return;
        }

        session.setLastActiveAt(LocalDateTime.now());
        saveSession(session, tokenHash);
        recentSessionTouches.put(tokenHash, now);
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

    private UserLoginSession saveSession(UserLoginSession session, String tokenHash) {
        try {
            return sessionRepository.saveAndFlush(session);
        } catch (DataIntegrityViolationException ex) {
            UserLoginSession existing = sessionRepository.findBySessionTokenHash(tokenHash)
                    .orElseThrow(() -> ex);
            existing.setIpAddress(session.getIpAddress());
            existing.setUserAgent(session.getUserAgent());
            existing.setDeviceName(session.getDeviceName());
            existing.setLocation(session.getLocation());
            existing.setLastActiveAt(session.getLastActiveAt());
            existing.setLoggedOutAt(session.getLoggedOutAt());
            return sessionRepository.saveAndFlush(existing);
        }
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
