package com.smartlock.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

@Component
@ConfigurationProperties(prefix = "command.direct")
@Getter
@Setter
public class DirectCommandProperties {

    private boolean enabled = false;
    private int timeoutMs = 2500;
    private Map<String, String> endpoints = new HashMap<>();
}

