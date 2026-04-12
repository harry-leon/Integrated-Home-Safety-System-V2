package com.smartlock.repository;

import com.smartlock.model.Fingerprint;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface FingerprintRepository extends JpaRepository<Fingerprint, UUID> {
}
