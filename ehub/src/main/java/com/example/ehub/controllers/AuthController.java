package com.example.ehub.controllers;

import java.util.Optional;

import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import com.example.ehub.models.Role;
import com.example.ehub.models.User;
import com.example.ehub.models.UserStatus;
import com.example.ehub.repositories.UserRepository;
import com.example.ehub.services.EmailService;
import com.example.ehub.services.JwtService;
import com.example.ehub.services.OtpStore;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final OtpStore otpStore;
    private final EmailService emailService;

    public AuthController(UserRepository userRepository, PasswordEncoder passwordEncoder,
            JwtService jwtService, OtpStore otpStore, EmailService emailService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.otpStore = otpStore;
        this.emailService = emailService;
    }

    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody RegisterDto request) {
        // Determine role from email domain
        String email = request.email().toLowerCase().trim();
        Role role;
        if (email.endsWith("@vitap.ac.in")) {
            role = Role.ORGANIZER;
        } else if (email.endsWith("@vitapstudent.ac.in")) {
            role = Role.PARTICIPANT;
        } else {
            return ResponseEntity.badRequest().body(
                    "Registration is restricted to VIT-AP email addresses. " +
                            "Use @vitap.ac.in (organizer) or @vitapstudent.ac.in (participant).");
        }

        if (userRepository.existsByUsername(request.username())) {
            return ResponseEntity.badRequest().body("Username already taken.");
        }
        if (userRepository.existsByEmail(email)) {
            return ResponseEntity.badRequest().body("Email already registered.");
        }

        User user = new User();
        user.setUsername(request.username());
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setRole(role);
        user.setFullName(request.fullName());
        user.setEmail(email);
        user.setRegistrationNumber(request.registrationNumber());
        user.setStatus(UserStatus.PENDING);
        userRepository.save(user);

        String otp = otpStore.generate(email);
        emailService.sendOtp(email, otp);

        return ResponseEntity
                .ok("Registration successful! An OTP has been sent to " + email + ". Please verify within 60 minutes.");
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<String> verifyOtp(@RequestBody VerifyOtpDto request) {
        String email = request.email().toLowerCase().trim();
        Optional<User> userOpt = userRepository.findByEmail(email);

        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("No account found for this email.");
        }

        if (!otpStore.validate(email, request.otp())) {
            return ResponseEntity.badRequest().body("Invalid or expired OTP. Please try registering again.");
        }

        User user = userOpt.get();
        user.setStatus(UserStatus.ACTIVE);
        userRepository.save(user);

        return ResponseEntity.ok("Email verified successfully! You can now log in.");
    }

    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody LoginDto request) {
        Optional<User> userOpt = userRepository.findByUsername(request.username());

        if (userOpt.isEmpty()) {
            return ResponseEntity.status(401).body("Invalid credentials.");
        }

        User user = userOpt.get();

        if (user.getStatus() == UserStatus.PENDING) {
            return ResponseEntity.status(403).body("Account not verified. Please check your email for the OTP.");
        }

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            return ResponseEntity.status(401).body("Invalid credentials.");
        }

        String token = jwtService.generateToken(user);
        return ResponseEntity.ok(token);
    }
}

record RegisterDto(String username, String password, String fullName, String email, String registrationNumber) {
}

record VerifyOtpDto(String email, String otp) {
}

record LoginDto(String username, String password) {
}