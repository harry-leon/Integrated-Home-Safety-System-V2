package com.smartlock.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "faces")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FaceRecognition {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    private Integer faceSlotId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "device_id", nullable = false)
    private Device device;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "registered_by")
    private User registeredBy;

    private String personName;
    
    @Builder.Default
    private boolean isActive = true;

    @CreationTimestamp
    private LocalDateTime registeredAt;

    private LocalDateTime lastAccess;
    
    @Builder.Default
    private Integer totalAccessCount = 0;
}
