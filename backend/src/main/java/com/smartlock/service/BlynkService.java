package com.smartlock.service;

import com.smartlock.model.Device;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

@Service
@Slf4j
public class BlynkService {

    public static final int DOOR_CONTROL_PIN = 20;

    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${blynk.auth-token:YOUR_AUTH_TOKEN}")
    private String authToken;

    @Value("${blynk.base-url:https://blynk.cloud/external/api}")
    private String baseUrl;

    public boolean sendDoorCommand(Device device, boolean openDoor) {
        String tokenToUse = device.getProviderToken() == null || device.getProviderToken().isBlank()
                ? authToken
                : device.getProviderToken();

        return updateVirtualPin(DOOR_CONTROL_PIN, openDoor ? "1" : "0", tokenToUse);
    }

    public boolean updateVirtualPin(int pin, String value) {
        return updateVirtualPin(pin, value, authToken);
    }

    private boolean updateVirtualPin(int pin, String value, String token) {
        try {
            String url = UriComponentsBuilder
                    .fromHttpUrl(baseUrl + "/update")
                    .queryParam("token", token)
                    .queryParam("V" + pin, value)
                    .toUriString();
            restTemplate.getForObject(url, String.class);
            log.info("Blynk update success: Pin V{} = {}", pin, value);
            return true;
        } catch (Exception e) {
            log.error("Failed to update Blynk pin V{}: {}", pin, e.getMessage());
            return false;
        }
    }

    public String getVirtualPin(int pin) {
        try {
            String url = UriComponentsBuilder
                    .fromHttpUrl(baseUrl + "/get")
                    .queryParam("token", authToken)
                    .queryParam("V" + pin, "")
                    .toUriString()
                    .replace("%3D", "");
            return restTemplate.getForObject(url, String.class);
        } catch (Exception e) {
            log.error("Failed to get Blynk pin V{}: {}", pin, e.getMessage());
            return null;
        }
    }
}
