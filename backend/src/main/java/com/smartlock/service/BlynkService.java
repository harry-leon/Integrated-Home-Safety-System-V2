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

    public static final int PIN_DOOR_CONTROL = 20;
    public static final int PIN_DOOR_STATUS = 30;
    public static final int PIN_ALERT_ENABLE = 40;
    public static final int PIN_GAS_VALUE = 1;
    public static final int PIN_TEST_LED = 2;
    public static final int PIN_LDR_VALUE = 3;
    public static final int PIN_PIR_VALUE = 4;
    public static final int PIN_TEMPERATURE = 50;
    public static final int PIN_WEATHER_CONDITION = 51;
    public static final int PIN_FINGER_ID = 100;
    public static final int PIN_FINGERPRINT_REGISTER = 101;
    public static final int PIN_FINGERPRINT_DELETE = 102;
    public static final int PIN_DISPLAY = 103;
    public static final int PIN_NAME = 104;

    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${blynk.auth-token:YOUR_AUTH_TOKEN}")
    private String authToken;

    @Value("${blynk.base-url:https://blynk.cloud/external/api}")
    private String baseUrl;

    public boolean sendDoorCommand(Device device, boolean openDoor) {
        String tokenToUse = device.getProviderToken() == null || device.getProviderToken().isBlank()
                ? authToken
                : device.getProviderToken();

        return updateVirtualPin(PIN_DOOR_CONTROL, openDoor ? "1" : "0", tokenToUse);
    }

    public boolean updateVirtualPin(int pin, String value) {
        return updateVirtualPin(pin, value, authToken);
    }

    public boolean updateVirtualPin(Device device, int pin, String value) {
        String tokenToUse = device.getProviderToken() == null || device.getProviderToken().isBlank()
                ? authToken
                : device.getProviderToken();
        return updateVirtualPin(pin, value, tokenToUse);
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
        return getVirtualPin(pin, authToken);
    }

    public String getVirtualPin(int pin, String token) {
        try {
            String url = UriComponentsBuilder
                    .fromHttpUrl(baseUrl + "/get")
                    .queryParam("token", token)
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
