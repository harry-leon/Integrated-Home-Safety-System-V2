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

    private boolean webPushEnabled = true;
    private boolean emailEnabled = true;

    private boolean gasAlertEnabled = true;
    private boolean intruderAlertEnabled = true;
    private boolean wrongPassAlertEnabled = true;
    private boolean fingerprintAlertEnabled = true;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
