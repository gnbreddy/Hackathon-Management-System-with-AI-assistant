package com.example.ehub.controllers;

import com.example.ehub.dto.AuthDtos.*;
import com.example.ehub.models.Role;
import com.example.ehub.models.User;
import com.example.ehub.repositories.UserRepository;
import com.example.ehub.services.EmailService;
import com.example.ehub.services.JwtService;
import com.example.ehub.services.OtpStore;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final OtpStore otpStore;
    private final EmailService emailService;

    public AuthController(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            OtpStore otpStore,
            EmailService emailService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.otpStore = otpStore;
        this.emailService = emailService;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest req) {
        String email = req.email().trim().toLowerCase();

        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("An account with email '" + email + "' already exists.");
        }

        if (userRepository.existsByRegistrationNumber(req.registrationNumber().trim())) {
            throw new IllegalArgumentException("An account with registration number '" + req.registrationNumber() + "' already exists.");
        }

        Role role = req.role() != null ? req.role() : Role.ROLE_PARTICIPANT;

        User user = new User();
        user.setFullName(req.fullName().trim());
        user.setEmail(email);
        user.setRegistrationNumber(req.registrationNumber().trim().toUpperCase());
        user.setPassword(passwordEncoder.encode(req.password()));
        user.setRole(role);
        user.setVerified(false);

        User savedUser = userRepository.save(user);

        // Generate and dispatch OTP
        String otpCode = otpStore.generateAndStoreOtp(email);
        emailService.sendOtpEmail(email, otpCode);

        // Generate preliminary JWT token
        String token = jwtService.generateToken(savedUser);

        AuthResponse res = new AuthResponse(
                token,
                "Bearer",
                savedUser.getId(),
                savedUser.getFullName(),
                savedUser.getEmail(),
                savedUser.getRegistrationNumber(),
                savedUser.getRole(),
                true,
                "Registration initiated! A 6-digit OTP has been sent to " + email,
                otpCode
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(res);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest req) {
        String email = req.email().trim().toLowerCase();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));

        if (!passwordEncoder.matches(req.password(), user.getPassword())) {
            throw new BadCredentialsException("Invalid email or password");
        }

        String token = jwtService.generateToken(user);

        AuthResponse res = new AuthResponse(
                token,
                "Bearer",
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getRegistrationNumber(),
                user.getRole(),
                !user.isVerified(),
                "Login successful"
        );

        return ResponseEntity.ok(res);
    }

    @GetMapping("/me")
    public ResponseEntity<UserProfileDto> getCurrentUser(@AuthenticationPrincipal User user) {
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        // Fresh lookup
        User fresh = userRepository.findById(user.getId()).orElse(user);
        UserProfileDto dto = new UserProfileDto(
                fresh.getId(),
                fresh.getFullName(),
                fresh.getEmail(),
                fresh.getRegistrationNumber(),
                fresh.getRole(),
                fresh.isVerified()
        );

        return ResponseEntity.ok(dto);
    }
}
