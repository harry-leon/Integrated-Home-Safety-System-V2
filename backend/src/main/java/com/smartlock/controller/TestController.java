package com.smartlock.controller;

import com.smartlock.service.CommandService;
import com.smartlock.repository.DeviceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.UUID;

@RestController
@RequestMapping("/api/test-flow")
@RequiredArgsConstructor
@Slf4j
public class TestController {

    private final CommandService commandService;
    private final DeviceRepository deviceRepository;
    private final BlynkWebhookController webhookController;

    @GetMapping("/run")
    public String testOfflineCommandFlow() {
        try {
            log.info("--- STARTING TEST FLOW ---");
            
            var offlineDeviceOpt = deviceRepository.findByDeviceCode("SL-BACK-002");
            if (offlineDeviceOpt.isEmpty()) {
                return "Test Failed: SL-BACK-002 not found in DB.";
            }
            var device = offlineDeviceOpt.get();

            log.info("Sending LOCK_TOGGLE to offline device...");
            UUID commandId = commandService.sendCommand(device.getId(), "LOCK_TOGGLE", "{}");
            
            log.info("Simulating Webhook (Device comes online)...");
            webhookController.handleBlynkWebhook("SL-BACK-002", "V0", "1");

            log.info("Simulating Webhook (Device sends SUCCESS)...");
            webhookController.handleBlynkWebhook("SL-BACK-002", "V10", commandId.toString() + ":SUCCESS");

            log.info("--- TEST FLOW COMPLETE ---");
            return "Test flow executed successfully! Check Spring Boot Console for Logs.";
        } catch (Exception e) {
            StringBuilder sb = new StringBuilder("Exception: " + e.getMessage() + "\n");
            for (StackTraceElement el : e.getStackTrace()) {
                sb.append(el.toString()).append("\n");
            }
            return sb.toString();
        }
    }
}
