package com.smartlock.config;

import com.smartlock.model.AccessLog;
import com.smartlock.model.Device;
import com.smartlock.model.UserDevice;
import com.smartlock.model.enums.AccessAction;
import com.smartlock.model.enums.AccessMethod;
import com.smartlock.model.enums.UserDevicePermission;
import com.smartlock.model.enums.UserRole;
import com.smartlock.repository.AccessLogRepository;
import com.smartlock.repository.AlertRepository;
import com.smartlock.repository.DeviceRepository;
import com.smartlock.repository.UserDeviceRepository;
import com.smartlock.repository.UserRepository;
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
    private final UserRepository userRepository;
    private final UserDeviceRepository userDeviceRepository;

    @Override
    public void run(String... args) {
        if (deviceRepository.count() > 0 && accessLogRepository.count() > 0) {
            return;
        }

        System.out.println("No devices found, creating demo data...");

        var adminUser = userRepository.findAll().stream()
                .filter(user -> user.getRole() == UserRole.ADMIN)
                .findFirst()
                .orElse(null);

        Device device = Device.builder()
                .deviceName("Khoa Cua Chinh (Demo)")
                .deviceCode("DEMO-LOCK-001")
                .isOnline(true)
                .owner(adminUser)
                .build();
        device = deviceRepository.save(device);

        if (adminUser != null) {
            userDeviceRepository.save(UserDevice.builder()
                    .user(adminUser)
                    .device(device)
                    .permission(UserDevicePermission.OWNER)
                    .build());
        }

        AccessLog log1 = AccessLog.builder()
                .device(device)
                .action(AccessAction.UNLOCKED)
                .method(AccessMethod.FINGERPRINT)
                .detail("Admin mo cua bang van tay")
                .createdAt(LocalDateTime.now().minusHours(2))
                .build();

        AccessLog log2 = AccessLog.builder()
                .device(device)
                .action(AccessAction.DENIED)
                .method(AccessMethod.PASSWORD)
                .detail("Nhap sai mat ma 3 lan")
                .createdAt(LocalDateTime.now().minusMinutes(30))
                .build();

        accessLogRepository.save(log1);
        accessLogRepository.save(log2);

        com.smartlock.model.Alert alert1 = com.smartlock.model.Alert.builder()
                .device(device)
                .alertType(com.smartlock.model.enums.AlertType.TAMPER_ALERT)
                .severity("CRITICAL")
                .message("Phat hien tac dong vat ly len khoa")
                .createdAt(LocalDateTime.now().minusHours(1))
                .build();

        com.smartlock.model.Alert alert2 = com.smartlock.model.Alert.builder()
                .device(device)
                .alertType(com.smartlock.model.enums.AlertType.BATTERY_LOW)
                .severity("WARNING")
                .message("Pin yeu - vui long sac")
                .createdAt(LocalDateTime.now().minusDays(1))
                .build();

        alertRepository.save(alert1);
        alertRepository.save(alert2);

        System.out.println("Demo data initialized successfully!");
    }
}
