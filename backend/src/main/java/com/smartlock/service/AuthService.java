package com.smartlock.service;

import com.smartlock.dto.LoginRequestDTO;
import com.smartlock.dto.LoginResponseDTO;
import com.smartlock.dto.ReAuthRequestDTO;
import com.smartlock.dto.RegisterRequestDTO;
import com.smartlock.model.User;
import com.smartlock.model.enums.UserRole;
import com.smartlock.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final PasswordEncoder passwordEncoder;
    private final com.smartlock.common.security.LoginRateLimiterService rateLimiterService;
    private final UserProfileService userProfileService;
    private final UserLoginSessionService userLoginSessionService;

    public LoginResponseDTO register(RegisterRequestDTO request, HttpServletRequest httpServletRequest) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email already exists");
        }
        User user = new User();
        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setRole(UserRole.MEMBER);
        user.setActive(true);
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);

        LoginRequestDTO loginRequest = new LoginRequestDTO();
        loginRequest.setEmail(request.getEmail());
        loginRequest.setPassword(request.getPassword());
        return login(loginRequest, httpServletRequest);
    }

    public LoginResponseDTO login(LoginRequestDTO request, HttpServletRequest httpServletRequest) {
        if (rateLimiterService.isBlocked(request.getEmail())) {
            throw new RuntimeException("Account is temporarily locked due to too many failed attempts. Please try again in 15 minutes.");
        }

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getEmail(),
                            request.getPassword()
                    )
            );
            rateLimiterService.loginSucceeded(request.getEmail());
        } catch (org.springframework.security.core.AuthenticationException e) {
            rateLimiterService.loginFailed(request.getEmail());
            throw new RuntimeException("Invalid email or password");
        }

        var user = userRepository.findByEmail(request.getEmail())
                .orElseThrow();
        
        user.setLastLogin(LocalDateTime.now());
        userRepository.save(user);

        var jwtToken = jwtService.generateToken(user);
        userProfileService.getCurrentProfile(user.getEmail());
        userLoginSessionService.recordLogin(user, jwtToken, httpServletRequest);
        var profile = userProfileService.getCurrentProfile(user.getEmail());

        LoginResponseDTO response = new LoginResponseDTO();
        response.setAccessToken(jwtToken);
        response.setUserId(user.getId());
        response.setFullName(profile.getFullName());
        response.setEmail(user.getEmail());
        response.setRole(user.getRole());
        response.setAvatarUrl(profile.getAvatarUrl());

        return response;
    }

    public boolean reAuthenticate(ReAuthRequestDTO request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        var user = userRepository.findByEmail(email)
                .orElseThrow();
        
        return passwordEncoder.matches(request.getPassword(), user.getPasswordHash());
    }

    /**
     * Generates a short-lived token for sensitive actions after re-authentication.
     */
    public String generateVerificationToken(String email) {
        var user = userRepository.findByEmail(email).orElseThrow();
        Map<String, Object> claims = new HashMap<>();
        claims.put("type", "VERIFICATION");
        // Verification token expires in 5 minutes
        return jwtService.generateToken(claims, user);
    }

    public void logout(String email, String rawToken) {
        var user = userRepository.findByEmail(email).orElseThrow();
        userLoginSessionService.logout(user, rawToken);
    }
}
