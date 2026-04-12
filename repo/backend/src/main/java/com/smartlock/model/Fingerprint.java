package com.smartlock.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "fingerprints")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Fingerprint {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    private Integer fingerSlotId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "device_id", nullable = false)
    private Device device;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "registered_by")
    private User registeredBy;

    private String personName;
    private String accessLevel;
    private boolean isActive = true;

    @CreationTimestamp
    private LocalDateTime registeredAt;

    private LocalDateTime lastAccess;
    private Integer totalAccessCount = 0;
}
