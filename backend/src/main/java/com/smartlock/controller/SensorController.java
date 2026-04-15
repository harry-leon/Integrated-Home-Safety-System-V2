package com.smartlock.controller;

import com.smartlock.dto.DeviceReportDTO;
import com.smartlock.service.DeviceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/telemetry")
@RequiredArgsConstructor
public class SensorController {

    private final DeviceService deviceService;
    private final SimpMessagingTemplate messagingTemplate;

    @PostMapping("/report")
    public ResponseEntity<Void> reportSensorData(@RequestBody DeviceReportDTO report) {
        var sensorData = deviceService.recordSensorData(report);
        messagingTemplate.convertAndSend("/topic/devices/" + report.getDeviceCode() + "/telemetry", Map.of(
                "deviceCode", report.getDeviceCode(),
                "gasValue", sensorData.getGasValue(),
                "ldrValue", sensorData.getLdrValue(),
                "pirTriggered", sensorData.isPirTriggered(),
                "temperature", sensorData.getTemperature(),
                "weatherDesc", sensorData.getWeatherDesc(),
                "recordedAt", sensorData.getRecordedAt()
        ));
        return ResponseEntity.accepted().build();
    }
}
