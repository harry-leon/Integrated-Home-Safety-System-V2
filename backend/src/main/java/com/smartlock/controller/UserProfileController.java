package com.smartlock.controller;

import com.smartlock.dto.UpdateUserProfileRequestDTO;
import com.smartlock.dto.UserLoginSessionResponseDTO;
import com.smartlock.dto.UserProfileResponseDTO;
import com.smartlock.service.UserLoginSessionService;
import com.smartlock.service.UserProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/me")
@RequiredArgsConstructor
public class UserProfileController {

    private final UserProfileService userProfileService;
    private final UserLoginSessionService userLoginSessionService;

    @GetMapping("/profile")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserProfileResponseDTO> getCurrentProfile(Authentication authentication) {
        return ResponseEntity.ok(userProfileService.getCurrentProfile(authentication.getName()));
    }

    @PatchMapping("/profile")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserProfileResponseDTO> updateCurrentProfile(
            Authentication authentication,
            @Valid @RequestBody UpdateUserProfileRequestDTO request
    ) {
        return ResponseEntity.ok(userProfileService.updateCurrentProfile(authentication.getName(), request));
    }

    @PostMapping(value = "/profile/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserProfileResponseDTO> uploadAvatar(
            Authentication authentication,
            @RequestPart("file") MultipartFile file
    ) {
        return ResponseEntity.ok(userProfileService.uploadAvatar(authentication.getName(), file));
    }

    @GetMapping("/logins")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<UserLoginSessionResponseDTO>> getLoginActivity(
            Authentication authentication,
            @RequestHeader(value = "Authorization", required = false) String authorizationHeader
    ) {
        String rawToken = extractRawToken(authorizationHeader);
        return ResponseEntity.ok(
                userLoginSessionService.getRecentSessions(
                        userProfileService.getUserByEmail(authentication.getName()),
                        rawToken
                )
        );
    }

    private String extractRawToken(String authorizationHeader) {
        if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
            return null;
        }
        return authorizationHeader.substring(7);
    }
}
