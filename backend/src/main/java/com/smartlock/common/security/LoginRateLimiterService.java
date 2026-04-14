package com.smartlock.common.security;

import org.springframework.stereotype.Service;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;
import java.util.Map;

@Service
public class LoginRateLimiterService {

    private static final int MAX_ATTEMPTS = 5;
    private static final long LOCK_TIME_DURATION = TimeUnit.MINUTES.toMillis(15);
    
    private final Map<String, LoginAttempt> attemptsCache = new ConcurrentHashMap<>();

    public boolean isBlocked(String email) {
        LoginAttempt attempt = attemptsCache.get(email);
        if (attempt == null) {
            return false;
        }
        
        if (attempt.getAttempts() >= MAX_ATTEMPTS) {
            if (System.currentTimeMillis() - attempt.getLastAttemptTime() < LOCK_TIME_DURATION) {
                return true;
            } else {
                // Reset after duration
                attemptsCache.remove(email);
            }
        }
        return false;
    }

    public void loginFailed(String email) {
        LoginAttempt attempt = attemptsCache.getOrDefault(email, new LoginAttempt(0, System.currentTimeMillis()));
        attempt.setAttempts(attempt.getAttempts() + 1);
        attempt.setLastAttemptTime(System.currentTimeMillis());
        attemptsCache.put(email, attempt);
    }

    public void loginSucceeded(String email) {
        attemptsCache.remove(email);
    }

    private static class LoginAttempt {
        private int attempts;
        private long lastAttemptTime;

        public LoginAttempt(int attempts, long lastAttemptTime) {
            this.attempts = attempts;
            this.lastAttemptTime = lastAttemptTime;
        }

        public int getAttempts() { return attempts; }
        public void setAttempts(int attempts) { this.attempts = attempts; }
        public long getLastAttemptTime() { return lastAttemptTime; }
        public void setLastAttemptTime(long lastAttemptTime) { this.lastAttemptTime = lastAttemptTime; }
    }
}
