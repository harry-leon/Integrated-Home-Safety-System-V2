package com.smartlock.repository;

import com.smartlock.model.FaceRecognition;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface FaceRecognitionRepository extends JpaRepository<FaceRecognition, UUID> {
    List<FaceRecognition> findByDeviceId(UUID deviceId);
}
