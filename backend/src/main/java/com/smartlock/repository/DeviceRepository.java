package com.smartlock.repository;

import com.smartlock.model.Device;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface DeviceRepository extends JpaRepository<Device, UUID> {
    // Basic CRUD provided by JpaRepository
}
