package com.smartlock.event;

import lombok.Getter;
import org.springframework.context.ApplicationEvent;

@Getter
public class AuditLogEvent extends ApplicationEvent {
    private final String action;
    private final String details;
    private final String user;

    public AuditLogEvent(Object source, String action, String details, String user) {
        super(source);
        this.action = action;
        this.details = details;
        this.user = user;
    }
}
