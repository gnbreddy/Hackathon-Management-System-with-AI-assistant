package com.example.ehub.controllers;

import com.example.ehub.dto.AuthDtos.*;
import com.example.ehub.models.Role;
import com.example.ehub.models.Team;
import com.example.ehub.models.User;
import com.example.ehub.repositories.SubmissionRepository;
import com.example.ehub.repositories.TeamRepository;
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
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final TeamRepository teamRepository;
    private final SubmissionRepository submissionRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final OtpStore otpStore;
    private final EmailService emailService;

    public AuthController(
            UserRepository userRepository,
            TeamRepository teamRepository,
            SubmissionRepository submissionRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            OtpStore otpStore,
            EmailService emailService) {
        this.userRepository = userRepository;
        this.teamRepository = teamRepository;
        this.submissionRepository = submissionRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.otpStore = otpStore;
        this.emailService = emailService;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest req) {
        String email = req.email().trim().toLowerCase();

        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("An account with email '" + email + "' already exists. If you forgot your password, use 'Forgot Password' on the sign-in page to reset.");
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
                "Registration initiated! A 6-digit OTP has been sent to " + email
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(res);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest req) {
        String email = req.email().trim().toLowerCase();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password. If you forgot your password, please use the 'Forgot Password' option below."));

        if (!passwordEncoder.matches(req.password(), user.getPassword())) {
            throw new BadCredentialsException("Invalid email or password. If you forgot your password, please use the 'Forgot Password' option below.");
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

    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, String>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest req) {
        String email = req.email().trim().toLowerCase();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("No registered account found with email '" + email + "'."));

        String otp = otpStore.generateAndStoreOtp(email);
        emailService.sendOtpEmail(email, otp);

        return ResponseEntity.ok(Map.of(
                "message", "A 6-digit verification code has been dispatched to " + email + ". Please check your inbox.",
                "email", email
        ));
    }

    @Transactional
    @PostMapping("/reset-account-verify")
    public ResponseEntity<Map<String, String>> resetAccountVerify(@Valid @RequestBody ResetAccountVerifyRequest req) {
        String email = req.email().trim().toLowerCase();

        boolean verified = otpStore.verifyOtp(email, req.otpCode().trim());
        if (!verified) {
            throw new IllegalArgumentException("Invalid or expired OTP verification code. Existing account credentials remain unchanged.");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("No registered account found with email '" + email + "'."));

        // Clean up any team memberships safely
        List<Team> userTeams = teamRepository.findTeamsByUser(user);
        for (Team team : userTeams) {
            team.getMembers().removeIf(m -> m.getId().equals(user.getId()));
            if (team.getLeader() != null && team.getLeader().getId().equals(user.getId())) {
                if (!team.getMembers().isEmpty()) {
                    team.setLeader(team.getMembers().iterator().next());
                    teamRepository.save(team);
                } else {
                    submissionRepository.findByTeamId(team.getId()).ifPresent(submissionRepository::delete);
                    teamRepository.delete(team);
                }
            } else {
                teamRepository.save(team);
            }
        }

        // Delete user record so user can cleanly re-register
        userRepository.delete(user);

        return ResponseEntity.ok(Map.of(
                "message", "Account credentials reset successfully! You may now re-register with your academic email.",
                "email", email
        ));
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
