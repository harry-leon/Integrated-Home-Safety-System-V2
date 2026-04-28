package com.smartlock.service;

import com.smartlock.dto.DeviceReportDTO;
import com.smartlock.model.Device;
import com.smartlock.model.SensorData;
import com.smartlock.repository.DeviceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
@ConditionalOnProperty(name = "blynk.telemetry-poll-enabled", havingValue = "true")
@RequiredArgsConstructor
@Slf4j
public class BlynkTelemetryPollingService {

    private final BlynkService blynkService;
    private final DeviceRepository deviceRepository;
    private final DeviceService deviceService;
    private final SimpMessagingTemplate messagingTemplate;

    @Value("${blynk.auth-token:}")
    private String globalAuthToken;

    @Value("${blynk.telemetry.gas-pin:" + BlynkService.PIN_GAS_VALUE + "}")
    private int gasPin;

    @Value("${blynk.telemetry.ldr-pin:-1}")
    private int ldrPin;

    @Value("${blynk.telemetry.pir-pin:-1}")
    private int pirPin;

    @Value("${blynk.telemetry.temperature-pin:" + BlynkService.PIN_TEMPERATURE + "}")
    private int temperaturePin;

    @Value("${blynk.telemetry.weather-pin:" + BlynkService.PIN_WEATHER_CONDITION + "}")
    private int weatherPin;

    @Scheduled(
            fixedDelayString = "${blynk.telemetry-poll-ms:5000}",
            initialDelayString = "${blynk.telemetry-initial-delay-ms:5000}"
    )
    public void pollBlynkTelemetry() {
        deviceRepository.findAll().stream()
                .filter(device -> "BLYNK".equalsIgnoreCase(device.getProviderType()))
                .forEach(this::pollDevice);
    }

    private void pollDevice(Device device) {
        String token = resolveToken(device);
        if (token == null || token.isBlank() || "YOUR_AUTH_TOKEN".equals(token)) {
            return;
        }

        try {
            DeviceReportDTO report = new DeviceReportDTO();
            report.setDeviceCode(device.getDeviceCode());

            report.setGasValue(parseInteger(readConfiguredPin(gasPin, token)));
            report.setLdrValue(parseInteger(readConfiguredPin(ldrPin, token)));
            Boolean pirTriggered = parseBoolean(readConfiguredPin(pirPin, token));
            report.setTemperature(parseDouble(readConfiguredPin(temperaturePin, token)));
            report.setWeatherDesc(normalizeBlynkValue(readConfiguredPin(weatherPin, token)));

            if (report.getGasValue() == null
                    && report.getLdrValue() == null
                    && pirTriggered == null
                    && report.getTemperature() == null
                    && report.getWeatherDesc() == null) {
                return;
            }

            SensorData sensorData = deviceService.recordPartialSensorData(report, pirTriggered);
            messagingTemplate.convertAndSend(
                    "/topic/devices/" + device.getDeviceCode() + "/telemetry",
                    telemetryPayload(device.getDeviceCode(), sensorData)
            );
        } catch (Exception e) {
            log.warn("Unable to poll Blynk telemetry for device {}: {}", device.getDeviceCode(), e.getMessage());
        }
    }

    private Map<String, Object> telemetryPayload(String deviceCode, SensorData sensorData) {
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

    private String resolveToken(Device device) {
        return device.getProviderToken() == null || device.getProviderToken().isBlank()
                ? globalAuthToken
                : device.getProviderToken();
    }

    private String readConfiguredPin(int pin, String token) {
        if (pin < 0) {
            return null;
        }
        return normalizeBlynkValue(blynkService.getVirtualPin(pin, token));
    }

    private Integer parseInteger(String value) {
        Double parsed = parseDouble(value);
        return parsed == null ? null : (int) Math.round(parsed);
    }

    private Double parseDouble(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        try {
            return Double.parseDouble(value);
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private Boolean parseBoolean(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        String normalized = value.trim().toLowerCase();
        return "1".equals(normalized)
                || "true".equals(normalized)
                || "high".equals(normalized)
                || "on".equals(normalized)
                || "motion".equals(normalized);
    }

    private String normalizeBlynkValue(String value) {
        if (value == null) {
            return null;
        }
        String normalized = value.trim();
        if (normalized.startsWith("[") && normalized.endsWith("]")) {
            normalized = normalized.substring(1, normalized.length() - 1).trim();
        }
        if (normalized.length() >= 2 && normalized.startsWith("\"") && normalized.endsWith("\"")) {
            normalized = normalized.substring(1, normalized.length() - 1);
        }
        return normalized.isBlank() ? null : normalized;
    }
}
