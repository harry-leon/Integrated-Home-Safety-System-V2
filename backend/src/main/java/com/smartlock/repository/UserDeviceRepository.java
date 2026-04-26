package com.smartlock.repository;

import com.smartlock.model.UserDevice;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserDeviceRepository extends JpaRepository<UserDevice, UUID> {

    @EntityGraph(attributePaths = "device")
    List<UserDevice> findByUserId(UUID userId);

    Optional<UserDevice> findByUserIdAndDeviceId(UUID userId, UUID deviceId);
}
