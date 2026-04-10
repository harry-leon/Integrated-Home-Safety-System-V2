package com.smartlock.dto;

import lombok.Data;

/**
 * Request body for user login.
 */
@Data
public class LoginRequestDTO {
    private String email;
    private String password;
}
