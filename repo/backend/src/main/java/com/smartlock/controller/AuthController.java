package com.smartlock.controller;

import com.smartlock.dto.LoginRequestDTO;
import com.smartlock.dto.LoginResponseDTO;
import com.smartlock.dto.ReAuthRequestDTO;
import com.smartlock.dto.RegisterRequestDTO;
import com.smartlock.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<LoginResponseDTO> login(@RequestBody LoginRequestDTO request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/register")
    public ResponseEntity<LoginResponseDTO> register(@RequestBody RegisterRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.register(request));
    }

    @PostMapping("/re-auth")
    public ResponseEntity<?> reAuthenticate(@RequestBody ReAuthRequestDTO request) {
        if (authService.reAuthenticate(request)) {
            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            String verificationToken = authService.generateVerificationToken(email);
            return ResponseEntity.ok(Map.of("verificationToken", verificationToken));
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid password");
    }
}
