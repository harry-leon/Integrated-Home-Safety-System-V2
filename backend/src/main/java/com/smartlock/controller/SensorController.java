package com.smartlock.controller;

import com.smartlock.dto.DeviceReportDTO;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/telemetry")
public class SensorController {

    @PostMapping("/report")
    public ResponseEntity<Void> reportSensorData(@RequestBody DeviceReportDTO report) {
        return ResponseEntity.ok().build();
    }
}
