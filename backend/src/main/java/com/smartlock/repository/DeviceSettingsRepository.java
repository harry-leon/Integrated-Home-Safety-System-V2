package com.smartlock.repository;

import com.smartlock.model.DeviceSettings;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface DeviceSettingsRepository extends JpaRepository<DeviceSettings, UUID> {
    Optional<DeviceSettings> findByDeviceId(UUID deviceId);
}
