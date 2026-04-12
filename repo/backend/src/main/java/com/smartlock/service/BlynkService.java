package com.smartlock.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
@Slf4j
public class BlynkService {

    private final RestTemplate restTemplate = new RestTemplate();

    // Cấu hình mã token được tiêm vào từ application.properties / môi trường biến (Environment variable)
    @Value("${blynk.auth-token}")
    private String authToken;

    @Value("${blynk.base-url:https://blynk.cloud/external/api}")
    private String baseUrl;

    /**
     * Cập nhật giá trị Virtual Pin trên Blynk.
     * Dùng để điều khiển thiết bị (ví dụ: V0 = 1 để mở khóa).
     */
    public void updateVirtualPin(int pin, String value) {
        try {
            String url = String.format("%s/update?token=%s&V%d=%s", baseUrl, authToken, pin, value);
            restTemplate.getForObject(url, String.class);
            log.info("Blynk update success: Pin V{} = {}", pin, value);
        } catch (Exception e) {
            log.error("Failed to update Blynk pin V{}: {}", pin, e.getMessage());
        }
    }

    /**
     * Lấy giá trị hiện tại của Virtual Pin từ Blynk.
     */
    public String getVirtualPin(int pin) {
        try {
            String url = String.format("%s/get?token=%s&V%d", baseUrl, authToken, pin);
            return restTemplate.getForObject(url, String.class);
        } catch (Exception e) {
            log.error("Failed to get Blynk pin V{}: {}", pin, e.getMessage());
            return null;
        }
    }
}
