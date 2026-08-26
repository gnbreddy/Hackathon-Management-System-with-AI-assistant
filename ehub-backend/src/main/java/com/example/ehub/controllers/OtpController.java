package com.example.ehub.controllers;

import com.example.ehub.dto.AuthDtos.AuthResponse;
import com.example.ehub.dto.AuthDtos.ResendOtpRequest;
import com.example.ehub.dto.AuthDtos.VerifyOtpRequest;
import com.example.ehub.models.User;
import com.example.ehub.repositories.UserRepository;
import com.example.ehub.services.EmailService;
import com.example.ehub.services.JwtService;
import com.example.ehub.services.OtpStore;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class OtpController {

    private final OtpStore otpStore;
    private final UserRepository userRepository;
    private final EmailService emailService;
    private final JwtService jwtService;

    public OtpController(
            OtpStore otpStore,
            UserRepository userRepository,
            EmailService emailService,
            JwtService jwtService) {
        this.otpStore = otpStore;
        this.userRepository = userRepository;
        this.emailService = emailService;
        this.jwtService = jwtService;
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<AuthResponse> verifyOtp(@Valid @RequestBody VerifyOtpRequest req) {
        String email = req.email().trim().toLowerCase();

        boolean verified = otpStore.verifyOtp(email, req.otpCode());
        if (!verified) {
            throw new IllegalArgumentException("Invalid or expired OTP verification code.");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + email));

        user.setVerified(true);
        User savedUser = userRepository.save(user);

        String token = jwtService.generateToken(savedUser);

        AuthResponse res = new AuthResponse(
                token,
                "Bearer",
                savedUser.getId(),
                savedUser.getFullName(),
                savedUser.getEmail(),
                savedUser.getRegistrationNumber(),
                savedUser.getRole(),
                false,
                "Email successfully verified!"
        );

        return ResponseEntity.ok(res);
    }

    @PostMapping("/resend-otp")
    public ResponseEntity<Map<String, String>> resendOtp(@Valid @RequestBody ResendOtpRequest req) {
        String email = req.email().trim().toLowerCase();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + email));

        String otp = otpStore.generateAndStoreOtp(email);
        emailService.sendOtpEmail(email, otp);

        return ResponseEntity.ok(Map.of(
                "message", "A new 6-digit OTP has been sent to " + email,
                "email", email
        ));
    }
}
