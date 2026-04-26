package com.smartlock.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Stores per-user notification preferences.
 * Corresponds to NOTIFICATION_SETTINGS table in SRS ERD.
 */
@Entity
@Table(name = "notification_settings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationSettings {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Builder.Default
    private boolean webPushEnabled = true;
    @Builder.Default
    private boolean emailEnabled = true;

    @Builder.Default
    private boolean gasAlertEnabled = true;
    @Builder.Default
    private boolean intruderAlertEnabled = true;
    @Builder.Default
    private boolean wrongPassAlertEnabled = true;
    @Builder.Default
    private boolean fingerprintAlertEnabled = true;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
