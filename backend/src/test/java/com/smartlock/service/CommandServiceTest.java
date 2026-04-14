package com.smartlock.service;

import com.smartlock.model.Device;
import com.smartlock.model.DeviceCommand;
import com.smartlock.model.enums.CommandStatus;
import com.smartlock.repository.DeviceCommandRepository;
import com.smartlock.repository.DeviceRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CommandServiceTest {

    @Mock
    private DeviceCommandRepository commandRepository;

    @Mock
    private DeviceRepository deviceRepository;

    @Mock
    private SimpMessagingTemplate messagingTemplate;

    @Mock
    private BlynkService blynkService;

    @Mock
    private ApplicationEventPublisher eventPublisher;

    @InjectMocks
    private CommandService commandService;

    private Device device;
    private UUID deviceId;

    @BeforeEach
    void setUp() {
        deviceId = UUID.randomUUID();
        device = Device.builder()
                .id(deviceId)
                .deviceCode("DEV001")
                .isOnline(true)
                .build();
    }

    @Test
    void testSendCommand_WhenDeviceOnline_ShouldExecuteImmediately() {
        when(deviceRepository.findById(deviceId)).thenReturn(Optional.of(device));
        when(commandRepository.save(any(DeviceCommand.class))).thenAnswer(invocation -> {
            DeviceCommand c = invocation.getArgument(0);
            if (c.getId() == null) c.setId(UUID.randomUUID());
            return c;
        });

        UUID commandId = commandService.sendCommand(deviceId, "LOCK_TOGGLE", "{}");

        assertNotNull(commandId);
        verify(blynkService, times(1)).updateVirtualPin(eq(10), anyString());
        verify(commandRepository, atLeastOnce()).save(any(DeviceCommand.class));
    }

    @Test
    void testSendCommand_WhenDeviceOffline_ShouldQueueAsPendingOffline() {
        device.setOnline(false);
        when(deviceRepository.findById(deviceId)).thenReturn(Optional.of(device));
        when(commandRepository.save(any(DeviceCommand.class))).thenAnswer(invocation -> {
            DeviceCommand c = invocation.getArgument(0);
            if (c.getId() == null) c.setId(UUID.randomUUID());
            return c;
        });

        UUID commandId = commandService.sendCommand(deviceId, "LOCK_TOGGLE", "{}");

        assertNotNull(commandId);
        ArgumentCaptor<DeviceCommand> commandCaptor = ArgumentCaptor.forClass(DeviceCommand.class);
        verify(commandRepository).save(commandCaptor.capture());
        assertEquals(CommandStatus.PENDING_OFFLINE, commandCaptor.getValue().getStatus());
        verify(blynkService, never()).updateVirtualPin(anyInt(), anyString());
    }

    @Test
    void testAcknowledgeCommand_ShouldUpdateStatus() {
        UUID commandId = UUID.randomUUID();
        DeviceCommand command = DeviceCommand.builder()
                .id(commandId)
                .device(device)
                .status(CommandStatus.SENT)
                .build();

        when(commandRepository.findById(commandId)).thenReturn(Optional.of(command));

        commandService.acknowledgeCommand(commandId, true, null);

        assertEquals(CommandStatus.SUCCESS, command.getStatus());
        verify(commandRepository).save(command);
    }
}
