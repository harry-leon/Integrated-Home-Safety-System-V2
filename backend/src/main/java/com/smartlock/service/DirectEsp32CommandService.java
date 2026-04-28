package com.smartlock.service;

import com.smartlock.config.DirectCommandProperties;
import com.smartlock.model.Device;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class DirectEsp32CommandService {

    private final DirectCommandProperties properties;

    public boolean sendDoorCommand(Device device, boolean openDoor) {
        if (!properties.isEnabled()) {
            return false;
        }

        String endpoint = properties.getEndpoints().get(device.getDeviceCode());
        if (endpoint == null || endpoint.isBlank()) {
            return false;
        }

        try {
            RestTemplate restTemplate = buildRestTemplate();

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            Map<String, Object> body = new HashMap<>();
            body.put("deviceCode", device.getDeviceCode());
            body.put("commandType", "LOCK_TOGGLE");
            body.put("openDoor", openDoor);
            body.put("value", openDoor ? 1 : 0);

            ResponseEntity<String> response = restTemplate.postForEntity(
                    endpoint,
                    new HttpEntity<>(body, headers),
                    String.class
            );

            boolean ok = response.getStatusCode().is2xxSuccessful();
            if (ok) {
                log.info("Direct ESP32 command success for {} -> {} (status {})",
                        device.getDeviceCode(), endpoint, response.getStatusCode().value());
            } else {
                log.warn("Direct ESP32 command non-2xx for {} -> {} (status {})",
                        device.getDeviceCode(), endpoint, response.getStatusCode().value());
            }
            return ok;
        } catch (Exception ex) {
            log.warn("Direct ESP32 command failed for {} -> {}: {}",
                    device.getDeviceCode(), endpoint, ex.getMessage());
            return false;
        }
    }

    private RestTemplate buildRestTemplate() {
        SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout(properties.getTimeoutMs());
        requestFactory.setReadTimeout(properties.getTimeoutMs());
        return new RestTemplate(requestFactory);
    }
}

