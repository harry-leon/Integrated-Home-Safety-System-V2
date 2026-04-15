package com.smartlock.controller;

import com.smartlock.dto.LoginRequestDTO;
import com.smartlock.dto.LoginResponseDTO;
import com.smartlock.dto.ReAuthRequestDTO;
import com.smartlock.dto.RegisterRequestDTO;
import com.smartlock.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<LoginResponseDTO> login(
            @Valid @RequestBody LoginRequestDTO request,
            HttpServletRequest httpServletRequest
    ) {
        return ResponseEntity.ok(authService.login(request, httpServletRequest));
    }

    @PostMapping("/register")
    public ResponseEntity<LoginResponseDTO> register(
            @Valid @RequestBody RegisterRequestDTO request,
            HttpServletRequest httpServletRequest
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.register(request, httpServletRequest));
    }

    @PostMapping("/re-auth")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> reAuthenticate(@RequestBody ReAuthRequestDTO request) {
        if (authService.reAuthenticate(request)) {
            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            String verificationToken = authService.generateVerificationToken(email);
            return ResponseEntity.ok(Map.of("verificationToken", verificationToken));
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid password");
    }

    @PostMapping("/logout")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> logout(
            Authentication authentication,
            @RequestHeader(value = "Authorization", required = false) String authorizationHeader
    ) {
        if (authentication != null) {
            authService.logout(authentication.getName(), extractRawToken(authorizationHeader));
        }
        return ResponseEntity.ok(Map.of("message", "Logged out"));
    }

    private String extractRawToken(String authorizationHeader) {
        if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
            return null;
        }
        return authorizationHeader.substring(7);
    }
}

