package com.smartlock.controller;

import com.smartlock.dto.UserAdminResponseDTO;
import com.smartlock.dto.UserLoginSessionResponseDTO;
import com.smartlock.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/users")
    public ResponseEntity<List<UserAdminResponseDTO>> getAllUsers() {
        return ResponseEntity.ok(adminService.getAllUsers());
    }

    @GetMapping("/sessions")
    public ResponseEntity<List<UserLoginSessionResponseDTO>> getAllSessions() {
        return ResponseEntity.ok(adminService.getAllSessions());
    }

    @PatchMapping("/users/{userId}/toggle-active")
    public ResponseEntity<Void> toggleUserActive(@PathVariable UUID userId) {
        adminService.toggleUserActive(userId);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/users/{userId}/role")
    public ResponseEntity<Void> updateUserRole(
            @PathVariable UUID userId,
            @RequestParam com.smartlock.model.enums.UserRole role) {
        adminService.updateUserRole(userId, role);
        return ResponseEntity.noContent().build();
    }
}
