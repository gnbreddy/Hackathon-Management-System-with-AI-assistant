package com.example.ehub.services;

import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class OtpStore {

    private record OtpEntry(String otp, LocalDateTime expiry) {
    }

    private final Map<String, OtpEntry> store = new ConcurrentHashMap<>();
    private final SecureRandom random = new SecureRandom();

    /**
     * Generates and stores a 6-digit OTP valid for 60 minutes.
     * 
     * @return the generated OTP string
     */
    public String generate(String email) {
        String otp = String.format("%06d", random.nextInt(1_000_000));
        store.put(email.toLowerCase(), new OtpEntry(otp, LocalDateTime.now().plusHours(1)));
        return otp;
    }

    /**
     * Validates the OTP for a given email. Returns true if correct and not expired.
     * Consumes the OTP on success (cannot be reused).
     */
    public boolean validate(String email, String otp) {
        OtpEntry entry = store.get(email.toLowerCase());
        if (entry == null)
            return false;
        if (LocalDateTime.now().isAfter(entry.expiry())) {
            store.remove(email.toLowerCase());
            return false;
        }
        if (!entry.otp().equals(otp))
            return false;
        store.remove(email.toLowerCase()); // Consume OTP
        return true;
    }
}
