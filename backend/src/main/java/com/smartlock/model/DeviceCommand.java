package com.smartlock.model;

import com.smartlock.model.enums.CommandStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "device_commands")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DeviceCommand {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "device_id", nullable = false)
    private Device device;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "requested_by")
    private User requestedBy;

    private String commandType;
    
    @Column(columnDefinition = "TEXT")
    private String payloadJson;

    @Enumerated(EnumType.STRING)
    private CommandStatus status;

    @CreationTimestamp
    private LocalDateTime requestedAt;
    
    private LocalDateTime sentAt;
    
    private LocalDateTime acknowledgedAt;
    private LocalDateTime completedAt;
    
    private String failureReason;
    
    @Builder.Default
    private int retryCount = 0;
}

