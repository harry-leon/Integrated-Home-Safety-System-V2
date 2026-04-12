package com.smartlock.common.security;

import com.smartlock.service.JwtService;
import io.jsonwebtoken.Claims;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class VerificationService {

    private final JwtService jwtService;

    /**
     * Checks if the provided verification token is valid and has the correct claim.
     */
    public boolean isVerified(String verificationToken) {
        if (verificationToken == null || verificationToken.isEmpty()) {
            return false;
        }
        try {
            String type = jwtService.extractClaim(verificationToken, claims -> claims.get("type", String.class));
            return "VERIFICATION".equals(type);
        } catch (Exception e) {
            return false;
        }
    }
}
