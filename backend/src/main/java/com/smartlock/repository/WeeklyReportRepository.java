package com.smartlock.repository;

import com.smartlock.model.WeeklyReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface WeeklyReportRepository extends JpaRepository<WeeklyReport, UUID> {
    List<WeeklyReport> findByDeviceIdOrderByWeekStartDesc(UUID deviceId);
}
