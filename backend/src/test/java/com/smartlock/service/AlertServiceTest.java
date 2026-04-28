package com.smartlock.service;

import com.smartlock.dto.AlertResponseDTO;
import com.smartlock.model.Alert;
import com.smartlock.model.Device;
import com.smartlock.model.User;
import com.smartlock.model.enums.AlertType;
import com.smartlock.repository.AlertRepository;
import com.smartlock.repository.DeviceSettingsRepository;
import com.smartlock.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AlertServiceTest {

    @Mock
    private AlertRepository alertRepository;

    @Mock
    private DeviceSettingsRepository deviceSettingsRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private DeviceAccessService deviceAccessService;

    @Mock
    private SimpMessagingTemplate messagingTemplate;

    @Mock
    private Authentication authentication;

    @InjectMocks
    private AlertService alertService;

    @Captor
    private ArgumentCaptor<AlertResponseDTO> alertPayloadCaptor;

    private Device device;

    @BeforeEach
    void setUp() {
        device = Device.builder()
                .id(UUID.randomUUID())
                .deviceCode("ESP32-ALERT-01")
                .deviceName("Front Door")
                .build();
    }

    @Test
    void processTelemetryAlertsPublishesRealtimeEventWhenGasAlertCreated() {
        when(deviceSettingsRepository.findByDeviceId(device.getId())).thenReturn(Optional.empty());
        when(alertRepository.findTopByDeviceIdAndAlertTypeAndIsResolvedFalseOrderByCreatedAtDesc(device.getId(), AlertType.GAS_LEAK))
                .thenReturn(Optional.empty());
        when(alertRepository.save(any(Alert.class))).thenAnswer(invocation -> {
            Alert saved = invocation.getArgument(0);
            saved.setId(UUID.randomUUID());
            return saved;
        });

        alertService.processTelemetryAlerts(device, 2001, false);

        verify(messagingTemplate).convertAndSend(eq("/topic/alerts"), alertPayloadCaptor.capture());
        verify(messagingTemplate).convertAndSend(eq("/topic/devices/ESP32-ALERT-01/alerts"), any(AlertResponseDTO.class));

        AlertResponseDTO payload = alertPayloadCaptor.getValue();
        assertEquals(AlertType.GAS_LEAK, payload.getAlertType());
        assertEquals("CRITICAL", payload.getSeverity());
        assertFalse(payload.isResolved());
    }

    @Test
    void resolveAlertPublishesRealtimeEventWhenAlertResolved() {
        UUID alertId = UUID.randomUUID();
        User user = User.builder()
                .id(UUID.randomUUID())
                .email("admin@example.com")
                .build();
        Alert alert = Alert.builder()
                .id(alertId)
                .device(device)
                .alertType(AlertType.GAS_LEAK)
                .severity("CRITICAL")
                .message("Abnormal gas levels detected! Value: 1600")
                .sensorValue(1600)
                .isResolved(false)
                .build();

        when(alertRepository.findById(alertId)).thenReturn(Optional.of(alert));
        when(userRepository.findByEmail("admin@example.com")).thenReturn(Optional.of(user));
        when(alertRepository.save(any(Alert.class))).thenAnswer(invocation -> invocation.getArgument(0));
        doNothing().when(deviceAccessService).requireControl(device.getId(), authentication);

        alertService.resolveAlert(alertId, "admin@example.com", authentication);

        verify(messagingTemplate, times(1)).convertAndSend(eq("/topic/alerts"), alertPayloadCaptor.capture());
        verify(messagingTemplate, times(1)).convertAndSend(eq("/topic/devices/ESP32-ALERT-01/alerts"), any(AlertResponseDTO.class));

        AlertResponseDTO payload = alertPayloadCaptor.getValue();
        assertEquals(alertId, payload.getId());
        assertEquals(AlertType.GAS_LEAK, payload.getAlertType());
        assertEquals(device.getId(), payload.getDeviceId());
        assertEquals(user.getId(), alert.getResolvedBy().getId());
        assertEquals(true, payload.isResolved());
    }
}
