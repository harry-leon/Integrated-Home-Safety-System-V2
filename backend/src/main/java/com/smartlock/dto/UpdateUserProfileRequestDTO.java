package com.smartlock.dto;

import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDate;

@Data
public class UpdateUserProfileRequestDTO {

    @Size(max = 255, message = "Full name must not exceed 255 characters")
    private String fullName;

    @Size(max = 50, message = "Phone must not exceed 50 characters")
    @Pattern(regexp = "^[0-9+()\\-\\s]{0,50}$", message = "Phone contains invalid characters")
    private String phone;

    @Size(max = 30, message = "Gender must not exceed 30 characters")
    private String gender;

    @Past(message = "Date of birth must be in the past")
    private LocalDate dateOfBirth;

    @Size(max = 255, message = "Address must not exceed 255 characters")
    private String address;

    @Size(max = 1000, message = "Bio must not exceed 1000 characters")
    private String bio;
}
