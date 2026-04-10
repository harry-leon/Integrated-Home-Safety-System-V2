package com.smartlock.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "device_settings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DeviceSettings {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "device_id", nullable = false)
    private Device device;

    private String lockPasswordHash;
    private Integer gasThreshold;
    private Integer ldrThreshold;
    private Integer autoLockDelay;
    
    private boolean autoLockEnabled;
    private boolean gasAlertEnabled;
    private boolean pirAlertEnabled;

    private Integer maxPassFail;
    private Integer keypadLockDuration;
    private Integer lightDuration;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
