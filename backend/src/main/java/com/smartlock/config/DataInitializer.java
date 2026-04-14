package com.smartlock.config;

import com.smartlock.model.AccessLog;
import com.smartlock.model.Device;
import com.smartlock.model.enums.AccessAction;
import com.smartlock.model.enums.AccessMethod;
import com.smartlock.repository.AccessLogRepository;
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

    @Override
    public void run(String... args) throws Exception {
        if (deviceRepository.count() == 0) {
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
            
            System.out.println("Demo data initialized successfully!");
        }
    }
}
