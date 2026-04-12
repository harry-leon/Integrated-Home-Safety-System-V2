package com.smartlock.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Auto-generated weekly summary reports per device.
 * Corresponds to WEEKLY_REPORTS table in SRS ERD.
 */
@Entity
@Table(name = "weekly_reports")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WeeklyReport {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "device_id", nullable = false)
    private Device device;

    private LocalDate weekStart;
    private LocalDate weekEnd;

    private Integer totalAccessCount;
    private Integer totalAlertCount;
    private Integer totalFailedAttemptCount;

    @Column(columnDefinition = "TEXT")
    private String summaryJson; // JSON string with detailed breakdown

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime generatedAt;
}
