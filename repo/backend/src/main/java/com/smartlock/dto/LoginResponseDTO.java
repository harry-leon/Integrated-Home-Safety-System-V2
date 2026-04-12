package com.smartlock.dto;

import com.smartlock.model.enums.UserRole;
import lombok.Data;
import java.util.UUID;

/**
 * Response body after a successful login containing JWT token and user info.
 */
@Data
public class LoginResponseDTO {
    private String accessToken;
    private String tokenType = "Bearer";
    private UUID userId;
    private String fullName;
    private String email;
    private UserRole role;
}
