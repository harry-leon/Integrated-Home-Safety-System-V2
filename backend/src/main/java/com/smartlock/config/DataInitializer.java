package com.smartlock.config;

import com.smartlock.model.AccessLog;
import com.smartlock.model.Device;
import com.smartlock.model.enums.AccessAction;
import com.smartlock.model.enums.AccessMethod;
import com.smartlock.repository.AccessLogRepository;
import com.smartlock.repository.AlertRepository;
import com.smartlock.repository.DeviceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final DeviceRepository deviceRepository;
    private final AccessLogRepository accessLogRepository;
    private final AlertRepository alertRepository;

    @Override
    public void run(String... args) throws Exception {
        if (deviceRepository.count() == 0 || accessLogRepository.count() == 0) {
            System.out.println("No devices found, creating demo data...");
            
            Device device = Device.builder()
                    .deviceName("Khóa Cửa Chính (Demo)")
                    .deviceCode("DEMO-LOCK-001")
                    .isOnline(true)
                    .build();
            device = deviceRepository.save(device);
            
            AccessLog log1 = AccessLog.builder()
                    .device(device)
                    .action(AccessAction.UNLOCKED)
                    .method(AccessMethod.FINGERPRINT)
                    .detail("Admin mở cửa bằng vân tay")
                    .createdAt(LocalDateTime.now().minusHours(2))
                    .build();
                    
            AccessLog log2 = AccessLog.builder()
                    .device(device)
                    .action(AccessAction.DENIED)
                    .method(AccessMethod.PASSWORD)
                    .detail("Nhập sai mật mã 3 lần")
                    .createdAt(LocalDateTime.now().minusMinutes(30))
                    .build();
            
            accessLogRepository.save(log1);
            accessLogRepository.save(log2);

            // Add demo alerts
            com.smartlock.model.Alert alert1 = com.smartlock.model.Alert.builder()
                    .device(device)
                    .alertType(com.smartlock.model.enums.AlertType.TAMPER_ALERT)
                    .severity("CRITICAL")
                    .message("Phát hiện tác động vật lý lên khóa")
                    .createdAt(LocalDateTime.now().minusHours(1))
                    .build();

            com.smartlock.model.Alert alert2 = com.smartlock.model.Alert.builder()
                    .device(device)
                    .alertType(com.smartlock.model.enums.AlertType.BATTERY_LOW)
                    .severity("WARNING")
                    .message("Pin yếu - Vui lòng sạc")
                    .createdAt(LocalDateTime.now().minusDays(1))
                    .build();

            alertRepository.save(alert1);
            alertRepository.save(alert2);
            
            System.out.println("Demo data initialized successfully!");
        }
    }
}
