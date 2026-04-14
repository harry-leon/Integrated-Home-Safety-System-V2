package com.smartlock.event;

import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Component
@Slf4j
public class AuditLogListener {

    @EventListener
    public void handleAuditLog(AuditLogEvent event) {
        log.info("[AUDIT HOOK] User: {} | Action: {} | Details: {}", 
            event.getUser(), event.getAction(), event.getDetails());
    }
}
