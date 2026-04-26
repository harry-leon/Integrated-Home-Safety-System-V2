package com.smartlock.repository;

import com.smartlock.model.Device;
import com.smartlock.model.DeviceCommand;
import com.smartlock.model.enums.CommandStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface DeviceCommandRepository extends JpaRepository<DeviceCommand, UUID> {
    List<DeviceCommand> findByDeviceIdAndStatus(UUID deviceId, CommandStatus status);
    List<DeviceCommand> findAllByDeviceAndStatus(Device device, CommandStatus status);
    List<DeviceCommand> findByStatusIn(List<CommandStatus> statuses);
    Optional<DeviceCommand> findTopByDeviceIdOrderByRequestedAtDesc(UUID deviceId);
}
