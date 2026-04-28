package com.smartlock.controller;

import com.smartlock.dto.DeviceReportDTO;
import com.smartlock.service.DeviceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/telemetry")
@RequiredArgsConstructor
public class SensorController {

    private final DeviceService deviceService;
    private final SimpMessagingTemplate messagingTemplate;

    @GetMapping("/report")
    public ResponseEntity<Map<String, Object>> describeTelemetryEndpoint() {
        return ResponseEntity.ok(Map.of(
                "message", "Use POST /api/telemetry/report to submit device telemetry.",
                "example", Map.of(
                        "deviceCode", "SL-FRONT-001",
                        "gasValue", 120,
                        "ldrValue", 420,
                        "pirTriggered", false,
                        "temperature", 29.5,
                        "weatherDesc", "clear sky"
                )
        ));
    }

    @PostMapping("/report")
    public ResponseEntity<Void> reportSensorData(@RequestBody DeviceReportDTO report) {
        var sensorData = deviceService.recordSensorData(report);
        messagingTemplate.convertAndSend("/topic/devices/" + report.getDeviceCode() + "/telemetry", telemetryPayload(report.getDeviceCode(), sensorData));
        return ResponseEntity.accepted().build();
    }

    private Map<String, Object> telemetryPayload(String deviceCode, com.smartlock.model.SensorData sensorData) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("deviceCode", deviceCode);
        payload.put("gasValue", sensorData.getGasValue());
        payload.put("ldrValue", sensorData.getLdrValue());
        payload.put("pirTriggered", sensorData.isPirTriggered());
        payload.put("temperature", sensorData.getTemperature());
        payload.put("weatherDesc", sensorData.getWeatherDesc());
        payload.put("recordedAt", sensorData.getRecordedAt());
        return payload;
    }
}
