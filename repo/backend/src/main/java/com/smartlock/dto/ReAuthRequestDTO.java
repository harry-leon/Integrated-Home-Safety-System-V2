package com.smartlock.dto;

import lombok.Data;

/**
 * Request body for re-authentication before sensitive actions
 * (unlock, fingerprint delete, settings change).
 */
@Data
public class ReAuthRequestDTO {
    private String password;
}
