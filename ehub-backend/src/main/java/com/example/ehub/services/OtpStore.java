package com.example.ehub.services;

import org.springframework.stereotype.Component;

import java.security.SecureRandom;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class OtpStore {

    private static final long OTP_VALIDITY_SECONDS = 600; // 10 minutes TTL
    private final SecureRandom secureRandom = new SecureRandom();

    public record OtpEntry(String code, Instant expiresAt) {
        public boolean isExpired() {
            return Instant.now().isAfter(expiresAt);
        }
    }

    private final Map<String, OtpEntry> otpCache = new ConcurrentHashMap<>();

    public String generateAndStoreOtp(String email) {
        String normalizedEmail = email.trim().toLowerCase();
        int randomCode = 100000 + secureRandom.nextInt(900000);
        String code = String.valueOf(randomCode);
        Instant expiresAt = Instant.now().plusSeconds(OTP_VALIDITY_SECONDS);
        otpCache.put(normalizedEmail, new OtpEntry(code, expiresAt));
        return code;
    }

    public boolean verifyOtp(String email, String inputCode) {
        String normalizedEmail = email.trim().toLowerCase();
        OtpEntry entry = otpCache.get(normalizedEmail);
        if (entry == null) {
            return false;
        }
        if (entry.isExpired()) {
            otpCache.remove(normalizedEmail);
            return false;
        }
        if (entry.code().equals(inputCode.trim())) {
            otpCache.remove(normalizedEmail); // One-time use
            return true;
        }
        return false;
    }

    public void removeOtp(String email) {
        otpCache.remove(email.trim().toLowerCase());
    }
}
