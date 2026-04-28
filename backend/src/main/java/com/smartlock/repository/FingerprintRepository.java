package com.smartlock.repository;

import com.smartlock.model.Fingerprint;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface FingerprintRepository extends JpaRepository<Fingerprint, UUID> {
    @EntityGraph(attributePaths = {"device", "registeredBy"})
    List<Fingerprint> findAll();

    @EntityGraph(attributePaths = {"device", "registeredBy"})
    Optional<Fingerprint> findById(UUID id);

    boolean existsByDeviceIdAndFingerSlotId(UUID deviceId, Integer fingerSlotId);
    List<Fingerprint> findByDeviceIdOrderByFingerSlotIdAsc(UUID deviceId);
}
