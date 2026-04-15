package com.smartlock.service;

import com.smartlock.dto.UpdateUserProfileRequestDTO;
import com.smartlock.dto.UserProfileResponseDTO;
import com.smartlock.model.User;
import com.smartlock.model.UserDetail;
import com.smartlock.repository.UserDetailRepository;
import com.smartlock.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Base64;

@Service
@RequiredArgsConstructor
public class UserProfileService {

    private static final long MAX_AVATAR_SIZE_BYTES = 1024 * 1024;

    private final UserRepository userRepository;
    private final UserDetailRepository userDetailRepository;

    public UserProfileResponseDTO getCurrentProfile(String email) {
        User user = getUserByEmail(email);
        UserDetail detail = getOrCreateUserDetail(user);
        return toDto(user, detail);
    }

    public UserProfileResponseDTO updateCurrentProfile(String email, UpdateUserProfileRequestDTO request) {
        User user = getUserByEmail(email);
        UserDetail detail = getOrCreateUserDetail(user);

        detail.setFullName(normalize(request.getFullName()));
        detail.setPhone(normalize(request.getPhone()));
        detail.setGender(normalize(request.getGender()));
        detail.setDateOfBirth(request.getDateOfBirth());
        detail.setAddress(normalize(request.getAddress()));
        detail.setBio(normalize(request.getBio()));

        user.setFullName(resolveFullName(user, detail));
        user.setUpdatedAt(LocalDateTime.now());

        userRepository.save(user);
        userDetailRepository.save(detail);
        return toDto(user, detail);
    }

    public UserProfileResponseDTO uploadAvatar(String email, MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new RuntimeException("Avatar file is required");
        }
        if (file.getSize() > MAX_AVATAR_SIZE_BYTES) {
            throw new RuntimeException("Avatar file must be 1MB or smaller");
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new RuntimeException("Only image files are allowed");
        }
        if (!contentType.equals("image/png")
                && !contentType.equals("image/jpeg")
                && !contentType.equals("image/webp")
                && !contentType.equals("image/gif")) {
            throw new RuntimeException("Unsupported avatar file type");
        }

        User user = getUserByEmail(email);
        UserDetail detail = getOrCreateUserDetail(user);

        try {
            String dataUrl = "data:" + contentType + ";base64," + Base64.getEncoder().encodeToString(file.getBytes());
            detail.setAvatarUrl(dataUrl);
            user.setUpdatedAt(LocalDateTime.now());
            userRepository.save(user);
            userDetailRepository.save(detail);
            return toDto(user, detail);
        } catch (IOException e) {
            throw new RuntimeException("Failed to process avatar upload");
        }
    }

    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    private UserDetail getOrCreateUserDetail(User user) {
        return userDetailRepository.findByUserId(user.getId())
                .orElseGet(() -> userDetailRepository.save(UserDetail.builder()
                        .user(user)
                        .fullName(user.getFullName())
                        .avatarUrl(user.getAvatarUrl())
                        .build()));
    }

    private UserProfileResponseDTO toDto(User user, UserDetail detail) {
        return UserProfileResponseDTO.builder()
                .userId(user.getId())
                .email(user.getEmail())
                .role(user.getRole())
                .fullName(resolveFullName(user, detail))
                .phone(detail.getPhone())
                .gender(detail.getGender())
                .dateOfBirth(detail.getDateOfBirth())
                .address(detail.getAddress())
                .bio(detail.getBio())
                .avatarUrl(detail.getAvatarUrl() != null ? detail.getAvatarUrl() : user.getAvatarUrl())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .lastLogin(user.getLastLogin())
                .build();
    }

    private String resolveFullName(User user, UserDetail detail) {
        if (detail.getFullName() != null && !detail.getFullName().isBlank()) {
            return detail.getFullName();
        }
        return user.getFullName();
    }

    private String normalize(String value) {
        if (value == null) return null;
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
