package com.smartlock.model;

import com.smartlock.model.enums.UserDevicePermission;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Maps users to devices with specific permissions (OWNER, CONTROL, VIEW_ONLY).
 * Corresponds to USER_DEVICES table in SRS ERD.
 */
@Entity
@Table(name = "user_devices")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserDevice {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "device_id", nullable = false)
    private Device device;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserDevicePermission permission;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime grantedAt;
}
