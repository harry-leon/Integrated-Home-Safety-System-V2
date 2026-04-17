package com.smartlock.service;

import com.smartlock.model.User;
import com.smartlock.model.UserDevice;
import com.smartlock.model.enums.UserDevicePermission;
import com.smartlock.model.enums.UserRole;
import com.smartlock.repository.UserDeviceRepository;
import com.smartlock.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DeviceAccessService {

    private final UserRepository userRepository;
    private final UserDeviceRepository userDeviceRepository;

    public boolean canView(UUID deviceId, Authentication authentication) {
        return hasPermission(deviceId, authentication, UserDevicePermission.VIEW_ONLY);
    }

    public boolean canControl(UUID deviceId, Authentication authentication) {
        return hasPermission(deviceId, authentication, UserDevicePermission.CONTROL);
    }

    public boolean isOwner(UUID deviceId, Authentication authentication) {
        return hasPermission(deviceId, authentication, UserDevicePermission.OWNER);
    }

    public void requireView(UUID deviceId, Authentication authentication) {
        requirePermission(deviceId, authentication, UserDevicePermission.VIEW_ONLY);
    }

    public void requireControl(UUID deviceId, Authentication authentication) {
        requirePermission(deviceId, authentication, UserDevicePermission.CONTROL);
    }

    public void requireOwner(UUID deviceId, Authentication authentication) {
        requirePermission(deviceId, authentication, UserDevicePermission.OWNER);
    }

    public List<UUID> getAccessibleDeviceIds(Authentication authentication) {
        User user = getAuthenticatedUser(authentication);
        if (user.getRole() == UserRole.ADMIN) {
            return List.of();
        }

        return userDeviceRepository.findByUserId(user.getId()).stream()
                .map(userDevice -> userDevice.getDevice().getId())
                .distinct()
                .sorted(Comparator.comparing(UUID::toString))
                .toList();
    }

    public boolean isAdmin(Authentication authentication) {
        return getAuthenticatedUser(authentication).getRole() == UserRole.ADMIN;
    }

    public User getAuthenticatedUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new AccessDeniedException("Authentication is required");
        }

        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new AccessDeniedException("Authenticated user not found"));
    }

    private boolean hasPermission(UUID deviceId, Authentication authentication, UserDevicePermission requiredPermission) {
        User user = getAuthenticatedUser(authentication);
        if (user.getRole() == UserRole.ADMIN) {
            return true;
        }

        return userDeviceRepository.findByUserIdAndDeviceId(user.getId(), deviceId)
                .map(UserDevice::getPermission)
                .map(permission -> satisfies(permission, requiredPermission))
                .orElse(false);
    }

    private void requirePermission(UUID deviceId, Authentication authentication, UserDevicePermission requiredPermission) {
        if (!hasPermission(deviceId, authentication, requiredPermission)) {
            throw new AccessDeniedException("You do not have permission to access this device");
        }
    }

    private boolean satisfies(UserDevicePermission actualPermission, UserDevicePermission requiredPermission) {
        if (actualPermission == UserDevicePermission.OWNER) {
            return true;
        }
        if (requiredPermission == UserDevicePermission.VIEW_ONLY) {
            return actualPermission == UserDevicePermission.VIEW_ONLY
                    || actualPermission == UserDevicePermission.CONTROL;
        }
        if (requiredPermission == UserDevicePermission.CONTROL) {
            return actualPermission == UserDevicePermission.CONTROL;
        }
        return false;
    }
}
